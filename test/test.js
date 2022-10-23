process.env.NODE_ENV = 'test'
const config = require('config')
const axios = require('axios')
const chalk = require('chalk')
const moment = require('moment')
const express = require('express')
const assert = require('assert').strict
const sireneProcessing = require('../')

describe('Hello world processing', () => {
  const app = express()
  let server
  app.use(express.static('test/resources'))

  before('serve test resources', (cb) => {
    server = app.listen(8087, cb)
  })

  after('stop serving rest resources', (cb) => {
    server.close(cb)
  })

  it('should expose a plugin config schema for super admins', async () => {
    const schema = require('../plugin-config-schema.json')
    assert.ok(schema.properties)
  })

  it('should expose a processing config schema for users', async () => {
    const schema = require('../processing-config-schema.json')
    assert.equal(schema.type, 'object')
  })

  it('should run a task', async function () {
    this.timeout(36000000)

    const axiosInstance = axios.create({
      baseURL: config.dataFairUrl,
      headers: { 'x-apiKey': config.dataFairAPIKey }
    })
    // customize axios errors for shorter stack traces when a request fails
    axiosInstance.interceptors.response.use(response => response, error => {
      if (!error.response) return Promise.reject(error)
      delete error.response.request
      error.response.config = { method: error.response.config.method, url: error.response.config.url, data: error.response.config.data }
      return Promise.reject(error.response)
    })
    const pluginConfig = { pluginMessage: 'Hello' }
    const processingConfig = {
      datasetMode: 'create',
      dataset: { title: 'Sirene test' },
      stockUrl: 'http://localhost:8087/stock.zip'
    }
    const log = {
      step: (msg) => console.log(chalk.blue.bold.underline(`[${moment().format('LTS')}] ${msg}`)),
      error: (msg, extra) => console.log(chalk.red.bold(`[${moment().format('LTS')}] ${msg}`), extra),
      warning: (msg, extra) => console.log(chalk.red(`[${moment().format('LTS')}] ${msg}`), extra),
      info: (msg, extra) => console.log(chalk.blue(`[${moment().format('LTS')}] ${msg}`), extra),
      debug: (msg, extra) => {
        // console.log(`[${moment().format('LTS')}] ${msg}`, extra)
      }
    }
    const patchConfig = async (patch) => {
      console.log('received config patch', patch)
      Object.assign(processingConfig, patch)
    }
    await sireneProcessing.run({ pluginConfig, processingConfig, axios: axiosInstance, log, patchConfig, tmpDir: './data/test' })
    assert.equal(processingConfig.datasetMode, 'update')
    assert.equal(processingConfig.dataset.title, 'Sirene test')
    const datasetId = processingConfig.dataset.id
    assert.ok(datasetId.startsWith('sirene-test'))

    // another execution should update the dataset, not create it
    await new Promise(resolve => setTimeout(resolve, 4000))
    await sireneProcessing.run({ pluginConfig, processingConfig, axios: axiosInstance, log, patchConfig })
    assert.equal(processingConfig.dataset.id, datasetId)
  })
})

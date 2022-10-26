process.env.NODE_ENV = 'test'
const config = require('config')
const express = require('express')
const assert = require('assert').strict
const testUtils = require('@data-fair/processings-test-utils')
const sireneProcessing = require('../')

describe('Sirene processing', () => {
  const app = express()
  let server
  app.use(express.static('test/resources'))

  before('serve test resources', (cb) => {
    server = app.listen(8097, cb)
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

    const context = testUtils.context({
      processingConfig: {
        datasetMode: 'create',
        dataset: { title: 'Sirene établissements test' },
        // datasetMode: 'update',
        // dataset: { id: 'sirene-etablissements-test-3', title: 'Sirene établissements test' },
        stockUrl: 'http://localhost:8097/stock.zip',
        apiSireneAccessToken: config.apiSireneAccessToken,
        apiSireneFilter: 'codeCommuneEtablissement:56260'
      },
      tmpDir: './data/test'
    }, config, false)
    try {
      await sireneProcessing.run(context)
      assert.equal(context.processingConfig.datasetMode, 'update')
      assert.equal(context.processingConfig.dataset.title, 'Sirene établissements test')
      const datasetId = context.processingConfig.dataset.id
      assert.ok(datasetId.startsWith('sirene-etablissements-test'))

      // another execution should update the dataset, not create it
      await new Promise(resolve => setTimeout(resolve, 4000))
      await sireneProcessing.run(context)
      assert.equal(context.processingConfig.dataset.id, datasetId)
    } finally {
      if (context.ws._ws) context.ws._ws.terminate()
    }
  })
})

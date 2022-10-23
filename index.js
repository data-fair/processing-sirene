const path = require('path')
const FormData = require('form-data')
const fs = require('fs-extra')
const { fetch } = require('./src/files')
const datasetBase = require('./src/dataset-base')

// a global variable to manage interruption
let _stopped

// main running method of the task
// pluginConfig: an object matching the schema in plugin-config-schema.json
// processingConfig: an object matching the schema in processing-config-schema.json
// processingId: the id of the processing configuration in @data-fair/processings
// dir: a persistent directory associated to the processing configuration
// tmpDir: a temporary directory that will automatically destroyed after running
// axios: an axios instance configured so that its base url is a data-fair instance and it sends proper credentials
// log: contains async debug/info/warning/error methods to store a log on the processing run
// patchConfig: async method accepting an object to be merged with the configuration
exports.run = async ({ pluginConfig, processingConfig, processingId, dir, tmpDir, axios, log, patchConfig }) => {
  let dataset
  if (processingConfig.datasetMode === 'create') {
    await log.step('Création du jeu de données')
    dataset = (await axios.post('api/v1/datasets', {
      ...datasetBase,
      id: processingConfig.dataset.id,
      title: processingConfig.dataset.title,
      extras: { processingId }
    })).data
    await log.info(`jeu de donnée créé, id="${dataset.id}", title="${dataset.title}"`)
    await patchConfig({ datasetMode: 'update', dataset: { id: dataset.id, title: dataset.title } })

    log.step('Import du dernier fichier stock')
    if (_stopped) return await log.info('interruption demandée')
    const stockFilePath = await fetch(
      log,
      processingConfig.stockUrl || 'https://files.data.gouv.fr/insee-sirene/StockEtablissement_utf8.zip',
      path.join(tmpDir, 'download'),
      false
    )

    log.info('import de l\'archive zip dans le jeu de données créé')
    const form = new FormData()
    form.append('actions', fs.createReadStream(stockFilePath), 'stock.zip')
    const contentLength = await new Promise((resolve, reject) => form.getLength((err, length) => err ? reject(err) : resolve(length)))
    await axios.post(`api/v1/datasets/${dataset.id}/_bulk_lines`, form, {
      params: { lock: true },
      headers: { 'Content-Length': contentLength, ...form.getHeaders() }
    })
  } else if (processingConfig.datasetMode === 'update') {
    await log.step('Vérification du jeu de données')
    dataset = (await axios.get(`api/v1/datasets/${processingConfig.dataset.id}`)).data
    if (!dataset) throw new Error(`le jeu de données n'existe pas, id${processingConfig.dataset.id}`)
    await log.info(`le jeu de donnée existe, id="${dataset.id}", title="${dataset.title}"`)
  }
}

// used to manage interruption
// not required but it is a good practice to prevent incoherent state a smuch as possible
// the run method should finish shortly after calling stop, otherwise the process will be forcibly terminated
// the grace period before force termination is 20 seconds
exports.stop = async () => {
  _stopped = true
}

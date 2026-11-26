const datasetBase = require('./src/dataset-base')
const { loadReferences, prepareEtablissement, toBulkBody, logBulkErrors } = require('./src/etablissements')

// a global variable to manage interruption
let _stopped

// main running method of the task
// pluginConfig: an object matching the schema in plugin-config-schema.json
// processingConfig: an object matching the schema in processing-config-schema.json
// processingId: the id of the processing configuration in @data-fair/processings
// dir: a persistent directory associated to the processing configuration
// tmpDir: a temporary directory that will be automatically destroyed after running
// axios: an axios instance configured so that its base url is a data-fair instance and it sends proper credentials
// log: contains async debug/info/warning/error methods to store a log on the processing run
// patchConfig: async method accepting an object to be merged with the configuration
exports.run = async ({ pluginConfig, processingConfig, processingId, dir, tmpDir, axios, log, patchConfig, ws }) => {
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
    await ws.waitForJournal(dataset.id, 'finalize-end')
  } else if (processingConfig.datasetMode === 'update') {
    await log.step('Vérification du jeu de données')
    dataset = (await axios.get(`api/v1/datasets/${processingConfig.dataset.id}`)).data
    if (!dataset) throw new Error(`le jeu de données n'existe pas, id${processingConfig.dataset.id}`)
    await log.info(`le jeu de donnée existe, id="${dataset.id}", title="${dataset.title}"`)
  }

  await log.step('Récupération de la dernière date de traitement')
  const lastLine = (await axios.get(`/api/v1/datasets/${dataset.id}/lines`, { params: { sort: '-dateDernierTraitementEtablissement', size: 1 } }))
    .data.results[0]
  const start = lastLine && lastLine.dateDernierTraitementEtablissement.split('+')[0]
  if (start) await log.info(`date du dernier traitement : ${start}`)
  else await log.info('pas de date du dernier traitement, toutes les données seront parcourues')

  await log.step('Chargement de données pour enrichissement des lignes')
  const refs = loadReferences()

  // cf https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=Sirene&version=V3&provider=insee#!/Etablissement/findSiretByQ
  await log.step('Interrogation de l\'API Sirene')
  const bulkSize = 1000 // max is 1000
  const filters = []
  if (processingConfig.apiSireneFilter) filters.push(processingConfig.apiSireneFilter)
  if (start) filters.push(`dateDernierTraitementEtablissement:[${start} TO *]`)
  const q = filters.length === 1 ? filters[0] : filters.map(f => `(${f})`).join(' AND ')
  await log.info(`création d'un curseur long avec lots de ${bulkSize} lignes, filtre q=${q}`)
  let curseurSuivant = '*'
  let nbDone = 0
  await log.task('transfert des établissements vers le jeu de données')
  const iterate = async () => {
    const url = new URL('https://api.insee.fr/api-sirene/3.11/siret')
    // WARNING do not use axios "params" the tomcat server does not accept brackets and axios does not escape them
    url.search = new URLSearchParams({
      tri: 'dateDernierTraitementEtablissement',
      q,
      nombre: bulkSize,
      curseur: curseurSuivant
    }).toString()
    await log.debug(`API request ${url.href}`)
    const sireneApiRes = await axios.get(url.href, {
      headers: {
        'X-INSEE-Api-Key-Integration': processingConfig.apiSireneAccessToken
      }
    })
    const etabs = sireneApiRes.data.etablissements
    for (const etab of etabs) await prepareEtablissement(etab, refs, log)
    const bulkRes = (await axios.post(`api/v1/datasets/${processingConfig.dataset.id}/_bulk_lines`, toBulkBody(etabs), { headers: { 'content-type': 'text/csv+gzip' } })).data
    await logBulkErrors(bulkRes, etabs, log)
    nbDone += etabs.length
    // console.log('progress', nbDone, sireneApiRes.data.header)
    await log.progress('transfert des établissements vers le jeu de données', nbDone, sireneApiRes.data.header.total)
    if (sireneApiRes.data.header.curseurSuivant === sireneApiRes.data.header.curseur) {
      log.info('fin du curseur')
      return false
    }
    curseurSuivant = sireneApiRes.data.header.curseurSuivant
    return true
  }

  while (true) {
    if (_stopped) {
      await log.warning('interrompu proprement pendant entre 2 lots d\'établissements')
      break
    }
    const [keepGoing] = await Promise.all([
      iterate(),
      new Promise(resolve => setTimeout(resolve, 2100)) // respect rate limiting of 30 reqs per minute
    ])
    if (!keepGoing) break
  }
}

// used to manage interruption
// not required but it is a good practice to prevent incoherent state a smuch as possible
// the run method should finish shortly after calling stop, otherwise the process will be forcibly terminated
// the grace period before force termination is 20 seconds
exports.stop = async () => {
  _stopped = true
}

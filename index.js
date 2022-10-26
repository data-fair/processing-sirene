const zlib = require('zlib')
const csvStringify = require('csv-stringify/sync').stringify
const datasetBase = require('./src/dataset-base')
const acceptedKeys = datasetBase.schema.map(s => s.key)
// console.log('acceptedKeys', acceptedKeys)

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

  await log.step('Récupération des modifications de la dernière date de traitement')
  const lastLine = (await axios.get(`/api/v1/datasets/${dataset.id}/lines`, { params: { sort: '-dateDernierTraitementEtablissement', size: 1 } }))
    .data.results[0]
  const start = lastLine && lastLine.dateDernierTraitementEtablissement.split('+')[0]
  if (start) log.info('date du dernier traitement', start)
  else log.info('pas de date du dernier traitement, toutes les données seront parcourues')

  // cf https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=Sirene&version=V3&provider=insee#!/Etablissement/findSiretByQ
  await log.step('Interrogation de l\'API Sirene')
  const bulkSize = 1000 // max is 1000
  await log.info(`création d'un curseur long avec lots de ${bulkSize} lignes`)
  let curseurSuivant = '*'
  let nbDone = 0
  await log.task('transfert des établissements vers le jeu de données')
  const filters = []
  if (processingConfig.apiSireneFilter) filters.push(processingConfig.apiSireneFilter)
  if (start) filters.push(`dateDernierTraitementEtablissement:[${start} TO *]`)
  const iterate = async () => {
    const sireneApiRes = await axios.get('https://api.insee.fr/entreprises/sirene/V3/siret', {
      params: {
        tri: 'dateDernierTraitementEtablissement',
        q: filters.length === 1 ? filters[0] : filters.map(f => `(${f})`).join(' AND '),
        nombre: bulkSize,
        curseur: curseurSuivant
      },
      headers: {
        Authorization: 'Bearer ' + processingConfig.apiSireneAccessToken
      }
    })
    const etabs = sireneApiRes.data.etablissements
    etabs.forEach(etab => {
      // flatten some properties
      Object.assign(etab, etab.uniteLegale)
      Object.assign(etab, etab.adresseEtablissement)
      Object.assign(etab, etab.adresse2Etablissement)
      const periode = etab.periodesEtablissement.find(p => p.dateFin === null)
      if (periode) Object.assign(etab, periode)
      if (etab.nomenclatureActivitePrincipaleUniteLegale) {
        etab['activitePrincipaleUniteLegale' + etab.nomenclatureActivitePrincipaleUniteLegale] = etab.activitePrincipaleUniteLegale
      }
      if (etab.nomenclatureActivitePrincipaleEtablissement) {
        etab['activitePrincipaleEtablissement' + etab.nomenclatureActivitePrincipaleEtablissement] = etab.activitePrincipaleEtablissement
      }
    })
    const csv = csvStringify(etabs, { columns: acceptedKeys, header: true })
    const bulkRes = (await axios.post(`api/v1/datasets/${processingConfig.dataset.id}/_bulk_lines`, zlib.gzipSync(csv), { headers: { 'content-type': 'text/csv+gzip' } })).data
    if (bulkRes.nbErrors) {
      await log.error(`l'envoi des lignes vers data-fair a rencontré des erreurs ${bulkRes.nbErrors} / ${etabs.length}`, bulkRes.errors[0])
    }
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

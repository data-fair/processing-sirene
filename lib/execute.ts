import type { RunFunction, ProcessingContext } from '@data-fair/lib-common-types/processings.js'
import type { ProcessingConfig } from '#types/processingConfig/index.ts'
import datasetBase from './dataset-base.ts'
import { loadReferences, prepareEtablissement, toBulkBody, logBulkErrors, type Etablissement } from './etablissements.ts'

// the Sirene API allows 30 requests per minute
const minDelayBetweenRequests = 2100
// max page size of the Sirene API
const bulkSize = 1000

let shouldBeStopped = false
export const setShouldBeStopped = (v: boolean) => { shouldBeStopped = v }
export const isStopped = () => shouldBeStopped

export const stop = async (): Promise<void> => { setShouldBeStopped(true) }

type Log = ProcessingContext<ProcessingConfig>['log']

/**
 * The axios of the worker does not retry POST requests: retry the bulks rejected with a 429 or a 5xx.
 * `fn` is a thunk so the request is rebuilt on each attempt.
 */
export const withRetry = async <T>(fn: () => Promise<T>, log: Log, retries = 3, delayMs = 10000): Promise<T> => {
  let attempt = 0
  while (true) {
    try {
      return await fn()
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status
      if (!(status === 429 || status >= 500) || attempt >= retries) throw err
      attempt++
      await log.warning(`data-fair answered ${status}, pause of ${delayMs / 1000}s before retrying (${attempt}/${retries})`)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
}

const getApiKey = (processingConfig: ProcessingConfig, secrets?: Record<string, string>): string => {
  // configurations saved before the key was moved to the secrets still carry it in clear
  const apiKey = secrets?.apiSireneAccessToken || processingConfig.apiSireneAccessToken
  if (!apiKey || apiKey === '********') throw new Error('missing INSEE Sirene API key, save the configuration again with the key')
  return apiKey
}

export const run: RunFunction<ProcessingConfig> = async (context) => {
  const { processingConfig, processingId, secrets, axios, log, patchConfig, ws } = context
  setShouldBeStopped(false)
  const apiKey = getApiKey(processingConfig, secrets)

  let dataset: { id: string, title: string }
  if (processingConfig.datasetMode === 'create') {
    await log.step('Dataset creation')
    dataset = (await axios.post('api/v1/datasets', {
      ...datasetBase,
      title: processingConfig.datasetTitle,
      extras: { processingId }
    })).data
    await log.info(`dataset created, id="${dataset.id}", title="${dataset.title}"`)
    await patchConfig({ datasetMode: 'update', dataset: { id: dataset.id, title: dataset.title } })
    await ws.waitForJournal(dataset.id, 'finalize-end')
  } else {
    await log.step('Dataset check')
    const datasetId = (processingConfig.dataset as { id: string }).id
    dataset = (await axios.get(`api/v1/datasets/${datasetId}`)).data
    if (!dataset) throw new Error(`the dataset does not exist, id=${datasetId}`)
    await log.info(`the dataset exists, id="${dataset.id}", title="${dataset.title}"`)
  }

  await log.step('Last processing date')
  const lastLine = (await axios.get(`api/v1/datasets/${dataset.id}/lines`, { params: { sort: '-dateDernierTraitementEtablissement', size: 1 } }))
    .data.results[0]
  const start: string | undefined = lastLine && lastLine.dateDernierTraitementEtablissement.split('+')[0]
  if (start) await log.info(`last processing date: ${start}`)
  else await log.info('no last processing date, all the establishments will be read')

  await log.step('Reference data used to enrich the lines')
  const refs = loadReferences()

  // cf https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc
  await log.step('Sirene API')
  const filters: string[] = []
  if (processingConfig.apiSireneFilter) filters.push(processingConfig.apiSireneFilter)
  if (start) filters.push(`dateDernierTraitementEtablissement:[${start} TO *]`)
  const q = filters.length === 1 ? filters[0] : filters.map(f => `(${f})`).join(' AND ')
  await log.info(`long cursor with pages of ${bulkSize} lines, filter q=${q}`)
  let curseurSuivant = '*'
  let nbDone = 0
  const task = 'transfer of the establishments to the dataset'
  await log.task(task)
  const iterate = async () => {
    const url = new URL('https://api.insee.fr/api-sirene/3.11/siret')
    // WARNING do not use axios "params": the tomcat server does not accept brackets and axios does not escape them
    url.search = new URLSearchParams({
      tri: 'dateDernierTraitementEtablissement',
      q,
      nombre: String(bulkSize),
      curseur: curseurSuivant
    }).toString()
    await log.debug(`API request ${url.href}`)
    const sireneApiRes = await axios.get(url.href, {
      headers: { 'X-INSEE-Api-Key-Integration': apiKey }
    })
    const etabs: Etablissement[] = sireneApiRes.data.etablissements
    for (const etab of etabs) await prepareEtablissement(etab, refs, log)
    const bulkRes = (await withRetry(() => axios.post(`api/v1/datasets/${dataset.id}/_bulk_lines`, toBulkBody(etabs), { headers: { 'content-type': 'text/csv+gzip' } }), log)).data
    await logBulkErrors(bulkRes, etabs, log)
    nbDone += etabs.length
    await log.progress(task, nbDone, sireneApiRes.data.header.total)
    if (sireneApiRes.data.header.curseurSuivant === sireneApiRes.data.header.curseur) {
      await log.info('end of the cursor')
      return false
    }
    curseurSuivant = sireneApiRes.data.header.curseurSuivant
    return true
  }

  while (true) {
    if (isStopped()) {
      await log.warning('stopped cleanly between 2 pages of establishments')
      break
    }
    const [keepGoing] = await Promise.all([
      iterate(),
      new Promise(resolve => setTimeout(resolve, minDelayBetweenRequests))
    ])
    if (!keepGoing) break
  }
}

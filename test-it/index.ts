import type { ProcessingConfig } from '../types/processingConfig/index.ts'
import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import zlib from 'node:zlib'
import * as sirenePlugin from '../index.ts'
import { withRetry } from '../lib/execute.ts'
import processingConfigSchema from '../processing-config-schema.json' with { type: 'json' }

const etab = (siret: string, date: string) => ({
  siret,
  siren: siret.slice(0, 9),
  dateDernierTraitementEtablissement: date,
  uniteLegale: { categorieJuridiqueUniteLegale: '5710', denominationUniteLegale: 'TEST' },
  adresseEtablissement: { codePostalEtablissement: '56260' },
  periodesEtablissement: [{ dateFin: null, etatAdministratifEtablissement: 'A', activitePrincipaleEtablissement: '62.01Z', nomenclatureActivitePrincipaleEtablissement: 'NAFRev2' }]
})

// a simulated data-fair and Sirene API, behind the axios of the processing context
const fakeContext = (processingConfig: ProcessingConfig, opts: { secrets?: Record<string, string>, lastDate?: string, onPage?: () => void } = {}) => {
  const calls = { sirene: [] as { url: URL, headers: Record<string, string> }[], bulks: [] as string[], datasets: [] as any[], patches: [] as any[], logs: [] as string[] }
  const pages = [
    { header: { total: 3, curseur: '*', curseurSuivant: 'c1' }, etablissements: [etab('11111111100011', '2025-12-05T16:51:57.000'), etab('22222222200022', '2025-12-05T17:00:00.000')] },
    { header: { total: 3, curseur: 'c1', curseurSuivant: 'c1' }, etablissements: [etab('33333333300033', '2025-12-06T08:00:00.000')] }
  ]
  const axios = {
    get: async (url: string, config: any = {}) => {
      if (url.startsWith('https://api.insee.fr/')) {
        const u = new URL(url)
        calls.sirene.push({ url: u, headers: config.headers })
        opts.onPage?.()
        return { data: structuredClone(pages[u.searchParams.get('curseur') === '*' ? 0 : 1]) }
      }
      if (url === 'api/v1/datasets/sirene') return { data: { id: 'sirene', title: 'Sirene' } }
      if (url === 'api/v1/datasets/sirene/lines') {
        assert.deepEqual(config.params, { sort: '-dateDernierTraitementEtablissement', size: 1 })
        return { data: { results: opts.lastDate ? [{ dateDernierTraitementEtablissement: opts.lastDate }] : [] } }
      }
      throw new Error('unexpected GET ' + url)
    },
    post: async (url: string, body: any, config: any = {}) => {
      if (url === 'api/v1/datasets') {
        calls.datasets.push(body)
        return { data: { id: 'sirene', title: body.title } }
      }
      if (url === 'api/v1/datasets/sirene/_bulk_lines') {
        assert.equal(config.headers['content-type'], 'text/csv+gzip')
        calls.bulks.push(zlib.gunzipSync(body).toString())
        return { data: calls.bulks.length === 1 ? { nbOk: 1, nbErrors: 1, errors: [{ line: 1, error: 'rejected' }] } : { nbOk: 1, nbErrors: 0 } }
      }
      throw new Error('unexpected POST ' + url)
    }
  }
  const logFn = (level: string) => async (...args: unknown[]) => { calls.logs.push(`${level} ${args.join(' ')}`) }
  const context = {
    processingConfig,
    processingId: 'processing-test',
    secrets: opts.secrets,
    axios,
    log: { step: logFn('step'), task: logFn('task'), progress: logFn('progress'), info: logFn('info'), debug: logFn('debug'), warning: logFn('warning'), error: logFn('error') },
    patchConfig: async (patch: any) => { calls.patches.push(patch); Object.assign(processingConfig, patch) },
    ws: { waitForJournal: async () => {} },
    tmpDir: '/nonexistent'
  } as never
  return { context, calls }
}

describe('Sirene processing', () => {
  it('should expose a processing config schema for users', () => {
    assert.equal(processingConfigSchema.type, 'object')
  })

  it('should move the INSEE API key to the secrets', async () => {
    const processingConfig: ProcessingConfig = { datasetMode: 'update', dataset: { id: 'sirene' }, apiSireneAccessToken: 'key' }
    const res = await sirenePlugin.prepare({ processingConfig, secrets: {} })
    assert.equal(res.processingConfig?.apiSireneAccessToken, '********')
    assert.equal(res.secrets?.apiSireneAccessToken, 'key')
    const again = await sirenePlugin.prepare({ processingConfig: { ...processingConfig }, secrets: { ...res.secrets } })
    assert.equal(again.secrets?.apiSireneAccessToken, 'key')
    const emptied = await sirenePlugin.prepare({ processingConfig: { ...processingConfig, apiSireneAccessToken: '' }, secrets: { ...res.secrets } })
    assert.equal(emptied.secrets?.apiSireneAccessToken, undefined)
  })

  it('should update a dataset from the last processing date', async () => {
    const { context, calls } = fakeContext(
      { datasetMode: 'update', dataset: { id: 'sirene', title: 'Sirene' }, apiSireneAccessToken: '********', apiSireneFilter: 'codeCommuneEtablissement:56260' },
      { secrets: { apiSireneAccessToken: 'secret-key' }, lastDate: '2025-12-05T13:05:35+01:00' }
    )
    await sirenePlugin.run(context)

    assert.equal(calls.sirene.length, 2)
    assert.equal(calls.sirene[0].headers['X-INSEE-Api-Key-Integration'], 'secret-key')
    assert.equal(calls.sirene[0].url.searchParams.get('q'), '(codeCommuneEtablissement:56260) AND (dateDernierTraitementEtablissement:[2025-12-05T13:05:35 TO *])')
    assert.equal(calls.sirene[0].url.searchParams.get('tri'), 'dateDernierTraitementEtablissement')
    assert.equal(calls.sirene[1].url.searchParams.get('curseur'), 'c1')
    // brackets are escaped, the INSEE server refuses them otherwise
    assert.ok(calls.sirene[0].url.search.includes('%5B'))

    assert.equal(calls.bulks.length, 2)
    const [header, ...lines] = calls.bulks[0].trim().split('\n')
    assert.ok(header.includes('siret') && header.includes('activitePrincipaleEtablissementNAFRev2Libelle'))
    assert.equal(lines.length, 2)
    assert.ok(calls.bulks[0].includes('Programmation informatique'))
    assert.ok(calls.logs.some(l => l.startsWith('error siret 22222222200022 (line 1)')))
    assert.ok(calls.logs.some(l => l === 'progress transfer of the establishments to the dataset 3 3'))
    assert.equal(calls.datasets.length, 0)
  })

  it('should create the dataset then switch to update', async () => {
    const processingConfig: ProcessingConfig = { datasetMode: 'create', datasetTitle: 'Sirene test', apiSireneAccessToken: 'clear-key' }
    const { context, calls } = fakeContext(processingConfig)
    await sirenePlugin.run(context)
    assert.equal(calls.datasets.length, 1)
    assert.equal(calls.datasets[0].title, 'Sirene test')
    assert.equal(calls.datasets[0].isRest, true)
    assert.deepEqual(calls.datasets[0].primaryKey, ['siret'])
    assert.deepEqual(calls.datasets[0].extras, { processingId: 'processing-test' })
    assert.deepEqual(calls.patches, [{ datasetMode: 'update', dataset: { id: 'sirene', title: 'Sirene test' } }])
    // no last date: the whole register is read, with the key of a configuration saved before the secrets
    assert.equal(calls.sirene[0].url.searchParams.get('q'), '')
    assert.equal(calls.sirene[0].headers['X-INSEE-Api-Key-Integration'], 'clear-key')
  })

  it('should stop cleanly between 2 pages', async () => {
    const { context, calls } = fakeContext(
      { datasetMode: 'update', dataset: { id: 'sirene', title: 'Sirene' }, apiSireneAccessToken: 'key' },
      { onPage: () => { sirenePlugin.stop() } }
    )
    await sirenePlugin.run(context)
    assert.equal(calls.sirene.length, 1)
    assert.equal(calls.bulks.length, 1)
    assert.ok(calls.logs.some(l => l.startsWith('warning stopped cleanly')))
  })

  it('should fail without INSEE API key', async () => {
    const { context } = fakeContext({ datasetMode: 'update', dataset: { id: 'sirene' }, apiSireneAccessToken: '********' })
    await assert.rejects(sirenePlugin.run(context), /missing INSEE Sirene API key/)
  })

  it('should retry a POST rejected with a 429 or a 5xx', async () => {
    let attempts = 0
    const warnings: string[] = []
    const log = { warning: async (msg: string) => { warnings.push(msg) } } as never
    const res = await withRetry(async () => {
      attempts++
      if (attempts === 1) throw Object.assign(new Error('429'), { status: 429 })
      if (attempts === 2) throw Object.assign(new Error('502'), { response: { status: 502 } })
      return 'ok'
    }, log, 3, 1)
    assert.equal(res, 'ok')
    assert.equal(attempts, 3)
    assert.equal(warnings.length, 2)
    await assert.rejects(withRetry(async () => { throw Object.assign(new Error('400'), { status: 400 }) }, log, 3, 1), /400/)
  })
})

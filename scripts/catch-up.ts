// One-shot catch-up of a window of dateDernierTraitementEtablissement, run by hand.
//
// The incremental processing restarts from the most recent date already loaded, so the
// establishments the INSEE publishes late with an older date are skipped for good. This script reads
// a window again from the Sirene API and sends to the data-fair dataset only the establishments that
// are missing from it.
//
// Usage:
//   INSEE_API_KEY=... FROM=2025-12-05T13:00:00 TO=2025-12-08T00:00:00 node scripts/catch-up.ts --dry-run
//   INSEE_API_KEY=... DATA_FAIR_API_KEY=... FROM=... TO=... node scripts/catch-up.ts
//   INSEE_API_KEY=... DATA_FAIR_API_KEY=... SIRETS_FILE=sirets.txt node scripts/catch-up.ts
//
// --dry-run sends nothing: it counts the establishments of the window and how many would be sent.
// FROM and TO are local INSEE times (Europe/Paris), without offset.
// SIRETS_FILE replaces FROM and TO: a file with one siret per line, read from the Sirene API by
// batches of 100 (sirets unknown to the API are only counted).
// Optional:
//   FILTER            extra Sirene API filter, e.g. "dateCreationEtablissement:[2024-01-01 TO *]"
//   MAX_SEND          stop before sending more establishments than this (default 5000)
//   --include-changed also send the establishments present with another dateDernierTraitementEtablissement
//                     (an INSEE mass update can make it millions of lines: data-fair extends and indexes
//                     every line of a bulk, about 23 s per 1000 lines)
//   DATA_FAIR_URL     default https://opendata.koumoul.com/data-fair
//   DATASET_ID        default sirene

import fs from 'node:fs'
import { loadReferences, prepareEtablissement, toBulkBody, logBulkErrors, newOrChanged, type Etablissement } from '../lib/etablissements.ts'

const dryRun = process.argv.includes('--dry-run')
const includeChanged = process.argv.includes('--include-changed')
const { INSEE_API_KEY, DATA_FAIR_API_KEY, FROM, TO, FILTER, SIRETS_FILE } = process.env
const maxSend = Number(process.env.MAX_SEND || 5000)
const dataFairUrl = (process.env.DATA_FAIR_URL || 'https://opendata.koumoul.com/data-fair').replace(/\/$/, '')
const datasetId = process.env.DATASET_ID || 'sirene'
const localDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/

const fail = (message: string): never => { console.error(message); process.exit(1) }
if (!INSEE_API_KEY) fail('missing INSEE_API_KEY')
if (!SIRETS_FILE && (!localDate.test(FROM || '') || !localDate.test(TO || ''))) fail('FROM and TO expected as YYYY-MM-DDTHH:MM:SS (local time, without offset), or SIRETS_FILE')
if (!dryRun && !DATA_FAIR_API_KEY) fail('missing DATA_FAIR_API_KEY (or use --dry-run)')
if (!(maxSend > 0)) fail('MAX_SEND must be a positive number')

const log = {
  info: async (msg: string) => console.log(msg),
  error: async (msg: string) => console.error(msg)
}
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const dataFairHeaders: Record<string, string> = DATA_FAIR_API_KEY ? { 'x-apiKey': DATA_FAIR_API_KEY } : {}

// fetch with a few retries on rate limiting
const request = async (url: string | URL, options: RequestInit = {}): Promise<Response> => {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, options)
    if (res.status === 429 && attempt < 5) {
      await sleep(5000 * (attempt + 1))
      continue
    }
    return res
  }
}

// dateDernierTraitementEtablissement of the sirets already in the dataset
const existingDates = async (sirets: string[]) => {
  const dates = new Map<string, string | null>()
  for (let i = 0; i < sirets.length; i += 200) {
    const chunk = sirets.slice(i, i + 200)
    const url = new URL(`${dataFairUrl}/api/v1/datasets/${datasetId}/lines`)
    url.search = new URLSearchParams({ siret_in: chunk.join(','), select: 'siret,dateDernierTraitementEtablissement', size: String(chunk.length) }).toString()
    const res = await request(url, { headers: dataFairHeaders })
    if (!res.ok) throw new Error(`data-fair ${res.status} : ${await res.text()}`)
    for (const line of (await res.json()).results) dates.set(line.siret, line.dateDernierTraitementEtablissement ?? null)
  }
  return dates
}

// one page of the Sirene API, null when nothing matches
const fetchSirene = async (params: Record<string, string>) => {
  const url = new URL('https://api.insee.fr/api-sirene/3.11/siret')
  // the INSEE server does not accept unescaped brackets, URLSearchParams escapes them
  url.search = new URLSearchParams(params).toString()
  const res = await request(url, { headers: { 'X-INSEE-Api-Key-Integration': INSEE_API_KEY as string } })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`API Sirene ${res.status} : ${await res.text()}`)
  return res.json()
}

// pages of establishments: { etabs, total, last }
type Page = { etabs: Etablissement[], total: number, last: boolean }

async function * windowPages (q: string): AsyncGenerator<Page> {
  let curseur = '*'
  while (true) {
    const page = await fetchSirene({ tri: 'dateDernierTraitementEtablissement', q, nombre: '1000', curseur })
    if (!page) { console.log('no establishment in the window'); return }
    const { header, etablissements } = page
    const last = header.curseurSuivant === header.curseur
    yield { etabs: etablissements, total: header.total, last }
    if (last) return
    curseur = header.curseurSuivant
  }
}

async function * siretPages (sirets: string[]): AsyncGenerator<Page> {
  for (let i = 0; i < sirets.length; i += 100) {
    const chunk = sirets.slice(i, i + 100)
    const page = await fetchSirene({ q: chunk.map(s => `siret:${s}`).join(' OR '), nombre: '1000' })
    const etabs = page ? page.etablissements : []
    if (etabs.length < chunk.length) console.log(`${chunk.length - etabs.length} siret(s) unknown to the Sirene API in this batch`)
    yield { etabs, total: sirets.length, last: i + 100 >= sirets.length }
  }
}

const main = async () => {
  const refs = loadReferences()
  let pages: AsyncGenerator<Page>
  if (SIRETS_FILE) {
    const sirets = [...new Set(fs.readFileSync(SIRETS_FILE, 'utf8').split(/\s+/).filter(Boolean))]
    const invalid = sirets.filter(s => !/^\d{14}$/.test(s))
    if (invalid.length) fail(`invalid siret(s) in ${SIRETS_FILE}: ${invalid.slice(0, 5).join(', ')}`)
    console.log(`${dryRun ? '[dry-run] ' : ''}${sirets.length} sirets from ${SIRETS_FILE} → ${dataFairUrl} / ${datasetId}, ${includeChanged ? 'missing or changed' : 'missing only'}, at most ${maxSend} sent`)
    pages = siretPages(sirets)
  } else {
    const filters: string[] = [`dateDernierTraitementEtablissement:[${FROM} TO ${TO}]`]
    if (FILTER) filters.push(FILTER)
    const q = filters.length === 1 ? filters[0] : filters.map(f => `(${f})`).join(' AND ')
    console.log(`${dryRun ? '[dry-run] ' : ''}q=${q} → ${dataFairUrl} / ${datasetId}, ${includeChanged ? 'missing or changed' : 'missing only'}, at most ${maxSend} sent`)
    pages = windowPages(q)
  }
  let nbDone = 0
  let nbToSend = 0
  let nbErrors = 0
  const examples: string[] = []
  let started = Date.now()
  for await (const { etabs, total, last } of pages) {
    const dates = await existingDates(etabs.map(e => e.siret))
    const toSend = includeChanged ? newOrChanged(etabs, dates) : etabs.filter(e => !dates.has(e.siret))
    if (nbToSend + toSend.length > maxSend) {
      console.error(`\nstop: more than ${maxSend} establishments to send (MAX_SEND), ${nbToSend} already counted, ${toSend.length} in this batch not sent`)
      process.exit(1)
    }
    nbToSend += toSend.length
    examples.push(...toSend.slice(0, 20 - examples.length).map(e => e.siret))
    if (!dryRun && toSend.length) {
      for (const etab of toSend) await prepareEtablissement(etab, refs, log)
      const bulk = await request(`${dataFairUrl}/api/v1/datasets/${datasetId}/_bulk_lines`, {
        method: 'POST',
        headers: { ...dataFairHeaders, 'content-type': 'text/csv+gzip' },
        body: new Uint8Array(toBulkBody(toSend))
      })
      if (!bulk.ok) throw new Error(`data-fair ${bulk.status} : ${await bulk.text()}`)
      const bulkRes = await bulk.json()
      nbErrors += bulkRes.nbErrors || 0
      await logBulkErrors(bulkRes, toSend, log)
    }

    nbDone += etabs.length
    console.log(`${nbDone} / ${total} read, ${nbToSend} to send${dryRun ? '' : ' (sent)'}`)
    if (last) break
    // the Sirene API allows 30 requests per minute
    await sleep(Math.max(0, 2100 - (Date.now() - started)))
    started = Date.now()
  }

  console.log(`\n${nbDone} establishments read, ${nbToSend} ${dryRun ? 'to send (nothing sent)' : `sent, ${nbErrors} in error`}`)
  if (examples.length) console.log('examples:', examples.join(', '))
}

main().catch(err => { console.error(err); process.exit(1) })

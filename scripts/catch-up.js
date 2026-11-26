#!/usr/bin/env node
// One-shot catch-up of a window of dateDernierTraitementEtablissement, run by hand.
//
// The incremental processing restarts from the most recent date already loaded, so the
// establishments the INSEE publishes late with an older date are skipped for good. This script reads
// a window again from the Sirene API and sends to the data-fair dataset only the establishments that
// are missing from it.
//
// Usage:
//   INSEE_API_KEY=... FROM=2025-12-05T13:00:00 TO=2025-12-08T00:00:00 node scripts/catch-up.js --dry-run
//   INSEE_API_KEY=... DATA_FAIR_API_KEY=... FROM=... TO=... node scripts/catch-up.js
//   INSEE_API_KEY=... DATA_FAIR_API_KEY=... SIRETS_FILE=sirets.txt node scripts/catch-up.js
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

const { loadReferences, prepareEtablissement, toBulkBody, logBulkErrors, newOrChanged } = require('../src/etablissements')

const dryRun = process.argv.includes('--dry-run')
const includeChanged = process.argv.includes('--include-changed')
const { INSEE_API_KEY, DATA_FAIR_API_KEY, FROM, TO, FILTER, SIRETS_FILE } = process.env
const maxSend = Number(process.env.MAX_SEND || 5000)
const dataFairUrl = (process.env.DATA_FAIR_URL || 'https://opendata.koumoul.com/data-fair').replace(/\/$/, '')
const datasetId = process.env.DATASET_ID || 'sirene'
const localDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/

const fail = (message) => { console.error(message); process.exit(1) }
if (!INSEE_API_KEY) fail('INSEE_API_KEY manquant')
if (!SIRETS_FILE && (!localDate.test(FROM || '') || !localDate.test(TO || ''))) fail('FROM et TO attendus au format AAAA-MM-JJTHH:MM:SS (heure locale, sans décalage)')
if (!dryRun && !DATA_FAIR_API_KEY) fail('DATA_FAIR_API_KEY manquant (ou utiliser --dry-run)')
if (!(maxSend > 0)) fail('MAX_SEND doit être un nombre positif')

const log = {
  info: async (msg) => console.log(msg),
  error: async (msg) => console.error(msg)
}
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const dataFairHeaders = DATA_FAIR_API_KEY ? { 'x-apiKey': DATA_FAIR_API_KEY } : {}

// fetch with a few retries on rate limiting
const request = async (url, options = {}) => {
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
const existingDates = async (sirets) => {
  const dates = new Map()
  for (let i = 0; i < sirets.length; i += 200) {
    const chunk = sirets.slice(i, i + 200)
    const url = new URL(`${dataFairUrl}/api/v1/datasets/${datasetId}/lines`)
    url.search = new URLSearchParams({ siret_in: chunk.join(','), select: 'siret,dateDernierTraitementEtablissement', size: chunk.length }).toString()
    const res = await request(url, { headers: dataFairHeaders })
    if (!res.ok) throw new Error(`data-fair ${res.status} : ${await res.text()}`)
    for (const line of (await res.json()).results) dates.set(line.siret, line.dateDernierTraitementEtablissement ?? null)
  }
  return dates
}

// one page of the Sirene API, null when nothing matches
const fetchSirene = async (params) => {
  const url = new URL('https://api.insee.fr/api-sirene/3.11/siret')
  // the INSEE server does not accept unescaped brackets, URLSearchParams escapes them
  url.search = new URLSearchParams(params).toString()
  const res = await request(url, { headers: { 'X-INSEE-Api-Key-Integration': INSEE_API_KEY } })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`API Sirene ${res.status} : ${await res.text()}`)
  return res.json()
}

// pages of establishments: { etabs, total, last }
async function * windowPages (q) {
  let curseur = '*'
  while (true) {
    const page = await fetchSirene({ tri: 'dateDernierTraitementEtablissement', q, nombre: 1000, curseur })
    if (!page) { console.log('aucun établissement dans la fenêtre'); return }
    const { header, etablissements } = page
    const last = header.curseurSuivant === header.curseur
    yield { etabs: etablissements, total: header.total, last }
    if (last) return
    curseur = header.curseurSuivant
  }
}

async function * siretPages (sirets) {
  for (let i = 0; i < sirets.length; i += 100) {
    const chunk = sirets.slice(i, i + 100)
    const page = await fetchSirene({ q: chunk.map(s => `siret:${s}`).join(' OR '), nombre: 1000 })
    const etabs = page ? page.etablissements : []
    if (etabs.length < chunk.length) console.log(`${chunk.length - etabs.length} siret(s) inconnu(s) de l'API Sirene dans ce lot`)
    yield { etabs, total: sirets.length, last: i + 100 >= sirets.length }
  }
}

const main = async () => {
  const refs = loadReferences()
  let pages
  if (SIRETS_FILE) {
    const sirets = [...new Set(require('fs').readFileSync(SIRETS_FILE, 'utf8').split(/\s+/).filter(Boolean))]
    const invalid = sirets.filter(s => !/^\d{14}$/.test(s))
    if (invalid.length) fail(`siret(s) invalide(s) dans ${SIRETS_FILE} : ${invalid.slice(0, 5).join(', ')}`)
    console.log(`${dryRun ? '[dry-run] ' : ''}${sirets.length} sirets de ${SIRETS_FILE} → ${dataFairUrl} / ${datasetId}, ${includeChanged ? 'absents ou modifiés' : 'absents seulement'}, au plus ${maxSend} envois`)
    pages = siretPages(sirets)
  } else {
    const filters = [`dateDernierTraitementEtablissement:[${FROM} TO ${TO}]`]
    if (FILTER) filters.push(FILTER)
    const q = filters.length === 1 ? filters[0] : filters.map(f => `(${f})`).join(' AND ')
    console.log(`${dryRun ? '[dry-run] ' : ''}q=${q} → ${dataFairUrl} / ${datasetId}, ${includeChanged ? 'absents ou modifiés' : 'absents seulement'}, au plus ${maxSend} envois`)
    pages = windowPages(q)
  }
  let nbDone = 0
  let nbToSend = 0
  let nbErrors = 0
  const examples = []
  let started = Date.now()
  for await (const { etabs, total, last } of pages) {
    const dates = await existingDates(etabs.map(e => e.siret))
    const toSend = includeChanged ? newOrChanged(etabs, dates) : etabs.filter(e => !dates.has(e.siret))
    if (nbToSend + toSend.length > maxSend) {
      console.error(`\narrêt : plus de ${maxSend} établissements à envoyer (MAX_SEND), ${nbToSend} déjà comptés, ${toSend.length} dans ce lot non envoyé`)
      process.exit(1)
    }
    nbToSend += toSend.length
    examples.push(...toSend.slice(0, 20 - examples.length).map(e => e.siret))
    if (!dryRun && toSend.length) {
      for (const etab of toSend) await prepareEtablissement(etab, refs, log)
      const bulk = await request(`${dataFairUrl}/api/v1/datasets/${datasetId}/_bulk_lines`, {
        method: 'POST',
        headers: { ...dataFairHeaders, 'content-type': 'text/csv+gzip' },
        body: toBulkBody(toSend)
      })
      if (!bulk.ok) throw new Error(`data-fair ${bulk.status} : ${await bulk.text()}`)
      const bulkRes = await bulk.json()
      nbErrors += bulkRes.nbErrors || 0
      await logBulkErrors(bulkRes, toSend, log)
    }

    nbDone += etabs.length
    console.log(`${nbDone} / ${total} lus, ${nbToSend} à envoyer${dryRun ? '' : ' (envoyés)'}`)
    if (last) break
    // the Sirene API allows 30 requests per minute
    await sleep(Math.max(0, 2100 - (Date.now() - started)))
    started = Date.now()
  }

  console.log(`\n${nbDone} établissements lus, ${nbToSend} ${dryRun ? 'à envoyer (rien envoyé)' : `envoyés, ${nbErrors} en erreur`}`)
  if (examples.length) console.log('exemples :', examples.join(', '))
}

main().catch(err => { console.error(err); process.exit(1) })

import path from 'node:path'
import fs from 'node:fs'
import zlib from 'node:zlib'
import { stringify } from 'csv-stringify/sync'
import { parse } from 'csv-parse/sync'
import datasetBase from './dataset-base.ts'

/** An establishment of the Sirene API, flattened in place by prepareEtablissement */
export type Etablissement = Record<string, any>

export type References = {
  cjNiv1: Record<string, string>
  cjNiv2: Record<string, string>
  cjNiv3: Record<string, string>
  naf2008: Record<string, Record<string, string>>
}

/** The part of the processing log used here, also implemented by the catch-up script */
export type Log = { error: (msg: string) => Promise<unknown> | unknown }

export type BulkResult = {
  nbErrors?: number
  errors?: { line: number, error?: unknown }[]
}

const acceptedKeys = datasetBase.schema.map(s => s.key)
const resourcesDir = path.join(import.meta.dirname, 'resources')

const readCsv = (file: string): Record<string, string>[] => parse(fs.readFileSync(path.join(resourcesDir, file)), { columns: true, skip_empty_lines: true })

/** Reference tables used to enrich the establishments (legal categories and NAF rev 2 levels) */
export const loadReferences = (): References => {
  const byCode = (rows: Record<string, string>[]) => rows.reduce((a: Record<string, string>, item) => { a[item.Code] = item['Libellé']; return a }, {})
  const naf2008 = readCsv('naf2008.csv').reduce((a: References['naf2008'], item) => {
    a[item.NIV5] = {
      activitePrincipaleEtablissementNAFRev2Libelle: item['Libelle-NIV5'],
      activitePrincipaleEtablissementNAFRev2Niv4: item.NIV4,
      activitePrincipaleEtablissementNAFRev2LibelleNiv4: item['Libelle-NIV4'],
      activitePrincipaleEtablissementNAFRev2Niv3: item.NIV3,
      activitePrincipaleEtablissementNAFRev2LibelleNiv3: item['Libelle-NIV3'],
      activitePrincipaleEtablissementNAFRev2Niv2: item.NIV2,
      activitePrincipaleEtablissementNAFRev2LibelleNiv2: item['Libelle-NIV2'],
      activitePrincipaleEtablissementNAFRev2Niv1: item.NIV1,
      activitePrincipaleEtablissementNAFRev2LibelleNiv1: item['Libelle-NIV1']
    }
    return a
  }, {})
  return {
    cjNiv1: byCode(readCsv('cj/niv1.csv')),
    cjNiv2: byCode(readCsv('cj/niv2.csv')),
    cjNiv3: byCode(readCsv('cj/niv3.csv')),
    naf2008
  }
}

/** Flatten and enrich, in place, an establishment returned by the Sirene API */
export const prepareEtablissement = async (etab: Etablissement, refs: References, log: Log): Promise<Etablissement> => {
  const { cjNiv1, cjNiv2, cjNiv3, naf2008 } = refs
  Object.assign(etab, etab.uniteLegale)
  Object.assign(etab, etab.adresseEtablissement)
  Object.assign(etab, etab.adresse2Etablissement)
  const periode = etab.periodesEtablissement.find((p: Etablissement) => p.dateFin === null)
  if (periode) Object.assign(etab, periode)
  if (etab.nomenclatureActivitePrincipaleUniteLegale) {
    etab['activitePrincipaleUniteLegale' + etab.nomenclatureActivitePrincipaleUniteLegale] = etab.activitePrincipaleUniteLegale
  }
  if (etab.nomenclatureActivitePrincipaleEtablissement) {
    etab['activitePrincipaleEtablissement' + etab.nomenclatureActivitePrincipaleEtablissement] = etab.activitePrincipaleEtablissement
  }
  if (etab.activitePrincipaleEtablissementNAFRev2) {
    if (!naf2008[etab.activitePrincipaleEtablissementNAFRev2]) {
      // 00.00Z is a temporary code used while waiting for assignment
      if (etab.activitePrincipaleEtablissementNAFRev2 !== '00.00Z') {
        await log.error('unknown code of the NAF rev 2 nomenclature: ' + etab.activitePrincipaleEtablissementNAFRev2)
      }
    } else {
      Object.assign(etab, naf2008[etab.activitePrincipaleEtablissementNAFRev2])
    }
  }
  if (etab.categorieJuridiqueUniteLegale) {
    if (!cjNiv1[etab.categorieJuridiqueUniteLegale.slice(0, 1)]) {
      await log.error('unknown code of the legal categories nomenclature: ' + etab.categorieJuridiqueUniteLegale)
    } else {
      etab.categorieJuridiqueUniteLegaleLibelleNiv1 = cjNiv1[etab.categorieJuridiqueUniteLegale.slice(0, 1)]
      etab.categorieJuridiqueUniteLegaleLibelleNiv2 = cjNiv2[etab.categorieJuridiqueUniteLegale.slice(0, 2)] || etab.categorieJuridiqueUniteLegaleLibelleNiv1
      etab.categorieJuridiqueUniteLegaleLibelle = cjNiv3[etab.categorieJuridiqueUniteLegale] || etab.categorieJuridiqueUniteLegaleLibelleNiv2
    }
  }
  return etab
}

/** Gzipped CSV body for the _bulk_lines endpoint of data-fair */
export const toBulkBody = (etabs: Etablissement[]): Buffer => zlib.gzipSync(stringify(etabs, { columns: acceptedKeys, header: true }))

/** Log every line rejected by data-fair (capped), not only the first one */
export const logBulkErrors = async (bulkRes: BulkResult, etabs: Etablissement[], log: Log, max = 50): Promise<void> => {
  if (!bulkRes.nbErrors) return
  await log.error(`data-fair rejected lines: ${bulkRes.nbErrors} / ${etabs.length}`)
  for (const error of (bulkRes.errors || []).slice(0, max)) {
    const siret = etabs[error.line]?.siret
    await log.error(`siret ${siret} (line ${error.line}): ${JSON.stringify(error.error ?? error)}`)
  }
}

/**
 * Local INSEE time of a dateDernierTraitementEtablissement, the INSEE returns it without offset
 * and data-fair stores it with the Europe/Paris offset
 */
const localTime = (date: unknown) => date ? String(date).slice(0, 19) : null

/**
 * Keep the establishments that are missing from the dataset or whose dateDernierTraitementEtablissement
 * differs: sending an unchanged line is not free, data-fair extends and indexes again every line of a
 * small bulk, modified or not
 */
export const newOrChanged = (etabs: Etablissement[], existingDates: Map<string, string | null>): Etablissement[] => etabs.filter(etab => {
  const existing = existingDates.get(etab.siret)
  return existing === undefined || localTime(existing) !== localTime(etab.dateDernierTraitementEtablissement)
})

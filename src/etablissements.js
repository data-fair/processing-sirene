const path = require('path')
const fs = require('fs')
const zlib = require('zlib')
const csvStringify = require('csv-stringify/sync').stringify
const csvParse = require('csv-parse/sync').parse
const datasetBase = require('./dataset-base')

const acceptedKeys = datasetBase.schema.map(s => s.key)
const resourcesDir = path.join(__dirname, '../resources')

const readCsv = (file) => csvParse(fs.readFileSync(path.join(resourcesDir, file)), { columns: true, skip_empty_lines: true })

// reference tables used to enrich the establishments (legal categories and NAF rev 2 levels)
exports.loadReferences = () => {
  const byCode = (rows) => rows.reduce((a, item) => { a[item.Code] = item['Libellé']; return a }, {})
  const naf2008 = readCsv('naf2008.csv').reduce((a, item) => {
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

// flatten and enrich, in place, an establishment returned by the Sirene API
exports.prepareEtablissement = async (etab, refs, log) => {
  const { cjNiv1, cjNiv2, cjNiv3, naf2008 } = refs
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
  if (etab.activitePrincipaleEtablissementNAFRev2) {
    if (!naf2008[etab.activitePrincipaleEtablissementNAFRev2]) {
      // 00.00Z is a temporary code used while waiting for assignment
      if (etab.activitePrincipaleEtablissementNAFRev2 !== '00.00Z') {
        await log.error('code inconnu de la nomenclature NAF ref 2 : ' + etab.activitePrincipaleEtablissementNAFRev2)
      }
    } else {
      Object.assign(etab, naf2008[etab.activitePrincipaleEtablissementNAFRev2])
    }
  }
  if (etab.categorieJuridiqueUniteLegale) {
    if (!cjNiv1[etab.categorieJuridiqueUniteLegale.slice(0, 1)]) {
      await log.error('code inconnu de la nomenclature des catégories juridiques : ' + etab.categorieJuridiqueUniteLegale)
    } else {
      etab.categorieJuridiqueUniteLegaleLibelleNiv1 = cjNiv1[etab.categorieJuridiqueUniteLegale.slice(0, 1)]
      etab.categorieJuridiqueUniteLegaleLibelleNiv2 = cjNiv2[etab.categorieJuridiqueUniteLegale.slice(0, 2)] || etab.categorieJuridiqueUniteLegaleLibelleNiv1
      etab.categorieJuridiqueUniteLegaleLibelle = cjNiv3[etab.categorieJuridiqueUniteLegale] || etab.categorieJuridiqueUniteLegaleLibelleNiv2
    }
  }
  return etab
}

// gzipped CSV body for the _bulk_lines endpoint of data-fair
exports.toBulkBody = (etabs) => zlib.gzipSync(csvStringify(etabs, { columns: acceptedKeys, header: true }))

// log every line rejected by data-fair (capped), not only the first one
exports.logBulkErrors = async (bulkRes, etabs, log, max = 50) => {
  if (!bulkRes.nbErrors) return
  await log.error(`l'envoi des lignes vers data-fair a rencontré des erreurs ${bulkRes.nbErrors} / ${etabs.length}`)
  for (const error of (bulkRes.errors || []).slice(0, max)) {
    const siret = etabs[error.line] && etabs[error.line].siret
    await log.error(`siret ${siret} (ligne ${error.line}) : ${JSON.stringify(error.error ?? error)}`)
  }
}

// local INSEE time of a dateDernierTraitementEtablissement, the INSEE returns it without offset
// and data-fair stores it with the Europe/Paris offset
const localTime = (date) => date ? String(date).slice(0, 19) : null

// keep the establishments that are missing from the dataset or whose dateDernierTraitementEtablissement
// differs: sending an unchanged line is not free, data-fair extends and indexes again every line of a
// small bulk, modified or not
exports.newOrChanged = (etabs, existingDates) => etabs.filter(etab => {
  const existing = existingDates.get(etab.siret)
  return existing === undefined || localTime(existing) !== localTime(etab.dateDernierTraitementEtablissement)
})

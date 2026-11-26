import { strict as assert } from 'node:assert'
import { describe, it } from 'node:test'
import zlib from 'node:zlib'
import { newOrChanged, loadReferences, prepareEtablissement, toBulkBody, logBulkErrors, type Etablissement } from '../lib/etablissements.ts'

describe('etablissements utils', () => {
  it('should keep only the missing or changed establishments', () => {
    const etabs = [
      { siret: '1', dateDernierTraitementEtablissement: '2025-12-05T16:51:57.000' },
      { siret: '2', dateDernierTraitementEtablissement: '2025-12-05T16:51:57' },
      { siret: '3', dateDernierTraitementEtablissement: '2025-12-06T00:24:35' }
    ]
    const existing = new Map([['2', '2025-12-05T16:51:57+01:00'], ['3', '2025-01-29T08:13:40+01:00']])
    assert.deepEqual(newOrChanged(etabs, existing).map(e => e.siret), ['1', '3'])
  })

  it('should flatten and enrich an establishment', async () => {
    const etab: Etablissement = {
      siret: '39940438300057',
      uniteLegale: { categorieJuridiqueUniteLegale: '1000' },
      adresseEtablissement: { codePostalEtablissement: '24390' },
      periodesEtablissement: [{ dateFin: null, etatAdministratifEtablissement: 'A', activitePrincipaleEtablissement: '43.31Z', nomenclatureActivitePrincipaleEtablissement: 'NAFRev2' }]
    }
    await prepareEtablissement(etab, loadReferences(), { error: async (msg: string) => { throw new Error(msg) } })
    assert.equal(etab.codePostalEtablissement, '24390')
    assert.equal(etab.etatAdministratifEtablissement, 'A')
    assert.equal(etab.activitePrincipaleEtablissementNAFRev2, '43.31Z')
    assert.ok(etab.activitePrincipaleEtablissementNAFRev2Libelle)
    assert.ok(etab.categorieJuridiqueUniteLegaleLibelle)
  })

  it('should build a gzipped CSV body restricted to the dataset columns', () => {
    const csv = zlib.gunzipSync(toBulkBody([{ siret: '1', siren: '2', unknownColumn: 'x' }])).toString()
    const [header, line] = csv.trim().split('\n')
    assert.ok(header.startsWith('siren,'))
    assert.ok(!header.includes('unknownColumn'))
    assert.ok(line.includes('1') && line.includes('2'))
  })

  it('should log every rejected line', async () => {
    const messages: string[] = []
    await logBulkErrors({ nbErrors: 2, errors: [{ line: 0, error: 'a' }, { line: 1, error: 'b' }] }, [{ siret: 's0' }, { siret: 's1' }], { error: async (msg: string) => { messages.push(msg) } })
    assert.equal(messages.length, 3)
    assert.ok(messages[1].includes('s0') && messages[2].includes('s1'))
  })
})

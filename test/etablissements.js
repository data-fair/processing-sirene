const assert = require('assert').strict
const { newOrChanged, loadReferences, prepareEtablissement } = require('../src/etablissements')

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
    const etab = {
      siret: '39940438300057',
      uniteLegale: { categorieJuridiqueUniteLegale: '1000' },
      adresseEtablissement: { codePostalEtablissement: '24390' },
      periodesEtablissement: [{ dateFin: null, etatAdministratifEtablissement: 'A', activitePrincipaleEtablissement: '43.31Z', nomenclatureActivitePrincipaleEtablissement: 'NAFRev2' }]
    }
    await prepareEtablissement(etab, loadReferences(), { error: async (msg) => { throw new Error(msg) } })
    assert.equal(etab.codePostalEtablissement, '24390')
    assert.equal(etab.etatAdministratifEtablissement, 'A')
    assert.equal(etab.activitePrincipaleEtablissementNAFRev2, '43.31Z')
    assert.ok(etab.activitePrincipaleEtablissementNAFRev2Libelle)
    assert.ok(etab.categorieJuridiqueUniteLegaleLibelle)
  })
})

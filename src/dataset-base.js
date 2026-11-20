// Métadonnées et schéma du jeu de données créé par ce traitement.
// Les descriptions des colonnes reprennent la documentation officielle
// « Les variables de l'API Sirene » (API Sirene 3.11) :
//   - unité légale   : https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2
//   - établissement  : https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7

module.exports = {
  isRest: true,
  title: 'Sirene',
  description: "Base Sirene des entreprises et de leurs établissements, constituée à partir de l'[API Sirene 3.11](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f) de l'Insee.\n\nChaque ligne correspond à un **établissement** (clé `siret`), enrichi des informations de l'unité légale (`siren`) dont il dépend. Le jeu couvre les établissements actifs comme fermés et les unités légales actives comme cessées, soit l'ensemble du répertoire Sirene depuis 1973.\n\n### Mise à jour\nLe jeu est alimenté quotidiennement à partir de l'API Sirene, et non des fichiers stock mensuels.\n\n### Colonnes ajoutées au-delà de l'API Sirene\n* les libellés de la nomenclature des catégories juridiques, aux niveaux 1, 2 et 3 ;\n* les codes et libellés de la NAF rév. 2 aux niveaux 1 à 5 pour l'activité principale de l'établissement ;\n* les coordonnées géographiques de l'établissement et son rattachement administratif (EPCI, arrondissement, département, région), issus d'extensions.\n\n### Diffusion partielle et données à caractère personnel\nLa base Sirene contient des données à caractère personnel. Son traitement relève notamment du [RGPD](https://www.cnil.fr/fr/reglement-europeen-protection-donnees) et de la [loi Informatique et Libertés](https://www.cnil.fr/fr/la-loi-informatique-et-libertes).\n\nLes unités légales et les établissements dont le statut de diffusion (`statutDiffusionUniteLegale`, `statutDiffusionEtablissement`) vaut `P` font l'objet d'une diffusion partielle consécutive à une demande d'opposition : leurs informations d'identification de personne physique ainsi que leurs éléments de localisation — hormis la commune — sont remplacés par la valeur `[ND]` (non diffusée). Selon votre usage du jeu de données, il est de votre responsabilité de tenir compte du statut de diffusion le plus récent de chaque personne physique.\n\nDepuis le 21 mars 2023, la modalité « N » (non diffusible) n'existe plus : les unités antérieurement non diffusibles ont été basculées en « P ».\n\n### Documentation des variables\n* [Variables de l'unité légale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2)\n* [Variables de l'établissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7)\n* [Documentation complète de l'API Sirene](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc)",
  keywords: [
    'Sirene',
    'SIREN',
    'SIRET',
    'entreprise',
    'établissement',
    'Insee',
    'immatriculation',
    'activité principale',
    'NAF',
    'APE',
    'association'
  ],
  primaryKey: [
    'siret'
  ],
  extensions: [
    {
      active: true,
      remoteService: 'dataset:geolocalisation-des-etablissements-du-repertoire-sirene',
      action: 'masterData_bulkSearch_siret-coords',
      select: [
        'y_latitude',
        'x_longitude',
        'qualite_xy'
      ],
      propertyPrefix: '_siret_coords',
      type: 'remoteService'
    },
    {
      active: true,
      remoteService: 'dataset:communes-de-france',
      action: 'masterData_bulkSearch_infos-commune',
      select: [
        'code_epci',
        'nom_epci',
        'code_arrondissement',
        'nom_arrondissement',
        'code_departement',
        'nom_departement',
        'code_region',
        'nom_region'
      ],
      propertyPrefix: '_infos_commune',
      type: 'remoteService'
    }
  ],
  schema: [
    {
      key: 'siren',
      type: 'string',
      description: "Le numéro Siren est le numéro d'identification de l'unité légale, composé de 9 chiffres.\n\nIl est attribué par l'Insee à toute personne physique ou morale « soit à l'occasion des demandes d'immatriculation au registre du commerce et des sociétés ou des déclarations effectuées au répertoire des métiers, soit à la demande d'administrations » (article R123-224 du code de commerce).\n\nLes entrepreneurs individuels (personnes physiques) conservent le même numéro Siren jusqu'à leur décès. Les sociétés (personnes morales) perdent la personnalité juridique à la cessation d'activité : en cas de reprise ultérieure, un nouveau numéro Siren est attribué. Un numéro Siren déjà attribué n'est jamais réutilisé pour une autre unité légale, même après cessation d'activité.\n\n[Documentation Insee : Siren](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#siren)",
      'x-refersTo': 'http://dbpedia.org/ontology/siren',
      'x-capabilities': {
        insensitive: false,
        textAgg: false,
        text: false,
        textStandard: false,
        values: false
      },
      title: 'Numéro Siren',
      'x-group': "Identification de l'unité légale"
    },
    {
      key: 'nic',
      type: 'string',
      description: "Numéro interne de classement de l'établissement, composé de cinq chiffres. Il permet de distinguer les établissements d'une même entreprise.\n\nAssocié au Siren, il forme le Siret de l'établissement. Son cinquième chiffre permet de contrôler la validité du numéro Siret.\n\nLe Nic est attribué une seule fois au sein de l'entreprise : si l'établissement ferme, son Nic ne peut pas être attribué à un autre établissement ; s'il rouvre, le Nic est réactivé.\n\n[Documentation Insee : nic](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#nic)",
      'x-capabilities': {
        insensitive: false,
        textAgg: false,
        text: false,
        textStandard: false,
        values: false
      },
      title: "Numéro interne de classement de l'établissement",
      'x-group': "Identification de l'établissement"
    },
    {
      key: 'siret',
      type: 'string',
      description: "Numéro unique d'identification attribué à chaque établissement par l'Insee. C'est un simple numéro d'ordre composé de 14 chiffres non significatifs : les neuf premiers correspondent au numéro Siren de l'unité légale dont l'établissement dépend, les cinq derniers au numéro interne de classement (Nic).\n\nUne entreprise est constituée d'autant d'établissements qu'il y a de lieux différents où elle exerce son activité. L'établissement est fermé quand l'activité cesse dans l'établissement concerné ou lorsque l'établissement change d'adresse.\n\n[Documentation Insee : siret](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#siret)",
      'x-refersTo': 'http://www.datatourisme.fr/ontology/core/1.0/#siret',
      title: 'Numéro Siret',
      'x-group': "Identification de l'établissement"
    },
    {
      key: 'enseigne1Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        textStandard: false,
        values: false
      },
      description: "Première ligne d'enseigne de l'établissement.\n\nLes trois variables `enseigne1Etablissement`, `enseigne2Etablissement` et `enseigne3Etablissement` contiennent la ou les enseignes de l'établissement. L'enseigne identifie l'emplacement ou le local dans lequel est exercée l'activité. Elle est facultative : un établissement peut posséder une enseigne, plusieurs enseignes ou aucune. Si l'enseigne 1 est vide, les deux autres le sont aussi ; si l'enseigne 2 est vide, l'enseigne 3 l'est aussi.\n\nDeux cas de figure coexistent : soit les 3 champs correspondent à 3 enseignes bien distinctes, soit ils correspondent au découpage sur 50 caractères d'une enseigne unique déclarée sur un seul champ dans la liasse.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : enseigne1Etablissement, enseigne2Etablissement, enseigne3Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#enseigne1etablissement-enseigne2etablissement-enseigne3etablissement)",
      title: "Première ligne d'enseigne de l'établissement",
      'x-group': "Identification de l'établissement"
    },
    {
      key: 'enseigne2Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        textStandard: false,
        values: false
      },
      description: "Deuxième ligne d'enseigne de l'établissement.\n\nSelon les cas, il s'agit d'une seconde enseigne distincte ou de la suite de `enseigne1Etablissement`, chaque champ étant limité à 50 caractères. Cette ligne est vide si `enseigne1Etablissement` l'est.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : enseigne1Etablissement, enseigne2Etablissement, enseigne3Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#enseigne1etablissement-enseigne2etablissement-enseigne3etablissement)",
      title: "Deuxième ligne d'enseigne de l'établissement",
      'x-group': "Identification de l'établissement"
    },
    {
      key: 'enseigne3Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        textStandard: false,
        values: false
      },
      description: "Troisième ligne d'enseigne de l'établissement.\n\nSelon les cas, il s'agit d'une troisième enseigne distincte ou de la suite de `enseigne2Etablissement`, chaque champ étant limité à 50 caractères. Cette ligne est vide si `enseigne2Etablissement` l'est.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : enseigne1Etablissement, enseigne2Etablissement, enseigne3Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#enseigne1etablissement-enseigne2etablissement-enseigne3etablissement)",
      title: "Troisième ligne d'enseigne de l'établissement",
      'x-group': "Identification de l'établissement"
    },
    {
      key: 'denominationUsuelleEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: "Nom sous lequel l'établissement est connu du grand public (nom commercial de l'établissement).\n\nCet élément facultatif d'identification est enregistré au niveau de l'établissement depuis l'application de la norme d'échanges CFE de 2008. Avant cette norme, le nom commercial était enregistré au niveau de l'unité légale sur trois champs (`denominationUsuelle1UniteLegale` à `denominationUsuelle3UniteLegale`), non repris dans ce jeu de données.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : denominationUsuelleEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#denominationusuelleetablissement)",
      title: "Dénomination usuelle de l'établissement",
      'x-group': "Identification de l'établissement"
    },
    {
      key: 'etatAdministratifEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "État administratif de l'établissement.\n\nLors de son inscription au répertoire, un établissement est, sauf exception, à l'état « Actif ». Le passage à l'état « Fermé » découle de la prise en compte d'une déclaration de fermeture. Un établissement fermé peut être rouvert.\n\nEn règle générale, la première période d'historique d'un établissement correspond à l'état « Actif ». L'état administratif peut toutefois être vide lorsque la première date de début de l'état est postérieure à la première date de début d'une autre variable historisée.\n\n[Documentation Insee : etatAdministratifEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#etatadministratifetablissement)",
      title: "État administratif de l'établissement",
      'x-labels': {
        A: 'Actif',
        F: 'Fermé'
      },
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'statutDiffusionEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false,
        values: false
      },
      description: "Statut de diffusion de l'établissement.\n\nTous les établissements diffusibles ont le statut de diffusion à « O ». Les établissements ayant fait l'objet d'une demande d'opposition ont le statut « P » : leurs données de localisation — hormis la commune — sont remplacées par la valeur `[ND]` (non diffusée), ainsi que, pour les personnes physiques, leurs enseignes et leur dénomination usuelle.\n\nDepuis le 21 mars 2023, la modalité « N » (non diffusible) n'existe plus : les unités concernées ont été basculées en « P ».\n\n[Documentation Insee : statutDiffusionEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#statutdiffusionetablissement)",
      'x-labels': {
        O: 'Établissement diffusible',
        P: 'Établissement en diffusion partielle'
      },
      title: "Statut de diffusion de l'établissement",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'etablissementSiege',
      type: 'boolean',
      description: "Variable booléenne qui indique si l'établissement est le siège ou non de l'unité légale.\n\nToutes les unités légales, actives comme cessées, ont un et un seul établissement siège. Il s'agit d'une variable calculée hors répertoire Sirene, toujours renseignée.\n\n[Documentation Insee : etablissementSiege](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#etablissementsiege)",
      title: "Qualité de siège ou non de l'établissement",
      'x-capabilities': {
        textStandard: false
      },
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'dateCreationEtablissement',
      type: 'string',
      format: 'date',
      description: "Date de création de l'établissement. Elle correspond à la date qui figure dans la déclaration déposée au CFE compétent.\n\nPour les établissements des unités purgées (`unitePurgeeUniteLegale` à `true`), si la date de création est au 01/01/1900 dans Sirene, la date est forcée à vide. Dans tous les autres cas la date de création n'est jamais vide : si elle est non renseignée, elle vaut 01/01/1900.\n\nLa date de création ne correspond pas obligatoirement au début de la première période de l'établissement, certaines variables historisées pouvant posséder des dates de début au 01/01/1900 ou antérieures à la date de création.\n\n[Documentation Insee : dateCreationEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#datecreationetablissement)",
      'x-capabilities': {
        textStandard: false
      },
      title: "Date de création de l'établissement",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'dateDernierTraitementEtablissement',
      type: 'string',
      format: 'date-time',
      description: "Date du dernier traitement de l'établissement dans le répertoire Sirene.\n\nElle peut concerner des mises à jour de données historisées ou non historisées, mais aussi de données du répertoire Sirene qui ne sont pas diffusées par l'API Sirene. Elle n'est pas impactée par une modification de `etablissementSiege`, qui n'est pas une variable originelle de Sirene.\n\nCette variable peut être vide pour les unités purgées.\n\nC'est cette date qui sert de curseur au traitement : chaque exécution ne récupère que les établissements traités depuis la valeur maximale déjà présente dans le jeu de données.\n\n[Documentation Insee : dateDernierTraitementEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#datederniertraitementetablissement)",
      title: "Date du dernier traitement de l'établissement dans le répertoire Sirene",
      'x-capabilities': {
        textStandard: false
      },
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Lors de son inscription au répertoire, l'Insee attribue à tout établissement un code dit « APET » (Activité Principale de l'ETablissement) sur la base de la description de l'activité principale faite par le déclarant. Ce code est modifiable au cours de la vie de l'établissement en fonction des déclarations de l'exploitant ; à un instant donné il existe un seul code APET par établissement.\n\nLa variable `nomenclatureActivitePrincipaleEtablissement` indique à quelle nomenclature appartient le code. Tous les établissements actifs ont un code appartenant à la nomenclature la plus récente (actuellement la NAF rév. 2) ; les établissements fermés conservent un code dans la nomenclature en vigueur à la date de prise en compte de leur fermeture.\n\nLes personnes morales peuvent s'immatriculer sans activité et déclarer leur commencement d'activité dans les 12 mois suivant la création : l'Insee attribue alors le code APET 00.00Z jusqu'à la prise d'activité. Le code peut aussi être vide (unités purgées, ou première date de début de l'APE postérieure à la première date de début d'une autre variable historisée).\n\nLe code APE est historisé depuis le 01/01/2005.\n\n[Documentation Insee : activitePrincipaleEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#activiteprincipaleetablissement)",
      title: "Activité principale de l'établissement",
      'x-group': "Informations sur l'établissement",
      'x-refersTo': 'http://www.datatourisme.fr/ontology/core/1.0#apeNaf'
    },
    {
      key: 'nomenclatureActivitePrincipaleEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false,
        values: false
      },
      description: "Nomenclature d'activité à laquelle appartient le code porté par `activitePrincipaleEtablissement`. Cette variable est vide si `activitePrincipaleEtablissement` est vide.\n\nLa nomenclature en vigueur est la NAF rév. 2 depuis le 1er janvier 2008.\n\n| Période | Nomenclature |\n| --- | --- |\n| depuis le 01/01/2008 | [NAF rév. 2](https://www.insee.fr/fr/information/2120875) |\n| du 01/01/2003 au 31/12/2007 | [NAF rév. 1](https://www.insee.fr/fr/information/2408180) |\n| du 01/01/1993 au 31/12/2002 | [NAF 1993](https://www.insee.fr/fr/information/2408178) |\n| du 01/01/1973 au 31/12/1992 | [NAP](https://www.insee.fr/fr/information/3582824) |\n\n[Documentation Insee : nomenclatureActivitePrincipaleEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#nomenclatureactiviteprincipaleetablissement)",
      title: "Nomenclature d'activité de la variable activitePrincipaleEtablissement",
      'x-labels': {
        NAFRev2: 'NAFRev2',
        NAFRev1: 'NAFRev1',
        NAF1993: 'NAF1993',
        NAP: 'NAP'
      },
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleEtablissementNAFRev2',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code `activitePrincipaleEtablissement` recopié uniquement lorsque `nomenclatureActivitePrincipaleEtablissement` vaut `NAFRev2` (nomenclature en vigueur depuis le 01/01/2008, voir la [NAF rév. 2](https://www.insee.fr/fr/information/2120875)).\n\nColonne ajoutée par le traitement, absente de l'API Sirene. Elle permet de filtrer ou d'agréger sans mélanger des codes issus de nomenclatures différentes, et sert de clé aux colonnes de libellés et de niveaux NAF ci-dessous.",
      title: "Activité principale de l'établissement (NAFRev2)",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleEtablissementNAFRev2Libelle',
      type: 'string',
      description: "Libellé de niveau 5 (sous-classe, le niveau le plus fin) de la [NAF rév. 2](https://www.insee.fr/fr/information/2120875) correspondant au code `activitePrincipaleEtablissementNAFRev2`.\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Libellé de l'activité principale de l'établissement (NAFRev2)",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleEtablissementNAFRev2Niv4',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code de niveau 4 (classe, 4 caractères) de la [NAF rév. 2](https://www.insee.fr/fr/information/2120875) correspondant au code `activitePrincipaleEtablissementNAFRev2`.\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Activité principale de l'établissement (NAFRev2 niveau 4)",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleEtablissementNAFRev2LibelleNiv4',
      type: 'string',
      description: "Libellé de niveau 4 (classe) de la [NAF rév. 2](https://www.insee.fr/fr/information/2120875) correspondant au code `activitePrincipaleEtablissementNAFRev2Niv4`.\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Libellé de l'activité principale de l'établissement (NAFRev2 niveau 4)",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleEtablissementNAFRev2Niv3',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code de niveau 3 (groupe, 3 caractères) de la [NAF rév. 2](https://www.insee.fr/fr/information/2120875) correspondant au code `activitePrincipaleEtablissementNAFRev2`.\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Activité principale de l'établissement (NAFRev2 niveau 3)",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleEtablissementNAFRev2LibelleNiv3',
      type: 'string',
      description: "Libellé de niveau 3 (groupe) de la [NAF rév. 2](https://www.insee.fr/fr/information/2120875) correspondant au code `activitePrincipaleEtablissementNAFRev2Niv3`.\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Libellé de l'activité principale de l'établissement (NAFRev2 niveau 3)",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleEtablissementNAFRev2Niv2',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code de niveau 2 (division, 2 caractères) de la [NAF rév. 2](https://www.insee.fr/fr/information/2120875) correspondant au code `activitePrincipaleEtablissementNAFRev2`.\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Activité principale de l'établissement (NAFRev2 niveau 2)",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleEtablissementNAFRev2LibelleNiv2',
      type: 'string',
      description: "Libellé de niveau 2 (division) de la [NAF rév. 2](https://www.insee.fr/fr/information/2120875) correspondant au code `activitePrincipaleEtablissementNAFRev2Niv2`.\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Libellé de l'activité principale de l'établissement (NAFRev2 niveau 2)",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleEtablissementNAFRev2Niv1',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code de niveau 1 (section, 1 lettre) de la [NAF rév. 2](https://www.insee.fr/fr/information/2120875) correspondant au code `activitePrincipaleEtablissementNAFRev2`.\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Activité principale de l'établissement (NAFRev2 niveau 1)",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleEtablissementNAFRev2LibelleNiv1',
      type: 'string',
      description: "Libellé de niveau 1 (section) de la [NAF rév. 2](https://www.insee.fr/fr/information/2120875) correspondant au code `activitePrincipaleEtablissementNAFRev2Niv1`.\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Libellé de l'activité principale de l'établissement (NAFRev2 niveau 1)",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleEtablissementNAFRev1',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code `activitePrincipaleEtablissement` recopié uniquement lorsque `nomenclatureActivitePrincipaleEtablissement` vaut `NAFRev1` (nomenclature en vigueur du 01/01/2003 au 31/12/2007, voir la [NAF rév. 1](https://www.insee.fr/fr/information/2408180)).\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Activité principale de l'établissement (NAFRev1)",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleEtablissementNAF1993',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code `activitePrincipaleEtablissement` recopié uniquement lorsque `nomenclatureActivitePrincipaleEtablissement` vaut `NAF1993` (nomenclature en vigueur du 01/01/1993 au 31/12/2002, voir la [NAF 1993](https://www.insee.fr/fr/information/2408178)).\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Activité principale de l'établissement (NAF1993)",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleEtablissementNAP',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code `activitePrincipaleEtablissement` recopié uniquement lorsque `nomenclatureActivitePrincipaleEtablissement` vaut `NAP` (nomenclature en vigueur du 01/01/1973 au 31/12/1992, voir la [NAP](https://www.insee.fr/fr/information/3582824)).\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Activité principale de l'établissement (NAP)",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleRegistreMetiersEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false
      },
      description: "Activité principale de l'établissement au Registre des Métiers.\n\nComplémentaire à l'activité principale de l'établissement, cette variable ne concerne que les établissements relevant de l'artisanat (artisans, artisans-commerçants et sociétés artisanales). Elle caractérise l'activité selon la Nomenclature d'Activités Française de l'Artisanat ([NAFA](https://data.artisanat.fr/nafa/)).\n\nLe code est composé des 4 chiffres et de la lettre du code APET (sans point), suivis d'une lettre spécifique à la NAFA. La variable n'est pas disponible au niveau unité légale.\n\n[Documentation Insee : activitePrincipaleRegistreMetiersEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#activiteprincipaleregistremetiersetablissement)",
      title: "Activité principale de l'établissement au Registre des Métiers",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'caractereEmployeurEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Caractère employeur de l'établissement.\n\nLors de sa formalité d'ouverture, le déclarant indique si l'établissement aura ou non des salariés au démarrage de l'activité. Par la suite, il peut déclarer alternativement des prises d'emploi (première embauche ou réembauche) et des fins d'emploi (départ du dernier salarié). Ces déclarations se font auprès de l'URSSAF, qui transmet l'information à l'Insee : les données ne peuvent être corrigées qu'à cette condition.\n\nÀ noter : lors de la fermeture de l'établissement, cette variable n'est pas mise à jour et conserve la dernière valeur connue. Elle n'est pas corrélée à `trancheEffectifsEtablissement`.\n\n[Documentation Insee : caractereEmployeurEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#caractereemployeuretablissement)",
      title: "Caractère employeur de l'établissement",
      'x-labels': {
        O: 'Établissement employeur',
        N: 'Établissement non employeur'
      },
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'trancheEffectifsEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Tranche d'effectif salarié de l'établissement.\n\nIl s'agit d'une variable statistique mise à jour une fois par an. Sa valeur est calculée à partir des données connues au 31 décembre de l'année millésime N (voir `anneeEffectifsEtablissement`) et diffusée l'année N+2, généralement à l'automne. Un seul millésime est présent à la fois dans la base Sirene.\n\nExemple : les données connues au 31/12/2023 sont intégrées à Sirene à l'automne 2025.\n\nÀ noter : `trancheEffectifsEtablissement` et `caractereEmployeurEtablissement` ne sont pas corrélées, leurs processus d'élaboration (source et calcul) étant différents.\n\n[Documentation Insee : trancheEffectifsEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#trancheeffectifsetablissement)",
      title: "Tranche d'effectif salarié de l'établissement",
      'x-labels': {
        11: '10 à 19 salariés',
        12: '20 à 49 salariés',
        21: '50 à 99 salariés',
        22: '100 à 199 salariés',
        31: '200 à 249 salariés',
        32: '250 à 499 salariés',
        41: '500 à 999 salariés',
        42: '1 000 à 1 999 salariés',
        51: '2 000 à 4 999 salariés',
        52: '5 000 à 9 999 salariés',
        53: '10 000 salariés et plus',
        NN: 'Établissement non-employeur ou présumé non-employeur (faute de déclaration reçue)',
        '00': "0 salarié (pas d'effectif au 31/12 mais des salariés employés au cours de l'année)",
        '01': '1 ou 2 salariés',
        '02': '3 à 5 salariés',
        '03': '6 à 9 salariés'
      },
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'anneeEffectifsEtablissement',
      type: 'integer',
      description: "Année de validité de la tranche d'effectif salarié de l'établissement.\n\nLa mise à jour des tranches d'effectifs est annuelle (automne). Pour les unités dont la tranche d'effectifs est renseignée, l'année de validité correspondante est l'année millésime N (voir `trancheEffectifsEtablissement`). Il n'y a jamais plus d'un seul millésime présent dans la base Sirene.\n\n[Documentation Insee : anneeEffectifsEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#anneeeffectifsetablissement)",
      title: "Année de validité de la tranche d'effectif salarié de l'établissement",
      'x-capabilities': {
        textStandard: false
      },
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'numeroVoieEtablissement',
      type: 'string',
      description: "Numéro dans la voie, élément constitutif de l'adresse. La variable est facultative.\n\nSi l'adresse englobe plusieurs numéros dans la voie (5-7, 5 à 7…), l'information complète figure en complément d'adresse et le premier des numéros (5 dans l'exemple) est porté dans `numeroVoieEtablissement`.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : numeroVoieEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#numerovoieetablissement)",
      title: 'Numéro de voie',
      'x-refersTo': 'http://www.ontotext.com/proton/protonext#StreetNumber',
      'x-capabilities': {
        insensitive: false,
        textAgg: false,
        text: false,
        values: false
      },
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'indiceRepetitionEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false
      },
      description: "Indice de répétition du numéro dans la voie (B pour Bis, T pour Ter, lettres ou chiffres pour identifier différents bâtiments à une même adresse…).\n\nCette variable facultative est un élément constitutif de l'adresse ; elle est généralement associée à `numeroVoieEtablissement`.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : indiceRepetitionEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#indicerepetitionetablissement)",
      title: 'Indice de répétition dans la voie',
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'typeVoieEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false,
        values: false
      },
      description: "Type de voie de l'adresse, élément constitutif de l'adresse. La variable est facultative.\n\nLes abréviations anciennes issues du répertoire Sirene 3 (`RUE`, `AV`, `BD`…) cohabitent avec les nouveaux libellés en clair issus de la Base Adresse Nationale (`RUE`, `AVENUE`, `BOULEVARD`…). Les libellés ci-dessous ne couvrent que les abréviations anciennes ; les valeurs issues de la BAN se lisent directement.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : typeVoieEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#typevoieetablissement)",
      title: 'Type de voie',
      'x-labels': {
        ACH: 'Ancien chemin',
        AER: 'Aéroport',
        AIRE: 'Aire',
        ALL: 'Allée',
        ART: 'Ancienne route',
        AV: 'Avenue',
        AVE: 'Avenue',
        BASE: 'Base',
        BD: 'Boulevard',
        BRG: 'Bourg',
        CAMI: 'Cami',
        CAR: 'Carrefour',
        CC: 'Chemin communal',
        CD: 'Chemin départemental',
        CF: 'Chemin forestier',
        CHE: 'Chemin',
        CHEM: 'Cheminement',
        CHL: 'Chalet',
        CHP: 'Champs',
        CHS: 'Chaussée',
        CHT: 'Château',
        CHV: 'Chemin vicinal',
        CITE: 'Cité',
        CLOS: 'Clos',
        COIN: 'Coin',
        COR: 'Corniche',
        COTE: 'Cote',
        COUR: 'Cour',
        CR: 'Chemin rural',
        CRS: 'Cours',
        DOM: 'Domaine',
        DSC: 'Descente',
        ECA: 'Ecart',
        ESP: 'Esplanade',
        ESPA: 'Espace',
        FBG: 'Faubourg',
        FG: 'Faubourg',
        FON: 'Fontaine',
        FRM: 'Ferme',
        GARE: 'Gare',
        GPL: 'Grand-place',
        GR: 'Grande Rue',
        HAB: 'Habitation',
        HAM: 'Hameau',
        HLE: 'Halle',
        HLM: 'Habitation à loyer modéré',
        HOT: 'Hôtel',
        ILOT: 'Ilôt',
        IMP: 'Impasse',
        JARD: 'Jardin',
        LD: 'Lieu dit',
        LDT: 'Lieu-dit',
        LOT: 'Lotissement',
        MAR: 'Marché',
        MTE: 'Montée',
        PAE: 'Parc d’activités économiques',
        PARC: 'Parc',
        PAS: 'Passage',
        PL: 'Place',
        PLAN: 'Plan',
        PLN: 'Plaine',
        PLT: 'Plateau',
        PONT: 'Pont',
        PORT: 'Port',
        PRO: 'Promenade',
        PROM: 'Promenade',
        PRV: 'Parvis',
        QRT: 'Quartier',
        QUA: 'Quartier',
        QUAI: 'Quai',
        RD: 'Route départementale',
        RES: 'Résidence',
        RLE: 'Ruelle',
        ROC: 'Rocade',
        RPT: 'Rond Point',
        RTE: 'Route',
        RUE: 'Rue',
        SEN: 'Sente - Sentier',
        SQ: 'Square',
        STDE: 'Stade',
        TOUR: 'Tour',
        TPL: 'Terre-plein',
        TRA: 'Traverse',
        VALL: 'Vallée',
        VC: 'Voie communale',
        VCHE: 'Vieux chemin',
        VIL: 'Ville',
        VLA: 'Villa',
        VLGE: 'Village',
        VOIE: 'Voie',
        VTE: 'Vieille route',
        ZA: 'Zone artisanale',
        ZAC: "Zone d'aménagement concerté",
        ZAD: "Zone d'aménagement différé",
        ZI: 'Zone industrielle',
        ZONE: 'Zone'
      },
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'libelleVoieEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        textStandard: false,
        values: false
      },
      description: "Libellé de la voie de localisation de l'établissement, élément constitutif de l'adresse.\n\nCette variable est facultative : elle n'est pas toujours renseignée, en particulier dans les petites communes.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : libelleVoieEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#libellevoieetablissement)",
      title: 'Libellé de voie',
      'x-refersTo': 'http://schema.org/streetAddress',
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'complementAdresseEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        textStandard: false,
        values: false
      },
      description: "Complément d'adresse de l'établissement, élément constitutif de l'adresse.\n\nVariable facultative qui précise l'adresse avec :\n\n- une indication d'étage, d'appartement, de porte, de n° de boîte à lettres ;\n- la désignation d'un bâtiment, d'un escalier, d'une entrée, d'un bloc ;\n- le nom d'une résidence, d'un ensemble…\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : complementAdresseEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#complementadresseetablissement)",
      title: "Complément d'adresse",
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'distributionSpecialeEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        textStandard: false,
        values: false
      },
      description: "Distribution spéciale de l'établissement : éléments particuliers qui accompagnent une adresse de distribution spéciale (BP pour boîte postale, TSA pour tri par service à l'arrivée, CIDEX, POSTE RESTANTE…). C'est un élément constitutif de l'adresse.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : distributionSpecialeEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#distributionspecialeetablissement)",
      title: "Distribution spéciale de l'établissement",
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'codePostalEtablissement',
      type: 'string',
      description: "Code postal de l'adresse de l'établissement.\n\nLes codes postaux étrangers sont donnés à titre indicatif : ils sont de longueur variable et peuvent contenir des lettres ou des blancs.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : codePostalEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#codepostaletablissement)",
      'x-capabilities': {
        insensitive: false,
        textAgg: false,
        text: false,
        textStandard: false
      },
      title: 'Code postal',
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'codeCommuneEtablissement',
      type: 'string',
      description: "Code géographique de la commune de localisation de l'établissement, hors adresse à l'étranger.\n\nLe code commune est celui défini par la Base Adresse Nationale (BAN) au moment du traitement de la formalité la plus récente liée à une modification d'adresse. Voir le [code officiel géographique](https://www.insee.fr/fr/information/2560452).\n\nPour les établissements localisés à l'étranger, cette variable est vide. Contrairement aux autres éléments d'adresse, la commune reste diffusée pour les unités en diffusion partielle.\n\n[Documentation Insee : codeCommuneEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#codecommuneetablissement)",
      title: "Code commune de l'établissement",
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      'x-group': "Adresse de l'établissement",
      'x-refersTo': 'http://rdf.insee.fr/def/geo#codeCommune'
    },
    {
      key: 'libelleCommuneEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        textStandard: false,
        values: false
      },
      description: "Libellé de la commune de localisation de l'établissement, si celui-ci n'est pas à l'étranger. C'est un élément constitutif de l'adresse.\n\nContrairement aux autres éléments d'adresse, la commune reste diffusée pour les unités en diffusion partielle.\n\n[Documentation Insee : libelleCommuneEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#libellecommuneetablissement)",
      title: 'Libellé de la commune',
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'codeCedexEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code cedex de l'établissement, élément facultatif constitutif de l'adresse.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : codeCedexEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#codecedexetablissement)",
      title: 'Code cedex',
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'libelleCedexEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        textStandard: false
      },
      description: "Libellé correspondant au code cedex de l'établissement. Ce libellé est celui utilisé dans la ligne 6 d'adresse pour l'acheminement postal.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : libelleCedexEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#libellecedexetablissement)",
      title: 'Libellé du code cedex',
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'codePaysEtrangerEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code du pays de localisation de l'établissement pour les adresses à l'étranger.\n\nLa variable commence toujours par 99 si elle est renseignée ; les 3 caractères suivants sont le code du pays étranger. Voir le [code officiel géographique](https://www.insee.fr/fr/information/2560452).\n\n[Documentation Insee : codePaysEtrangerEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#codepaysetrangeretablissement)",
      title: "Code pays pour un établissement situé à l'étranger",
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'libellePaysEtrangerEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false
      },
      description: "Libellé du pays de localisation de l'établissement si celui-ci est à l'étranger. C'est un élément constitutif de l'adresse.\n\n[Documentation Insee : libellePaysEtrangerEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#libellepaysetrangeretablissement)",
      title: "Libellé du pays pour un établissement situé à l'étranger",
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'libelleCommuneEtrangerEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        values: false
      },
      description: "Libellé de la commune pour un établissement situé à l'étranger.\n\nCette variable est un élément constitutif de l'adresse pour les établissements situés sur le territoire étranger (`codeCommuneEtablissement` est alors vide).\n\n[Documentation Insee : libelleCommuneEtrangerEtablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#libellecommuneetrangeretablissement)",
      title: "Libellé de la commune pour un établissement situé à l'étranger",
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'denominationUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: "Raison sociale de l'unité légale : le nom sous lequel elle est déclarée. Cette variable ne concerne que les personnes morales, elle est vide pour les personnes physiques.\n\nLa dénomination peut contenir la mention de la forme de la société (SA, SAS, SARL, etc.) ainsi que des caractères spéciaux : esperluette, `- + @ ! ? * ° . % : # |` (liste non exhaustive).\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : denominationUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#denominationunitelegale)",
      title: "Dénomination de l'unité légale",
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'sigleUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false
      },
      description: "Un sigle est une forme réduite de la raison sociale ou de la dénomination d'une personne morale ou d'un organisme public. Il est habituellement constitué des initiales de certains des mots de la dénomination ; lorsqu'on retient les deux ou trois premières lettres de certains mots il s'agit, au sens strict, d'un acronyme, mais l'usage a étendu à ce cas l'emploi du terme sigle.\n\nCette variable est vide pour les personnes physiques ; facultative, elle peut également être vide pour les personnes morales.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : sigleUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#sigleunitelegale)",
      title: "Sigle de l'unité légale",
      'x-group': "Identification de l'unité légale"
    },
    {
      key: 'nomUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: "Nom de naissance de la personne physique.\n\nCette variable est vide pour les personnes morales. Elle peut également être vide pour une personne physique (unités purgées, ou première date de début du nom postérieure à la première date de début d'une autre variable historisée).\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : nomUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#nomunitelegale)",
      title: 'Nom de naissance de la personne physique',
      'x-group': "Identification de l'unité légale"
    },
    {
      key: 'nomUsageUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: "Le nom d'usage est celui que la personne physique a choisi d'utiliser.\n\nCette variable est vide pour les personnes morales. Elle peut également être vide pour une personne physique (unités purgées, ou première date de début du nom postérieure à la première date de début d'une autre variable historisée).\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : nomUsageUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#nomusageunitelegale)",
      title: "Nom d'usage de la personne physique",
      'x-group': "Identification de l'unité légale"
    },
    {
      key: 'prenom1UniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: 'Premier prénom déclaré pour une personne physique.\n\nLes variables `prenom1UniteLegale` à `prenom4UniteLegale` sont les prénoms déclarés pour une personne physique ; elles sont vides pour les personnes morales. Toute personne physique est en principe identifiée au minimum par son nom de naissance et son premier prénom, mais il existe des personnes physiques dont le nom est renseigné alors que les 4 prénoms sont vides. Ces variables peuvent contenir des `*`, qui ne sont pas significatifs.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : prenom1UniteLegale à prenom4UniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#prenom1unitelegale-à-prenom4unitelegale)',
      title: 'Premier prénom déclaré pour une personne physique',
      'x-group': "Identification de l'unité légale"
    },
    {
      key: 'prenom2UniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: 'Deuxième prénom déclaré pour une personne physique.\n\nLes variables `prenom1UniteLegale` à `prenom4UniteLegale` sont les prénoms déclarés pour une personne physique ; elles sont vides pour les personnes morales. Ces variables peuvent contenir des `*`, qui ne sont pas significatifs.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : prenom1UniteLegale à prenom4UniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#prenom1unitelegale-à-prenom4unitelegale)',
      title: 'Deuxième prénom déclaré pour une personne physique',
      'x-group': "Identification de l'unité légale"
    },
    {
      key: 'prenom3UniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: 'Troisième prénom déclaré pour une personne physique.\n\nLes variables `prenom1UniteLegale` à `prenom4UniteLegale` sont les prénoms déclarés pour une personne physique ; elles sont vides pour les personnes morales. Ces variables peuvent contenir des `*`, qui ne sont pas significatifs.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : prenom1UniteLegale à prenom4UniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#prenom1unitelegale-à-prenom4unitelegale)',
      title: 'Troisième prénom déclaré pour une personne physique',
      'x-group': "Identification de l'unité légale"
    },
    {
      key: 'prenom4UniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: 'Quatrième prénom déclaré pour une personne physique.\n\nLes variables `prenom1UniteLegale` à `prenom4UniteLegale` sont les prénoms déclarés pour une personne physique ; elles sont vides pour les personnes morales. Ces variables peuvent contenir des `*`, qui ne sont pas significatifs.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : prenom1UniteLegale à prenom4UniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#prenom1unitelegale-à-prenom4unitelegale)',
      title: 'Quatrième prénom déclaré pour une personne physique',
      'x-group': "Identification de l'unité légale"
    },
    {
      key: 'prenomUsuelUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: "Le prénom usuel est le prénom par lequel une personne physique choisit de se faire appeler dans la vie courante, parmi l'ensemble de ceux qui lui ont été donnés à sa naissance et qui sont inscrits à l'état civil.\n\nCette variable n'est plus gérée par l'Insee : elle est toujours égale à `prenom1UniteLegale`. Elle est vide pour les personnes morales.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : prenomUsuelUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#prenomusuelunitelegale)",
      title: 'Prénom usuel de la personne physique',
      'x-group': "Identification de l'unité légale"
    },
    {
      key: 'pseudonymeUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: "Le pseudonyme correspond au nom qu'une personne physique utilise pour se désigner dans l'exercice de son activité, généralement littéraire ou artistique.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : pseudonymeUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#pseudonymeunitelegale)",
      title: 'Pseudonyme de la personne physique',
      'x-group': "Identification de l'unité légale"
    },
    {
      key: 'sexeUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: 'Caractère féminin ou masculin de la personne physique.\n\nCette variable est vide pour les personnes morales, ainsi que pour quelques personnes physiques.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : sexeUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#sexeunitelegale)',
      title: 'Caractère féminin ou masculin de la personne physique',
      'x-labels': {
        M: 'Masculin',
        F: 'Féminin',
        '[ND]': 'Non diffusé (diffusion partielle)'
      },
      'x-group': "Identification de l'unité légale"
    },
    {
      key: 'dateCreationUniteLegale',
      type: 'string',
      format: 'date',
      description: "Date de création de l'unité légale. Elle correspond à la date déclarée lors du dépôt des formalités de création.\n\nPour les unités purgées (`unitePurgeeUniteLegale` à `true`), si la date de création est au 01/01/1900 dans Sirene, la date est forcée à vide. Dans tous les autres cas la date de création n'est jamais vide : si elle est non renseignée, elle vaut 01/01/1900.\n\nLa date de création ne correspond pas obligatoirement au début de la première période de l'unité légale, certaines variables historisées pouvant posséder des dates de début au 01/01/1900 ou antérieures à la date de création.\n\n[Documentation Insee : dateCreationUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#datecreationunitelegale)",
      'x-capabilities': {
        textStandard: false
      },
      title: "Date de création de l'unité légale",
      'x-group': "Identification de l'unité légale"
    },
    {
      key: 'etatAdministratifUniteLegale',
      type: 'string',
      title: "État administratif de l'unité légale",
      description: "État administratif de l'unité légale.\n\nLe passage à l'état « Cessée » découle de la prise en compte d'une déclaration de cessation administrative :\n\n- pour les personnes morales, cela signifie la disparition de la personne morale ; l'état « Cessée » est *a priori* irréversible, même s'il existe dans la base des unités légales personnes morales dont l'historique présente un état cessé entre deux périodes actives ;\n- pour les personnes physiques, cela signifie une cessation totale d'activité, décidée ou contrainte (décès, faillite). Hormis en cas de décès, la personne physique peut être réactivée sous le même Siren en cas de reprise d'activité, sans condition de délai.\n\nEn règle générale, la première période d'historique d'une unité légale correspond à l'état « Active ». L'état administratif peut toutefois être vide lorsque la première date de début de l'état est postérieure à la première date de début d'une autre variable historisée.\n\n[Documentation Insee : etatAdministratifUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#etatadministratifunitelegale)",
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      'x-labels': {
        A: 'Active',
        C: 'Cessée'
      },
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'statutDiffusionUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false,
        values: false
      },
      description: "Statut de diffusion de l'unité légale.\n\nToutes les unités légales diffusibles ont le statut de diffusion à « O ». Les unités légales ayant fait l'objet d'une demande d'opposition ont le statut « P » : leurs informations d'identification de personne physique sont remplacées par la valeur `[ND]` (non diffusée).\n\nDepuis le 21 mars 2023, la modalité « N » (non diffusible) n'existe plus : les unités concernées ont été basculées en « P ».\n\n[Documentation Insee : statutDiffusionUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#statutdiffusionunitelegale)",
      'x-labels': {
        O: 'Unité légale diffusible',
        P: 'Unité légale en diffusion partielle'
      },
      title: "Statut de diffusion de l'unité légale",
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'unitePurgeeUniteLegale',
      type: 'boolean',
      description: "Cette variable indique si l'unité légale a été purgée. Pour des raisons de capacité de stockage, les données concernant les entreprises cessées avant le 31/12/2002 ont été purgées.\n\nPour ces unités dites purgées :\n\n- l'état administratif est à « C » (cessée) ;\n- seules les dernières valeurs des variables de niveau unité légale et établissement sont conservées ;\n- en théorie, seul l'établissement siège au moment de la purge est conservé, avec uniquement ses dernières valeurs. Pour plus de 300 unités légales purgées, cette règle n'est cependant pas respectée et ces unités ont toujours plusieurs établissements en base, sans garantie que tous aient été conservés ;\n- l'indicatrice `unitePurgeeUniteLegale` est à `true`.\n\nPlus de 4 millions d'unités légales sont purgées, et plus d'une unité purgée sur quatre a une date de création indéterminée. Les établissements des unités purgées sont fermés et n'ont qu'une seule période.\n\n[Documentation Insee : unitePurgeeUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#unitepurgeeunitelegale)",
      title: 'Unité légale purgée',
      'x-capabilities': {
        textStandard: false
      },
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'nicSiegeUniteLegale',
      type: 'string',
      description: "Numéro interne de classement (Nic) de l'établissement siège de l'unité légale.\n\nToutes les unités légales ont un établissement siège :\n\n- pour les personnes morales, il s'agit d'une donnée juridique ; le transfert du siège d'un établissement à un autre fait l'objet d'une formalité et entraîne le changement de `nicSiegeUniteLegale` ;\n- pour les personnes physiques, le siège n'a pas de réalité juridique, mais le répertoire calque la structure des personnes physiques sur celle des personnes morales et attribue la qualité de siège au premier établissement créé.\n\nLe Nic du siège peut être vide sur une période mais, en règle générale, pas sur l'ensemble de l'historique (unités purgées, ou première date de début du Nic postérieure à la première date de début d'une autre variable historisée).\n\n[Documentation Insee : nicSiegeUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#nicsiegeunitelegale)",
      'x-capabilities': {
        insensitive: false,
        textAgg: false,
        text: false,
        textStandard: false,
        values: false
      },
      title: "Numéro interne de classement (Nic) du siège de l'unité légale",
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'dateDernierTraitementUniteLegale',
      type: 'string',
      format: 'date-time',
      description: "Date de la dernière modification d'une variable de niveau unité légale, qu'elle soit historisée ou non.\n\nCette date peut concerner des mises à jour de données du répertoire Sirene qui ne sont pas diffusées.\n\n[Documentation Insee : dateDernierTraitementUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#datederniertraitementunitelegale)",
      title: "Date du dernier traitement de l'unité légale dans le répertoire Sirene",
      'x-capabilities': {
        textStandard: false
      },
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'categorieJuridiqueUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "La catégorie juridique est un attribut de l'unité légale.\n\nPour une personne physique, elle vaut toujours 1000, que la personne soit artisan, commerçant, profession libérale, agriculteur ou autre, et ne peut pas changer. Pour les personnes morales, elle est susceptible d'évoluer au cours de la vie de l'entreprise.\n\nLe code est attribué selon la [nomenclature des catégories juridiques](https://www.insee.fr/fr/information/2028129) en vigueur. Il peut être vide, notamment pour les unités purgées.\n\n[Documentation Insee : categorieJuridiqueUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#categoriejuridiqueunitelegale)",
      title: "Catégorie juridique de l'unité légale",
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'categorieJuridiqueUniteLegaleLibelle',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: "Libellé de niveau 3 (le plus fin) de la [nomenclature des catégories juridiques](https://www.insee.fr/fr/information/2028129) correspondant au code `categorieJuridiqueUniteLegale`.\n\nColonne ajoutée par le traitement, absente de l'API Sirene. À défaut de correspondance au niveau 3, le libellé de niveau 2 est utilisé.",
      title: "Libellé de la catégorie juridique de l'unité légale",
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'categorieJuridiqueUniteLegaleLibelleNiv2',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: "Libellé de niveau 2 (2 chiffres) de la [nomenclature des catégories juridiques](https://www.insee.fr/fr/information/2028129) correspondant au code `categorieJuridiqueUniteLegale`.\n\nColonne ajoutée par le traitement, absente de l'API Sirene. À défaut de correspondance au niveau 2, le libellé de niveau 1 est utilisé.",
      title: "Libellé de la catégorie juridique de l'unité légale (niveau 2)",
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'categorieJuridiqueUniteLegaleLibelleNiv1',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: "Libellé de niveau 1 (le plus agrégé, 1 chiffre) de la [nomenclature des catégories juridiques](https://www.insee.fr/fr/information/2028129) correspondant au code `categorieJuridiqueUniteLegale`.\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Libellé de la catégorie juridique de l'unité légale (niveau 1)",
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'activitePrincipaleUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Lors de son inscription au répertoire, l'Insee attribue à toute unité légale un code dit « APEN » (Activité Principale de l'ENtreprise) sur la base de la description de l'activité principale faite par le déclarant. Ce code est modifiable au cours de la vie de l'unité légale en fonction des déclarations de l'exploitant ; à un instant donné il existe un seul code APEN par unité légale.\n\nLa variable `nomenclatureActivitePrincipaleUniteLegale` indique à quelle nomenclature appartient le code. Toutes les unités légales actives ont un code appartenant à la nomenclature la plus récente (actuellement la NAF rév. 2) ; les unités légales fermées conservent un code dans la nomenclature en vigueur à la date de prise en compte de leur fermeture.\n\nLes personnes morales peuvent s'immatriculer sans activité et déclarer leur commencement d'activité dans les 12 mois suivant la création : l'Insee attribue alors le code APEN 00.00Z jusqu'à la prise d'activité. Le code peut aussi être vide (unités purgées, ou première date de début de l'APE postérieure à la première date de début d'une autre variable historisée).\n\nLe code APE est historisé depuis le 01/01/2005.\n\n[Documentation Insee : activitePrincipaleUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#activiteprincipaleunitelegale)",
      title: "Activité principale de l'unité légale",
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'nomenclatureActivitePrincipaleUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false,
        values: false
      },
      description: "Nomenclature d'activité à laquelle appartient le code porté par `activitePrincipaleUniteLegale`. Cette variable est vide si `activitePrincipaleUniteLegale` est vide.\n\nLa nomenclature en vigueur est la NAF rév. 2 depuis le 1er janvier 2008.\n\n| Période | Nomenclature |\n| --- | --- |\n| depuis le 01/01/2008 | [NAF rév. 2](https://www.insee.fr/fr/information/2120875) |\n| du 01/01/2003 au 31/12/2007 | [NAF rév. 1](https://www.insee.fr/fr/information/2408180) |\n| du 01/01/1993 au 31/12/2002 | [NAF 1993](https://www.insee.fr/fr/information/2408178) |\n| du 01/01/1973 au 31/12/1992 | [NAP](https://www.insee.fr/fr/information/3582824) |\n\n[Documentation Insee : nomenclatureActivitePrincipaleUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#nomenclatureactiviteprincipaleunitelegale)",
      title: "Nomenclature d'activité de la variable activitePrincipaleUniteLegale",
      'x-labels': {
        NAFRev2: 'NAFRev2',
        NAFRev1: 'NAFRev1',
        NAF1993: 'NAF1993',
        NAP: 'NAP'
      },
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'activitePrincipaleUniteLegaleNAFRev2',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code `activitePrincipaleUniteLegale` recopié uniquement lorsque `nomenclatureActivitePrincipaleUniteLegale` vaut `NAFRev2` (nomenclature en vigueur depuis le 01/01/2008, voir la [NAF rév. 2](https://www.insee.fr/fr/information/2120875)).\n\nColonne ajoutée par le traitement, absente de l'API Sirene. Elle permet de filtrer ou d'agréger sans mélanger des codes issus de nomenclatures différentes.",
      title: "Activité principale de l'unité légale (NAFRev2)",
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'activitePrincipaleUniteLegaleNAFRev1',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code `activitePrincipaleUniteLegale` recopié uniquement lorsque `nomenclatureActivitePrincipaleUniteLegale` vaut `NAFRev1` (nomenclature en vigueur du 01/01/2003 au 31/12/2007, voir la [NAF rév. 1](https://www.insee.fr/fr/information/2408180)).\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Activité principale de l'unité légale (NAFRev1)",
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'activitePrincipaleUniteLegaleNAF1993',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code `activitePrincipaleUniteLegale` recopié uniquement lorsque `nomenclatureActivitePrincipaleUniteLegale` vaut `NAF1993` (nomenclature en vigueur du 01/01/1993 au 31/12/2002, voir la [NAF 1993](https://www.insee.fr/fr/information/2408178)).\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Activité principale de l'unité légale (NAF1993)",
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'activitePrincipaleUniteLegaleNAP',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code `activitePrincipaleUniteLegale` recopié uniquement lorsque `nomenclatureActivitePrincipaleUniteLegale` vaut `NAP` (nomenclature en vigueur du 01/01/1973 au 31/12/1992, voir la [NAP](https://www.insee.fr/fr/information/3582824)).\n\nColonne ajoutée par le traitement, absente de l'API Sirene.",
      title: "Activité principale de l'unité légale (NAP)",
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'categorieEntreprise',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "La catégorie d'entreprise est une variable statistique calculée par l'Insee : ce n'est pas une variable intrinsèque du répertoire Sirene, elle ne peut pas être modifiée à la demande des entreprises et n'est pas utilisable à des fins administratives.\n\nLorsque l'unité légale appartient à un [groupe](https://www.insee.fr/fr/metadonnees/definition/c1041), la catégorie d'entreprise est [calculée au niveau du groupe](https://www.insee.fr/fr/metadonnees/definition/c1057).\n\nElle est associée à une année de validité (`anneeCategorieEntreprise`) et mise à jour une fois par an, en juillet N+2 pour l'année N. Voir aussi la [méthodologie de calcul et de diffusion](https://www.insee.fr/fr/information/1730869).\n\n[Documentation Insee : categorieEntreprise](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#categorieentreprise)",
      title: "Catégorie à laquelle appartient l'entreprise",
      'x-labels': {
        PME: 'Petite ou moyenne entreprise',
        ETI: 'Entreprise de taille intermédiaire',
        GE: 'Grande entreprise'
      },
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'anneeCategorieEntreprise',
      type: 'integer',
      description: "Année de validité correspondant à la catégorie d'entreprise diffusée (`categorieEntreprise`).\n\nLa mise à jour de la catégorie d'entreprise est annuelle, en juillet N+2 pour l'année N.\n\n[Documentation Insee : anneeCategorieEntreprise](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#anneecategorieentreprise)",
      title: "Année de validité de la catégorie d'entreprise",
      'x-capabilities': {
        textStandard: false
      },
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'trancheEffectifsUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Tranche d'effectif salarié de l'unité légale.\n\nIl s'agit d'une variable statistique mise à jour une fois par an. Sa valeur est calculée à partir des données connues au 31 décembre de l'année millésime N (voir `anneeEffectifsUniteLegale`) et diffusée l'année N+2, généralement à l'automne. Un seul millésime est présent à la fois dans la base Sirene.\n\nExemple : les données connues au 31/12/2023 sont intégrées à Sirene à l'automne 2025.\n\n[Documentation Insee : trancheEffectifsUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#trancheeffectifsunitelegale)",
      title: "Tranche d'effectif salarié de l'unité légale",
      'x-labels': {
        11: '10 à 19 salariés',
        12: '20 à 49 salariés',
        21: '50 à 99 salariés',
        22: '100 à 199 salariés',
        31: '200 à 249 salariés',
        32: '250 à 499 salariés',
        41: '500 à 999 salariés',
        42: '1 000 à 1 999 salariés',
        51: '2 000 à 4 999 salariés',
        52: '5 000 à 9 999 salariés',
        53: '10 000 salariés et plus',
        NN: 'Unité légale non-employeur ou présumé non-employeur (faute de déclaration reçue)',
        '00': "0 salarié (pas d'effectif au 31/12 mais des salariés employés au cours de l'année)",
        '01': '1 ou 2 salariés',
        '02': '3 à 5 salariés',
        '03': '6 à 9 salariés'
      },
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'anneeEffectifsUniteLegale',
      type: 'integer',
      description: "Année de validité de la tranche d'effectif salarié de l'unité légale.\n\nLa mise à jour des tranches d'effectifs est annuelle (automne). Pour les unités dont la tranche d'effectifs est renseignée, l'année de validité correspondante est l'année millésime N (voir `trancheEffectifsUniteLegale`). Il n'y a jamais plus d'un seul millésime présent dans la base Sirene.\n\n[Documentation Insee : anneeEffectifsUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#anneeeffectifsunitelegale)",
      title: "Année de validité de la tranche d'effectif salarié de l'unité légale",
      'x-capabilities': {
        textStandard: false
      },
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'caractereEmployeurUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Caractère employeur de l'unité légale : indique si au moins un des établissements actifs de l'unité légale emploie des salariés.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire. Pour connaître le caractère employeur, utiliser `caractereEmployeurEtablissement`.\n\n[Documentation Insee : caractereEmployeurUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#caractereemployeurunitelegale)",
      title: "Caractère employeur de l'unité légale",
      'x-labels': {
        O: 'Unité légale employeuse',
        N: 'Unité légale non employeuse'
      },
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'economieSocialeSolidaireUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Cette variable indique si l'entreprise appartient au champ de l'économie sociale et solidaire.\n\nLa loi n° 2014-856 du 31 juillet 2014 définit officiellement le périmètre de l'économie sociale et solidaire (ESS). Celle-ci comprend les quatre familles traditionnelles en raison de leur régime juridique (associations, fondations, coopératives et mutuelles) et inclut une nouvelle catégorie, les entreprises de l'ESS, adhérant aux mêmes principes :\n\n- poursuivre un but social autre que le seul partage des bénéfices ;\n- un caractère lucratif encadré (notamment des bénéfices majoritairement consacrés au maintien et au développement de l'activité) ;\n- une gouvernance démocratique et participative.\n\n[Documentation Insee : economieSocialeSolidaireUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#economiesocialesolidaireunitelegale)",
      title: "Appartenance au champ de l'économie sociale et solidaire",
      'x-labels': {
        O: "L'entreprise appartient au champ de l'économie sociale et solidaire",
        N: "L'entreprise n'appartient pas au champ de l'économie sociale et solidaire"
      },
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'societeMissionUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Cette variable indique si l'entreprise appartient au champ des sociétés à mission.\n\nL'article 176 de la loi du 22 mai 2019 relative à la croissance et la transformation des entreprises, dite loi Pacte, introduit la qualité de société à mission. Il permet à une société de faire publiquement état de cette qualité en précisant sa raison d'être ainsi qu'un ou plusieurs objectifs sociaux et environnementaux qu'elle se donne pour mission de poursuivre dans le cadre de son activité.\n\n[Documentation Insee : societeMissionUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#societemissionunitelegale)",
      title: 'Appartenance au champ des sociétés à mission',
      'x-labels': {
        O: "L'entreprise appartient au champ des sociétés à mission",
        N: "L'entreprise n'appartient pas au champ des sociétés à mission"
      },
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'identifiantAssociationUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Numéro d'inscription au Répertoire National des Associations (RNA), attribué automatiquement lors de la déclaration en préfecture.\n\nL'association doit en outre demander son immatriculation au répertoire Sirene lorsqu'elle souhaite obtenir des subventions auprès de l'État ou des collectivités territoriales, lorsqu'elle emploie des salariés, ou lorsqu'elle exerce des activités qui conduisent au paiement de la TVA ou de l'impôt sur les sociétés.\n\nLe RNA est le fichier national, géré par le ministère de l'Intérieur, qui recense l'ensemble des informations sur les associations.\n\n[Documentation Insee : identifiantAssociationUniteLegale](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=e36e4328-dd1b-4145-ae43-28dd1b7145f2#identifiantassociationunitelegale)",
      title: 'Numéro au Répertoire National des Associations',
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'complementAdresse2Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        textStandard: false,
        values: false
      },
      description: "Complément d'adresse secondaire de l'établissement, dans le cas où celui-ci dispose d'une entrée secondaire.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : complementAdresse2Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#complementadresse2etablissement)",
      title: "Complément d'adresse secondaire",
      'x-group': "Adresse secondaire de l'établissement"
    },
    {
      key: 'numeroVoie2Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false,
        values: false
      },
      description: "Numéro dans la voie de l'adresse secondaire, dans le cas où l'établissement dispose d'une entrée secondaire.\n\nSi l'adresse secondaire englobe plusieurs numéros dans la voie (5-7, 5 à 7…), l'information complète figure en complément d'adresse et le premier des numéros est porté dans `numeroVoie2Etablissement`.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : numeroVoie2Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#numerovoie2etablissement)",
      title: "Numéro de la voie de l'adresse secondaire",
      'x-group': "Adresse secondaire de l'établissement"
    },
    {
      key: 'indiceRepetition2Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false,
        values: false
      },
      description: "Indice de répétition du numéro dans la voie de l'adresse secondaire (B pour Bis, T pour Ter…). Elle est généralement associée à `numeroVoie2Etablissement`.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : indiceRepetition2Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#indicerepetition2etablissement)",
      title: "Indice de répétition dans la voie pour l'adresse secondaire",
      'x-group': "Adresse secondaire de l'établissement"
    },
    {
      key: 'typeVoie2Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false,
        values: false
      },
      description: "Type de voie de l'adresse secondaire, dans le cas où l'établissement dispose d'une entrée secondaire.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : typeVoie2Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#typevoie2etablissement)",
      title: "Type de voie de l'adresse secondaire",
      'x-labels': {
        ACH: 'Ancien chemin',
        AER: 'Aéroport',
        AIRE: 'Aire',
        ALL: 'Allée',
        ART: 'Ancienne route',
        AV: 'Avenue',
        AVE: 'Avenue',
        BASE: 'Base',
        BD: 'Boulevard',
        BRG: 'Bourg',
        CAMI: 'Cami',
        CAR: 'Carrefour',
        CC: 'Chemin communal',
        CD: 'Chemin départemental',
        CF: 'Chemin forestier',
        CHE: 'Chemin',
        CHEM: 'Cheminement',
        CHL: 'Chalet',
        CHP: 'Champs',
        CHS: 'Chaussée',
        CHT: 'Château',
        CHV: 'Chemin vicinal',
        CITE: 'Cité',
        CLOS: 'Clos',
        COIN: 'Coin',
        COR: 'Corniche',
        COTE: 'Cote',
        COUR: 'Cour',
        CR: 'Chemin rural',
        CRS: 'Cours',
        DOM: 'Domaine',
        DSC: 'Descente',
        ECA: 'Ecart',
        ESP: 'Esplanade',
        ESPA: 'Espace',
        FBG: 'Faubourg',
        FG: 'Faubourg',
        FON: 'Fontaine',
        FRM: 'Ferme',
        GARE: 'Gare',
        GPL: 'Grand-place',
        GR: 'Grande Rue',
        HAB: 'Habitation',
        HAM: 'Hameau',
        HLE: 'Halle',
        HLM: 'Habitation à loyer modéré',
        HOT: 'Hôtel',
        ILOT: 'Ilôt',
        IMP: 'Impasse',
        JARD: 'Jardin',
        LD: 'Lieu dit',
        LDT: 'Lieu-dit',
        LOT: 'Lotissement',
        MAR: 'Marché',
        MTE: 'Montée',
        PAE: 'Parc d’activités économiques',
        PARC: 'Parc',
        PAS: 'Passage',
        PL: 'Place',
        PLAN: 'Plan',
        PLN: 'Plaine',
        PLT: 'Plateau',
        PONT: 'Pont',
        PORT: 'Port',
        PRO: 'Promenade',
        PROM: 'Promenade',
        PRV: 'Parvis',
        QRT: 'Quartier',
        QUA: 'Quartier',
        QUAI: 'Quai',
        RD: 'Route départementale',
        RES: 'Résidence',
        RLE: 'Ruelle',
        ROC: 'Rocade',
        RPT: 'Rond Point',
        RTE: 'Route',
        RUE: 'Rue',
        SEN: 'Sente - Sentier',
        SQ: 'Square',
        STDE: 'Stade',
        TOUR: 'Tour',
        TPL: 'Terre-plein',
        TRA: 'Traverse',
        VALL: 'Vallée',
        VC: 'Voie communale',
        VCHE: 'Vieux chemin',
        VIL: 'Ville',
        VLA: 'Villa',
        VLGE: 'Village',
        VOIE: 'Voie',
        VTE: 'Vieille route',
        ZA: 'Zone artisanale',
        ZAC: "Zone d'aménagement concerté",
        ZAD: "Zone d'aménagement différé",
        ZI: 'Zone industrielle',
        ZONE: 'Zone'
      },
      'x-group': "Adresse secondaire de l'établissement"
    },
    {
      key: 'libelleVoie2Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        textStandard: false,
        values: false
      },
      description: "Libellé de la voie de l'adresse secondaire, dans le cas où l'établissement dispose d'une entrée secondaire.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : libelleVoie2Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#libellevoie2etablissement)",
      title: "Libellé de voie de l'adresse secondaire",
      'x-group': "Adresse secondaire de l'établissement"
    },
    {
      key: 'codePostal2Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code postal de l'adresse secondaire de l'établissement, dans le cas où celui-ci dispose d'une entrée secondaire.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : codePostal2Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#codepostal2etablissement)",
      title: "Code postal de l'adresse secondaire",
      'x-group': "Adresse secondaire de l'établissement"
    },
    {
      key: 'codeCommune2Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code de la commune de l'adresse secondaire de l'établissement, hors adresse à l'étranger.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\n[Documentation Insee : codeCommune2Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#codecommune2etablissement)",
      title: "Code commune de l'adresse secondaire",
      'x-group': "Adresse secondaire de l'établissement"
    },
    {
      key: 'libelleCommune2Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        textStandard: false
      },
      description: "Libellé de la commune de l'adresse secondaire de l'établissement, si celui-ci n'est pas à l'étranger.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\n[Documentation Insee : libelleCommune2Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#libellecommune2etablissement)",
      title: "Libellé de la commune de l'adresse secondaire",
      'x-group': "Adresse secondaire de l'établissement"
    },
    {
      key: 'distributionSpeciale2Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        textStandard: false,
        values: false
      },
      description: "Distribution spéciale de l'adresse secondaire de l'établissement : éléments particuliers qui accompagnent une adresse secondaire de distribution spéciale.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : distributionSpeciale2Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#distributionspeciale2etablissement)",
      title: "Distribution spéciale de l'adresse secondaire de l'établissement",
      'x-group': "Adresse secondaire de l'établissement"
    },
    {
      key: 'codeCedex2Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code cedex de l'adresse secondaire de l'établissement, élément facultatif constitutif de l'adresse secondaire.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : codeCedex2Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#codecedex2etablissement)",
      title: "Code cedex de l'adresse secondaire",
      'x-group': "Adresse secondaire de l'établissement"
    },
    {
      key: 'libelleCedex2Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        textStandard: false
      },
      description: "Libellé correspondant au code cedex de l'adresse secondaire. Ce libellé est celui utilisé dans la ligne 6 d'adresse pour l'acheminement postal.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\nPour les unités en diffusion partielle (`statutDiffusionEtablissement` ou `statutDiffusionUniteLegale` à `P`), cette variable vaut `[ND]` (non diffusée).\n\n[Documentation Insee : libelleCedex2Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#libellecedex2etablissement)",
      title: "Libellé du code cedex de l'adresse secondaire",
      'x-group': "Adresse secondaire de l'établissement"
    },
    {
      key: 'codePaysEtranger2Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Code du pays de localisation de l'adresse secondaire de l'établissement, pour les adresses à l'étranger.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\n[Documentation Insee : codePaysEtranger2Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#codepaysetranger2etablissement)",
      title: "Code pays de l'adresse secondaire pour un établissement situé à l'étranger",
      'x-group': "Adresse secondaire de l'établissement"
    },
    {
      key: 'libellePaysEtranger2Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false
      },
      description: "Libellé du pays de localisation de l'adresse secondaire de l'établissement, si celui-ci est à l'étranger.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\n[Documentation Insee : libellePaysEtranger2Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#libellepaysetranger2etablissement)",
      title: "Libellé du pays de l'adresse secondaire pour un établissement situé à l'étranger",
      'x-group': "Adresse secondaire de l'établissement"
    },
    {
      key: 'libelleCommuneEtranger2Etablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false
      },
      description: "Libellé de la commune de l'adresse secondaire pour un établissement situé à l'étranger.\n\n**Cette variable n'est plus alimentée par l'Insee** : elle est désormais toujours vide. Seules subsistent des valeurs héritées des versions antérieures du répertoire.\n\n[Documentation Insee : libelleCommuneEtranger2Etablissement](https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc?page=b3de84fd-4007-421f-9e84-fd4007321fc7#libellecommuneetranger2etablissement)",
      title: "Libellé de la commune de l'adresse secondaire pour un établissement situé à l'étranger",
      'x-group': "Adresse secondaire de l'établissement"
    }
  ]
}

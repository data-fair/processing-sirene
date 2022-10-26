module.exports = {
  isRest: true,
  title: 'Sirene',
  primaryKey: [
    'siret'
  ],
  schema: [
    {
      key: 'siren',
      type: 'string',
      description: "Un numéro d'identité de l'unité légale est attribué par l'Insee à toutes les personnes physiques ou morales inscrites au répertoire ainsi qu'à leurs établissements : le numéro Siren. Ce numéro unique est « attribué soit à l'occasion des demandes d'immatriculation au registre du commerce et des sociétés ou des déclarations effectuées au répertoire des métiers, soit à la demande d'administrations » (article R123-224 du code de commerce). Lors de sa création, une unité légale se voit attribuer un numéro Siren de 9 chiffres.\n\nhttps://www.sirene.fr/sirene/public/variable/siren",
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
      description: "Le numéro interne de classement permet de distinguer les établissements d'une même entreprise. Il est composé de 5 chiffres. Associé au Siren, il forme le Siret de l'établissement. Il est composé de quatre chiffres et d'un cinquième qui permet de contrôler la validité du numéro Siret.\n\nLe Nic est attribué une seule fois au sein de l'entreprise. Si l'établissement ferme, son Nic ne peut être réattribué à un nouvel établissement.\n\nhttps://www.sirene.fr/sirene/public/variable/nic",
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
      description: "Le numéro Siret est le numéro unique d'identification attribué à chaque établissement par l'Insee. Ce numéro est un simple numéro d'ordre, composé de 14 chiffres non significatifs : les neuf premiers correspondent au numéro Siren de l'entreprise dont l'établissement dépend et les cinq derniers à un numéro interne de classement (Nic).\n\nUne entreprise est constituée d'autant d'établissements qu'il y a de lieux différents où elle exerce son activité. L'établissement est fermé quand l'activité cesse dans l'établissement concerné ou lorsque l'établissement change d'adresse.\n\nhttps://www.sirene.fr/sirene/public/variable/siret",
      'x-refersTo': 'http://www.datatourisme.fr/ontology/core/1.0/#siret',
      title: 'Numéro Siret',
      'x-group': "Identification de l'établissement"
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
      description: 'Seuls les établissements diffusibles sont accessibles à tout public (statutDiffusionEtablissement=O).\n\nhttps://www.sirene.fr/sirene/public/variable/statutDiffusionEtablissement',
      'x-labels': {
        O: 'Établissement diffusable',
        N: 'Personne physique ayant demandé à être exclue de la diffusion'
      },
      title: "Statut de diffusion de l'établissement",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'dateCreationEtablissement',
      type: 'string',
      format: 'date',
      description: "La date de création correspond à la date qui figure dans les statuts de l'entreprise qui sont déposés au CFE compétent.\n\nPour les établissements des unités purgées (unitePurgeeUniteLegale=true) : si la date de création est au 01/01/1900 dans Sirene, la date est forcée à null.\n\nDans tous les autres cas, la date de création n'est jamais à null. Si elle est non renseignée, elle sera au 01/01/1900.\n\nLa date de création ne correspond pas obligatoirement à dateDebut de la première période de l'établissement, certaines variables historisées pouvant posséder des dates de début soit au 1900-01-01, soit antérieures à la date de création.\n\nhttps://www.sirene.fr/sirene/public/variable/dateCreationEtablissement",
      'x-capabilities': {
        textStandard: false
      },
      title: "Date de création de l'établissement",
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
      description: "Il s'agit d'une variable statistique, millésimée au 31/12 d'une année donnée (voir variable anneeEffectifsEtablissement).\n\nhttps://www.sirene.fr/sirene/public/variable/trancheEffectifsEtablissement",
      title: "Tranche d'effectif salarié de l'établissement",
      'x-labels': {
        NN: 'Etablissement non employeur',
        '00': '0 salarié',
        '01': '1 ou 2 salariés',
        '02': '3 à 5 salariés',
        '03': '6 à 9 salariés',
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
        53: '10 000 salariés et plus'
      },
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'anneeEffectifsEtablissement',
      type: 'integer',
      description: "Seule la dernière année de mise à jour de l'effectif salarié de l'établissement est donnée si celle-ci est inférieure ou égale à l'année d'interrogation-3. Ainsi une interrogation en 2018 ne renverra la dernière année de mise à jour de l'effectif que si cette année est supérieure ou égale à 2015.\n\nhttps://www.sirene.fr/sirene/public/variable/anneeEffectifsEtablissement",
      title: "Année de validité de la tranche d'effectif salarié de l'établissement",
      'x-capabilities': {
        textStandard: false
      },
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'activitePrincipaleRegistreMetiersEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false
      },
      description: "Cette variable désigne le code de l'activité exercée par l'artisan inscrit au registre des métiers selon la Nomenclature d'Activités Française de l'Artisanat (NAFA).\n\nhttps://www.sirene.fr/sirene/public/variable/activitePrincipaleRegistreMetiersEtablissement",
      title: "Activité exercée par l'artisan inscrit au registre des métiers",
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'dateDernierTraitementEtablissement',
      type: 'string',
      format: 'date-time',
      description: 'Cette date peut concerner des mises à jour de données du répertoire Sirene qui ne sont pas diffusées par API Sirene.\n\nhttps://www.sirene.fr/sirene/public/variable/dateDernierTraitementEtablissement',
      title: "Date du dernier traitement de l'établissement dans le répertoire Sirene",
      'x-capabilities': {
        textStandard: false
      },
      'x-group': "Informations sur l'établissement"
    },
    {
      key: 'etablissementSiege',
      type: 'boolean',
      description: "C'est une variable booléenne qui indique si l'établissement est le siège ou non de l'unité légale.\n\nhttps://www.sirene.fr/sirene/public/variable/etablissementSiege",
      title: "Qualité de siège ou non de l'établissement",
      'x-capabilities': {
        textStandard: false
      },
      'x-group': "Informations sur l'établissement"
    },

    {
      key: 'etatAdministratifUniteLegale',
      type: 'string',
      title: "État administratif de l'unité légale",
      description: `Le passage à l'état « Cessée » découle de la prise en compte d'une déclaration de cessation administrative. Pour les personnes morales, cela correspond au dépôt de la déclaration de disparition de la personne morale. Pour les personnes physiques, cela correspond soit à la prise en compte de la déclaration de cessation d'activité déposée par l'exploitant soit au décès de l'exploitant conformément à la réglementation. En dehors de ces cas, l'unité légale est toujours à l'état administratif « Active ».

Pour les personnes morales, la cessation administrative est, en théorie, définitive, l'état administratif "Cessée" est irréversible.
      
Cependant, il existe actuellement dans la base un certain nombre d'unités légales personnes morales avec un historique d'état présentant un état cessé entre deux périodes à l'état actif. Pour les personnes physiques, dans le cas où l'exploitant déclare la cessation de son activité, puis la reprend quelque temps plus tard, cet état est réversible. Il est donc normal d'avoir des périodes successives d'état actif puis cessé pour les personnes physiques. En règle générale, la première période d'historique d'une unité légale correspond à un etatAdministratifUniteLegale égal à « Active ». Toutefois, l'état administratif peut être à null (première date de début de l'état postérieure à la première date de début d'une autre variable historisée).

https://www.sirene.fr/sirene/public/variable/etatAdministratifUniteLegale`,
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      'x-labels': {
        A: 'Actif',
        F: 'Fermé'
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
      description: 'Seules les unités légales diffusibles sont accessibles à tout public (statutDiffusionUniteLegale=O).\n\nhttps://www.sirene.fr/sirene/public/variable/statutDiffusionUniteLegale',
      'x-labels': {
        O: 'unité légale faisant partie de la diffusion publique',
        N: 'personne physique ayant demandé à être exclue de la diffusion'
      },
      title: "Statut de diffusion de l'unité légale",
      'x-group': "Informations sur l'unité légale"
    },

    {
      key: 'unitePurgeeUniteLegale',
      type: 'boolean',
      description: `Cette variable indique si l'unité légale a été purgée.

      Pour des raisons de capacité de stockage des données, les données concernant les entreprises cessées avant le 31/12/2002 ont été purgées.
      
Pour ces unités cessées dites purgées :
      
Seules les dernières valeurs des variables de niveau Unité Légale et de niveau Etablissement sont conservées
En théorie, seul l'établissement siège au moment de la purge est conservé avec uniquement les dernières valeurs de cet établissement. Toutefois, pour plus de 300 unités légales purgées de la base, cette règle n'est pas respectée et ces unités ont toujours plus d'un établissement en base sans pouvoir garantir que tous les établissements ont été conservés.
Plus de 4 millions d'unités légales sont purgées. Plus d'une unité purgée sur quatre a une date de création indéterminée.
      
Diffusion des unités purgées : l'état administratif de l'unité purgée est : cessé. L'indicatrice unitePurgeeUniteLegale est présente et est égale à true.
      
Diffusion des établissements des unités purgées : une seule période avec dateDebut=date de début de l'état fermé si cette date est renseignée, sinon dateDebut (établissement) est à null. L'état administratif de l'établissement est : fermé.

https://www.sirene.fr/sirene/public/variable/unitePurgeeUniteLegale`,
      title: 'Unité légale purgée',
      'x-capabilities': {
        textStandard: false
      },
      'x-group': "Informations sur l'unité légale"
    },

    {
      key: 'dateCreationUniteLegale',
      type: 'string',
      format: 'date',
      description: `
La date de création correspond à la date qui figure dans les statuts de l'entreprise qui sont déposés au CFE compétent.

Pour les unités purgées (unitePurgeeUniteLegale=true) : si la date de création est au 01/01/1900 dans Sirene, la date est forcée à null.
      
Dans tous les autres cas, la date de création n'est jamais à null. Si elle est non renseignée, elle sera au 01/01/1900. La date de création ne correspond pas obligatoirement à dateDebut de la première période de l'unité légale.
      
Certaines variables historisées peuvent posséder des dates de début soit au 01/01/1900, soit antérieures à la date de création.

https://www.sirene.fr/sirene/public/variable/dateCreationUniteLegale`,
      'x-capabilities': {
        textStandard: false
      },
      title: "Date de création de l'unité légale",
      'x-group': "Identification de l'unité légale"
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
      description: `
Cette variable est à 1000 pour les personnes physiques.

Lors de son dépôt de demande de création, le déclarant indique la forme juridique de l'unité légale qu'il crée, qui est ensuite traduite en code. Ce code est modifiable, à la marge, au cours de la vie de l'unité légale (pour les personnes morales) en fonction des déclarations de l'exploitant. Pour chaque unité légale, il existe à un instant donné un seul code Catégorie juridique. Il est attribué selon la nomenclature en vigueur.
      
https://www.sirene.fr/sirene/public/variable/categorieJuridiqueUniteLegale`,
      title: "Catégorie juridique de l'unité légale",
      'x-group': "Informations sur l'unité légale"
    },

    {
      key: 'denominationUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: `
Cette variable désigne la raison sociale pour les personnes morales. Il s'agit du nom sous lequel est déclarée l'unité légale.

Cette variable est à null pour les personnes physiques.

La dénomination peut parfois contenir la mention de la forme de la société (SA, SAS, SARL, etc.).

https://www.sirene.fr/sirene/public/variable/denominationUniteLegale
      `,
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
      description: `
Un sigle est une forme réduite de la raison sociale ou de la dénomination d'une personne morale ou d'un organisme public.

Il est habituellement constitué des initiales de certains des mots de la dénomination. Afin d'en faciliter la prononciation, il arrive qu'on retienne les deux ou trois premières lettres de certains mots : il s'agit alors, au sens strict, d'un acronyme; mais l'usage a étendu à ce cas l'utilisation du terme sigle.
      
Cette variable est à null pour les personnes physiques.
      
Elle peut être non renseignée pour les personnes morales.

https://www.sirene.fr/sirene/public/variable/sigleUniteLegale
      `,
      title: "Sigle de l'unité légale",
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
      description: `
Cette variable est à null pour les personnes morales.

La variable sexeUniteLegale est également non renseignée pour quelques personnes physiques.

https://www.sirene.fr/sirene/public/variable/sexeUniteLegale
      `,
      title: 'Caractère féminin ou masculin de la personne physique',
      'x-labels': {
        M: 'Masculin',
        F: 'Féminin'
      },
      'x-group': "Identification de l'unité légale"
    },

    {
      key: 'nomUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: `
Cette variable indique le libellé le nom de naissance pour une personne physique.

Cette variable est à null pour les personnes morales.

https://www.sirene.fr/sirene/public/variable/nomUniteLegale
      `,
      title: 'Nom de naissance de la personnes physique',
      'x-group': "Identification de l'unité légale"
    },

    {
      key: 'nomUsageUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        textStandard: false
      },
      description: `
Le nom d'usage est celui que la personne physique a choisi d'utiliser.

Cette variable est à null pour les personnes morales. Elle peut être également à null pour les personnes physiques.

https://www.sirene.fr/sirene/public/variable/nomUsageUniteLegale
      `,
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
      description: `
Les variables prenom1UniteLegale à prenom4UniteLegale sont les prénoms déclarés pour une personne physique.

Ces variables sont à null pour les personnes morales.
      
Toute personne physique sera identifiée au minimum par son nom de naissance et son premier prénom.
      
La variable prenom1UniteLegale peut être à null pour des personnes physiques (unités purgées).

https://www.sirene.fr/sirene/public/variable/prenom1UniteLegale
      `,
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
      description: 'https://www.sirene.fr/sirene/public/variable/prenom2UniteLegale',
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
      description: 'https://www.sirene.fr/sirene/public/variable/prenom3UniteLegale',
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
      description: 'https://www.sirene.fr/sirene/public/variable/prenom4UniteLegale',
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
      description: `
Le prénom usuel est le prénom par lequel une personne choisit de se faire appeler dans la vie courante, parmi l'ensemble de ceux qui lui ont été donnés à sa naissance et qui sont inscrits à l'état civil.

Il correspond généralement au prenom1UniteLegale.

https://www.sirene.fr/sirene/public/variable/prenomUsuelUniteLegale`,
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
      description: `
Cette variable correspond au nom qu'une personne utilise pour se désigner dans l'exercice de son activité, généralement littéraire ou artistique.

Le pseudonyme est protégé, comme le nom de famille, contre l'usurpation venant d'un tiers.

https://www.sirene.fr/sirene/public/variable/pseudonymeUniteLegale`,
      title: 'Pseudonyme de la personne physique',
      'x-group': "Identification de l'unité légale"
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
      description: `
Lors de son inscription au répertoire, l'Insee attribue à toute unité légale un code dit « APE » sur la base de la description de l'activité principale faite par le déclarant. Ce code est modifiable au cours de la vie de l'unité légale en fonction des déclarations de l'exploitant.

Pour chaque unité légale, il existe à un instant donné un seul code « APE». Il est attribué selon la nomenclature en vigueur. La nomenclature en vigueur est la Naf Rév2 et ce depuis le 1er Janvier 2008. Chaque code comporte 2 chiffres, un point, 2 chiffres et une lettre. Toutes les unités légales actives au 01/01/2008 ont eu leur code APE recodé dans la nouvelle nomenclature, ainsi de très nombreuses entreprises ont une période débutant à cette date.
      
Au moment de la déclaration de l'entreprise, il peut arriver que l'Insee ne soit pas en mesure d'attribuer le bon code APE : la modalité 00.00Z peut alors être affectée provisoirement.

https://www.sirene.fr/sirene/public/variable/activitePrincipaleUniteLegale`,
      title: "Activité principale de l'unité légale",
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
      description: 'Contient le même code que le champ activitePrincipaleUniteLegale mais uniquement si la nomenclature est NAFRev2.',
      title: "Activité principale de l'unité légale (NAFRev2)",
      'x-group': "Informations sur l'unité légale",
      'x-refersTo': 'http://www.datatourisme.fr/ontology/core/1.0#apeNaf'
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
      description: 'Contient le même code que le champ activitePrincipaleUniteLegale mais uniquement si la nomenclature est NAFRev1.',
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
      description: 'Contient le même code que le champ activitePrincipaleUniteLegale mais uniquement si la nomenclature est NAF1993.',
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
      description: 'Contient le même code que le champ activitePrincipaleUniteLegale mais uniquement si la nomenclature est NAP.',
      title: "Activité principale de l'unité légale (NAP)",
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
      description: `Cette variable indique la nomenclature d'activité correspondant à la variable activitePrincipaleUniteLegale.

(cf. ActivitePrincipaleUniteLegale)

https://www.sirene.fr/sirene/public/variable/nomenclatureActivitePrincipaleEtablissement`,
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
      key: 'identifiantAssociationUniteLegale',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: `
Lors de sa déclaration en préfecture, l'association reçoit automatiquement un numéro d'inscription au RNA. Elle doit en outre demander son immatriculation au répertoire Sirene lorsqu'elle souhaite demander des subventions auprès de l'État ou des collectivités territoriales, lorsqu'elle emploie des salariés ou lorsqu'elle exerce des activités qui conduisent au paiement de la TVA ou de l'impôt sur les sociétés.

Le RNA est le fichier national, géré par le ministère de l'Intérieur, qui recense l'ensemble des informations sur les associations.

https://www.sirene.fr/sirene/public/variable/identifiantAssociationUniteLegale`,
      title: 'Numéro au Répertoire National des Associations',
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
      description: `
Cette variable indique si l'entreprise appartient au champ de l'économie sociale et solidaire. La loi n° 2014-856 du 31 juillet 2014 définit officiellement le périmètre de l'économie sociale et solidaire (ESS). Celle-ci comprend les quatre familles traditionnelles en raison de leur régime juridique (associations, fondations, coopératives et mutuelles) et inclut une nouvelle catégorie, les entreprises de l'ESS, adhérant aux mêmes principes :

poursuivre un but social autre que le seul partage des bénéfices ;
un caractère lucratif encadré (notamment des bénéfices majoritairement consacrés au maintien et au développement de l'activité) ;
une gouvernance démocratique et participative.

https://www.sirene.fr/sirene/public/variable/economieSocialeSolidaireUniteLegale`,
      title: "Appartenance au champ de l'économie sociale et solidaire",
      'x-labels': {
        O: "l'entreprise appartient au champ de l'économie sociale et solidaire",
        N: "l'entreprise n'appartient pas au champ de l'économie sociale et solidaire"
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
      description: `
Cette variable indique si l'entreprise appartient au champ des sociétés à mission. L'article 176 de la loi du 22 mai 2019 relative à la croissance et la transformation des entreprises, dite loi Pacte, introduit la qualité de société à mission. Il permet à une société de faire publiquement état de la qualité de société à mission en précisant sa raison d'être ainsi quun ou plusieurs objectifs sociaux et environnementaux que la société se donne pour mission de poursuivre dans le cadre de son activité.

https://www.sirene.fr/sirene/public/variable/societeMissionUniteLegale`,
      title: 'Appartenance au champ des sociétés à mission',
      'x-labels': {
        O: "l'entreprise appartient au champ des sociétés à mission",
        N: "l'entreprise n'appartient pas au champ des sociétés à mission"
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
      description: `Lors de sa formalité de création, le déclarant indique si l'unité légale aura ou non des employés. Par la suite, le déclarant peut également faire des déclarations de prise d'emploi et de fin d'emploi. La prise en compte d'une déclaration de prise d'emploi bascule immédiatement l'unité légale en « Employeuse ». Inversement, lorsqu'une déclaration de fin d'emploi est traitée, l'unité légale devient « Non employeuse ».

Le caractère employeur est O si au moins l'un des établissements actifs de l'unité légale emploie des salariés.
      
https://www.sirene.fr/sirene/public/variable/caractereEmployeurUniteLegale`,
      title: "Caractère employeur de l'établissement",
      'x-labels': {
        O: 'unité légale employeuse',
        N: 'unité légale non employeuse'
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
      description: "Il s'agit d'une variable statistique, millésimée au 31/12 d'une année donnée (voir variable anneeEffectifsUniteLegale).\n\nhttps://www.sirene.fr/sirene/public/variable/trancheEffectifsUniteLegale",
      title: "Tranche d'effectif salarié de l'unité légale",
      'x-labels': {
        NN: 'Unité non employeuse',
        '00': '0 salarié',
        '01': '1 ou 2 salariés',
        '02': '3 à 5 salariés',
        '03': '6 à 9 salariés',
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
        53: '10 000 salariés et plus'
      },
      'x-group': "Informations sur l'unité légale"
    },
    {
      key: 'anneeEffectifsUniteLegale',
      type: 'integer',
      description: "Seule la dernière année de mise à jour de l'effectif salarié de l'unité légale est donnée si celle-ci est inférieure ou égale à l'année d'interrogation-3. Ainsi une interrogation en 2018 ne renverra la dernière année de mise à jour de l'effectif que si cette année est supérieure ou égale à 2015.\n\nhttps://www.sirene.fr/sirene/public/variable/anneeEffectifsEtablissement",
      title: "Année de validité de la tranche d'effectif salarié de l'unité légale",
      'x-capabilities': {
        textStandard: false
      },
      'x-group': "Informations sur l'unité légale"
    },

    {
      key: 'nicSiegeUniteLegale',
      type: 'string',
      description: `Le siège d'une unité légale est le lieu où sont centralisées l'administration et la direction effective de l'unité légale.

À un instant donné, chaque unité légale a un seul siège. Mais, au cours de la vie de l'unité légale, le siège peut être différent. Chaque siège est identifié par un numéro Nic (Numéro Interne de Classement de l'établissement) qui respecte les règles d'attribution des numéros d'établissement.
      
Le Nic est composé de quatre chiffres et d'un cinquième qui permet de contrôler la validité du numéro Siret (concaténation du numéro Siren et du Nic).

https://www.sirene.fr/sirene/public/variable/nicSiegeUniteLegale`,
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
      description: 'Cette date peut concerner des mises à jour de données du répertoire Sirene qui ne sont pas diffusées.\n\nhttps://www.sirene.fr/sirene/public/variable/dateDernierTraitementUniteLegale',
      title: "Date du dernier traitement de l'unité légale dans le répertoire Sirene",
      'x-capabilities': {
        textStandard: false
      },
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
      description: `
La catégorie d'entreprise est une variable statistique et calculée par l'Insee. Ce n'est pas une variable du répertoire Sirene.

Définition de la catégorie d'entreprise : https://www.insee.fr/fr/metadonnees/definition/c1057
      
Méthodologie de calcul et diffusion de la catégorie d'entreprise : https://www.insee.fr/fr/information/1730869
      
https://www.sirene.fr/sirene/public/variable/categorieEntreprise`,
      title: "Catégorie à laquelle appartient l'entreprise",
      'x-labels': {
        PME: 'petite ou moyenne entreprise',
        ETI: 'entreprise de taille intermédiaire',
        GE: 'grande entreprise'
      },
      'x-group': "Informations sur l'unité légale"
    },

    {
      key: 'anneeCategorieEntreprise',
      type: 'integer',
      description: "Cette variable désigne l'année de validité correspondant à la catégorie d'entreprise diffusée.\n\nhttps://www.sirene.fr/sirene/public/variable/anneeCategorieEntreprise",
      title: "Année de validité de la catégorie d'entreprise",
      'x-capabilities': {
        textStandard: false
      },
      'x-group': "Informations sur l'unité légale"
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
      description: "Cette variable est un élément constitutif de l'adresse.\n\nC'est une variable facultative qui précise l'adresse avec :\n\nune indication d'étage, d'appartement, de porte, de N° de boîte à lettres,\nla désignation d'un bâtiment, d'un escalier, d'une entrée, d'un bloc,\nle nom d'une résidence, d'un ensemble\n\nhttps://www.sirene.fr/sirene/public/variable/complementAdresseEtablissement",
      title: "Complément d'adresse",
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'numeroVoieEtablissement',
      type: 'string',
      description: "C'est un élément constitutif de l'adresse.\n\nhttps://www.sirene.fr/sirene/public/variable/numeroVoieEtablissement",
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
      description: "C'est' un élément constitutif de l'adresse.\n\nElle doit être associée à la variable numeroVoieEtablissement.\n\nhttps://www.sirene.fr/sirene/public/variable/indiceRepetitionEtablissement",
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
      description: "C'est un élément constitutif de l'adresse.\n\nhttps://www.sirene.fr/sirene/public/variable/typeVoieEtablissement",
      title: 'Type de voie',
      'x-labels': {
        AIRE: 'Aire',
        ALL: 'Allée',
        AV: 'Avenue',
        BASE: 'Base',
        BD: 'Boulevard',
        CAMI: 'Cami',
        CAR: 'Carrefour',
        CHE: 'Chemin',
        CHEM: 'Cheminement',
        CHS: 'Chaussée',
        CITE: 'Cité',
        CLOS: 'Clos',
        COIN: 'Coin',
        COR: 'Corniche',
        COTE: 'Cote',
        COUR: 'Cour',
        CRS: 'Cours',
        DOM: 'Domaine',
        DSC: 'Descente',
        ECA: 'Ecart',
        ESP: 'Esplanade',
        FG: 'Faubourg',
        GARE: 'Gare',
        GR: 'Grande Rue',
        HAM: 'Hameau',
        HLE: 'Halle',
        ILOT: 'Ilôt',
        IMP: 'Impasse',
        LD: 'Lieu dit',
        LOT: 'Lotissement',
        MAR: 'Marché',
        MTE: 'Montée',
        PARC: 'Parc',
        PAS: 'Passage',
        PL: 'Place',
        PLAN: 'Plan',
        PLN: 'Plaine',
        PLT: 'Plateau',
        PONT: 'Pont',
        PORT: 'Port',
        PRO: 'Promenade',
        PRV: 'Parvis',
        QUA: 'Quartier',
        QUAI: 'Quai',
        RES: 'Résidence',
        RLE: 'Ruelle',
        ROC: 'Rocade',
        RPT: 'Rond Point',
        RTE: 'Route',
        RUE: 'Rue',
        SEN: 'Sente - Sentier',
        SQ: 'Square',
        TOUR: 'Tour',
        TPL: 'Terre-plein',
        TRA: 'Traverse',
        VLA: 'Villa',
        VLGE: 'Village',
        VOIE: 'Voie',
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
      description: "Cette variable indique le libellé de voie de la commune de localisation de l'établissement.\n\nC'est un élément constitutif de l'adresse.\n\nCette variable est facultative : elle n'est pas toujours renseignée, en particulier dans les petites communes.\n\nhttps://www.sirene.fr/sirene/public/variable/libelleVoieEtablissement",
      title: 'Libellé de voie',
      'x-refersTo': 'http://schema.org/streetAddress',
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'codePostalEtablissement',
      type: 'string',
      description: "Cette variable désigne le code postal de l'adresse de l'établissement.\n\nPour les adresses à l'étranger (codeCommuneEtablissement commence par 99), cette variable est à null.\n\nhttps://www.sirene.fr/sirene/public/variable/codePostalEtablissement",
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
      key: 'libelleCommuneEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        textStandard: false,
        values: false
      },
      description: "Cette variable indique le libellé de la commune de localisation de l'établissement si celui-ci n'est pas à l'étranger.\n\nC'est un élément constitutif de l'adresse.\n\nhttps://www.sirene.fr/sirene/public/variable/libelleCommuneEtablissement",
      title: 'Libellé de la commune',
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
      description: "Cette variable est un élément constitutif de l'adresse pour les établissements situés sur le territoire étranger (la variable codeCommuneEtablissement est vide).\n\nhttps://www.sirene.fr/sirene/public/variable/libelleCommuneEtrangerEtablissement",
      title: "Libellé de la commune pour un établissement situé à l'étranger",
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
      description: "La distribution spéciale reprend les éléments particuliers qui accompagnent une adresse de distribution spéciale. C'est un élément constitutif de l'adresse.\n\nhttps://www.sirene.fr/sirene/public/variable/distributionSpecialeEtablissement",
      title: "Distribution spéciale de l'établissement",
      'x-group': "Adresse de l'établissement"
    },
    {
      key: 'codeCommuneEtablissement',
      type: 'string',
      description: "Cette variable désigne le code de la commune de localisation de l'établissement, hors adresse à l'étranger.\n\nLe code commune correspond au code commune existant à la date de la mise à disposition : toute modification du code officiel géographique est répercutée sur la totalité des établissements (même ceux fermés) correspondant à ce code commune.\n\nPour les établissements localisés à l'étranger, la variable codeCommuneEtablissement est à null.\n\nhttps://www.sirene.fr/sirene/public/variable/codeCommuneEtablissement",
      title: "Code commune de l'établissement",
      'x-capabilities': {
        textStandard: false
      },
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
      description: "Cette variable est un élément constitutif de l'adresse.\n\nhttps://www.sirene.fr/sirene/public/variable/codeCedexEtablissement",
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
      description: "Cette variable indique le libellé correspondant au code cedex de l'établissement si celui-ci est non null. Ce libellé est le libellé utilisé dans la ligne 6 d'adresse pour l'acheminement postal.\n\nhttps://www.sirene.fr/sirene/public/variable/libelleCedexEtablissement",
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
      description: "Cette variable désigne le code du pays de localisation de l'établissement pour les adresses à l'étranger.La variable codePaysEtrangerEtablissement commence toujours par 99 si elle est renseignée. Les 3 caractères suivants sont le code du pays étranger.\n\nhttps://www.sirene.fr/sirene/public/variable/codePaysEtrangerEtablissement",
      title: "Code pays de l'adresse secondaire pour un établissement situé à l'étranger",
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
      description: "Cette variable indique le libellé du pays de localisation de l'établissement si celui-ci est à l'étranger.\n\nC'est un élément constitutif de l'adresse.\n\nhttps://www.sirene.fr/sirene/public/variable/libellePaysEtrangerEtablissement",
      title: "Libellé du pays pour un établissement situé à l'étranger",
      'x-group': "Adresse de l'établissement"
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
      description: "Dans le cas où l'établissement dispose d'une entrée secondaire, cette variable est un élément constitutif de l'adresse secondaire.\n\nC'est une variable facultative qui précise l'adresse secondaire avec :\n\nune indication d'étage, d'appartement, de porte, de N° de boîte à lettres,\nla désignation d'un bâtiment, d'un escalier, d'une entrée, d'un bloc,\nle nom d'une résidence, d'un ensemble\n\nhttps://www.sirene.fr/sirene/public/variable/complementAdresse2Etablissement",
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
      description: "C'est un élément constitutif de l'adresse secondaire.\n\nSi plusieurs numéros de voie sont indiqués (5-7, 5 à 7), l'information complète (5-7) ou (5 à 7) figure en complément d'adresse secondaire et le premier des numéros (5 dans l'exemple) est porté dans la variable numeroVoie2Etablissement.\n\nhttps://www.sirene.fr/sirene/public/variable/numeroVoie2Etablissement",
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
      description: "Cette variable un élément constitutif de l'adresse secondaire.\n\nElle doit être associée à la variable numeroVoie2Etablissement.\n\nhttps://www.sirene.fr/sirene/public/variable/indiceRepetition2Etablissement",
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
      description: "Cette variable est un élément constitutif de l'adresse secondaire.\n\nhttps://www.sirene.fr/sirene/public/variable/typeVoie2Etablissement",
      title: "Type de voie de l'adresse secondaire",
      'x-labels': {
        AIRE: 'Aire',
        ALL: 'Allée',
        AV: 'Avenue',
        BASE: 'Base',
        BD: 'Boulevard',
        CAMI: 'Cami',
        CAR: 'Carrefour',
        CHE: 'Chemin',
        CHEM: 'Cheminement',
        CHS: 'Chaussée',
        CITE: 'Cité',
        CLOS: 'Clos',
        COIN: 'Coin',
        COR: 'Corniche',
        COTE: 'Cote',
        COUR: 'Cour',
        CRS: 'Cours',
        DOM: 'Domaine',
        DSC: 'Descente',
        ECA: 'Ecart',
        ESP: 'Esplanade',
        FG: 'Faubourg',
        GARE: 'Gare',
        GR: 'Grande Rue',
        HAM: 'Hameau',
        HLE: 'Halle',
        ILOT: 'Ilôt',
        IMP: 'Impasse',
        LD: 'Lieu dit',
        LOT: 'Lotissement',
        MAR: 'Marché',
        MTE: 'Montée',
        PARC: 'Parc',
        PAS: 'Passage',
        PL: 'Place',
        PLAN: 'Plan',
        PLN: 'Plaine',
        PLT: 'Plateau',
        PONT: 'Pont',
        PORT: 'Port',
        PRO: 'Promenade',
        PRV: 'Parvis',
        QUA: 'Quartier',
        QUAI: 'Quai',
        RES: 'Résidence',
        RLE: 'Ruelle',
        ROC: 'Rocade',
        RPT: 'Rond Point',
        RTE: 'Route',
        RUE: 'Rue',
        SEN: 'Sente - Sentier',
        SQ: 'Square',
        TOUR: 'Tour',
        TPL: 'Terre-plein',
        TRA: 'Traverse',
        VLA: 'Villa',
        VLGE: 'Village',
        VOIE: 'Voie',
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
      description: "Cette variable indique le libellé de la voie de l'adresse secondaire de l'établissement.\n\nC'est un élément constitutif de l'adresse secondaire.\n\nCette variable est facultative : elle n'est pas toujours renseignée, en particulier dans les petites communes.\n\nhttps://www.sirene.fr/sirene/public/variable/libelleVoie2Etablissement",
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
      description: "Dans le cas où l'établissement dispose d'une entrée secondaire, cette variable désigne le code postal de l'adresse secondaire de l'établissement.\n\nPour les adresses à l'étranger (codeCommune2Etablissement commence par 99), cette variable est à null.\n\nhttps://www.sirene.fr/sirene/public/variable/codePostal2Etablissement",
      title: "Code postal de l'adresse secondaire",
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
      description: "Cette variable indique le libellé de la commune de l'adresse secondaire de l'établissement si celui-ci n'est pas à l'étranger.\n\nC'est un élément constitutif de l'adresse.\n\nhttps://www.sirene.fr/sirene/public/variable/libelleCommune2Etablissement",
      title: "Libellé de la commune de l'adresse secondaire",
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
      description: "Dans le cas où l'établissement dispose d'une entrée secondaire, cette variable est un élément constitutif de l'adresse secondaire pour les établissements situés sur le territoire étranger (la variable codeCommune2Etablissement est vide).\n\nhttps://www.sirene.fr/sirene/public/variable/libelleCommuneEtranger2Etablissement",
      title: "Libellé de la commune de l'adresse secondaire pour un établissement situé à l'étranger",
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
      description: "Dans le cas où l'établissement dispose d'une entrée secondaire, la distribution spéciale reprend les éléments particuliers qui accompagnent l'adresse secondaire de distribution spéciale. C'est un élément constitutif de l'adresse secondaire.\n\nhttps://www.sirene.fr/sirene/public/variable/distributionSpeciale2Etablissement",
      title: "Distribution spéciale de l'adresse secondaire de l'établissement",
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
      description: "Dans le cas où l'établissement dispose d'une entrée secondaire, cette variable désigne le code de la commune de l'adresse secondaire de l'établissement, hors adresse à l'étranger.\n\nLe code commune correspond au code commune existant à la date de la mise à disposition : toute modification du code officiel géographique est répercutée sur la totalité des établissements (même ceux fermés) correspondant à ce code commune.\n\nPour les établissements localisés à l'étranger, la variable codeCommune2Etablissement est à null.\n\nhttps://www.sirene.fr/sirene/public/variable/codeCommune2Etablissement",
      title: "Code commune de l'adresse secondaire",
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
      description: "Dans le cas où l'établissement dispose d'une entrée secondaire, c'est un élément constitutif de l'adresse secondaire.\n\nhttps://www.sirene.fr/sirene/public/variable/codeCedex2Etablissement",
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
      description: "Cette variable indique le libellé correspondant au code cedex de l'adresse secondaire de l'établissement si celui-ci est non null. Ce libellé est le libellé utilisé dans la ligne 6 d'adresse pour l'acheminement postal.\n\nhttps://www.sirene.fr/sirene/public/variable/libelleCedex2Etablissement",
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
      description: "Dans le cas où l'établissement dispose d'une entrée secondaire, cette variable désigne le code du pays de localisation de l'adresse secondaire de l'établissement pour les adresses à l'étranger.\n\nLa variable codePaysEtranger2Etablissement commence toujours par 99 si elle est renseignée. Les 3 caractères suivants sont le code du pays étranger.\n\nhttps://www.sirene.fr/sirene/public/variable/codePaysEtranger2Etablissement",
      title: "Code pays pour un établissement situé à l'étranger",
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
      description: "Cette variable indique le libellé du pays de localisation de l'adresse secondaire de l'établissement si celui-ci est à l'étranger.\n\nC'est un élément constitutif de l'adresse.\n\nhttps://www.sirene.fr/sirene/public/variable/libellePaysEtranger2Etablissement",
      title: "Libellé du pays de l'adresse secondaire pour un établissement situé à l'étranger",
      'x-group': "Adresse secondaire de l'établissement"
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
      description: "Lors de son inscription au répertoire, un établissement est, sauf exception, à l'état « Actif ». Le passage à l'état « Fermé » découle de la prise en compte d'une déclaration de fermeture.\n\nÀ noter qu'un établissement fermé peut être rouvert.\n\nEn règle générale, la première période d'historique d'un établissement correspond à un etatAdministratifUniteLegale égal à « Actif ». Toutefois, l'état administratif peut être à null (première date de début de l'état postérieure à la première date de début d'une autre variable historisée).\n\nhttps://www.sirene.fr/sirene/public/variable/etatAdministratifEtablissement",
      title: "État administratif de l'établissement",
      'x-labels': {
        A: 'Actif',
        F: 'Fermé'
      },
      'x-group': "Informations sur l'établissement"
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
      description: "Les trois variables enseigne1Etablissement, enseigne2Etablissement et enseigne3Etablissement contiennent la ou les enseignes de l'établissement.\n\nL'enseigne identifie l'emplacement ou le local dans lequel est exercée l'activité. Un établissement peut posséder une enseigne, plusieurs enseignes ou aucune.\n\nL'analyse des enseignes et de son découpage en trois variables dans Sirene montre deux cas possibles : soit les 3 champs concernent 3 enseignes bien distinctes, soit ces trois champs correspondent au découpage de l'enseigne qui est déclarée dans la liasse (sur un seul champ) avec une continuité des trois champs.\n\nExemples :\n\nSIRET=53053581400178\n\n\"enseigne1Etablissement\": \"LES SERRURIERS DES YVELINES LES VITRIERS DES YVELI\",\n\"enseigne2Etablissement\": \"NES LES CHAUFFAGISTES DES YVELINES LES PLATRIERS D\",\n\"enseigne3Etablissement\": \"ES YVELINES LES ELECTRICIENS DES YVELINES.\"\nSIRET=05439181800033\n\n\"enseigne1Etablissement\": \"HALTE OCCASIONS\",\n\"enseigne2Etablissement\": \"OUTRE-MER LOCATION\",\n\"enseigne3Etablissement\": \"OUTRE-MER TRANSIT\".\n\nhttps://www.sirene.fr/sirene/public/variable/enseigne1Etablissement",
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
      description: 'https://www.sirene.fr/sirene/public/variable/enseigne2Etablissement',
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
      description: 'https://www.sirene.fr/sirene/public/variable/enseigne3Etablissement',
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
      description: "Cette variable désigne le nom sous lequel l'établissement est connu du grand public.\n\nCet élément d'identification de l'établissement a été enregistré au niveau établissement depuis l'application de la norme d'échanges CFE de 2008. Avant la norme 2008, la dénomination usuelle était enregistrée au niveau de l'unité légale sur trois champs (cf. variables denominationUsuelle1UniteLegale à denominationUsuelle3UniteLegale dans le descriptif des variables du fichier StockUniteLegale).\n\nhttps://www.sirene.fr/sirene/public/variable/denominationUsuelleEtablissement",
      title: "Dénomination usuelle de l'établissement",
      'x-group': "Identification de l'établissement"
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
      description: "Lors de son inscription au répertoire, l'Insee attribue à tout établissement un code dit « APE » sur la base de la description de l'activité principale faite par le déclarant. Ce code est modifiable au cours de la vie de l'établissement en fonction des déclarations de l'exploitant.\n\nPour chaque établissement, il existe à un instant donné un seul code « APE ». Il est attribué selon la nomenclature en vigueur. La nomenclature en vigueur est la Naf Rév2 et ce depuis le 1er Janvier 2008. Chaque code comporte 2 chiffres, un point, 2 chiffres et une lettre. Tous les établissements actifs au 01/01/2008 ont eu leur code APE recodé dans la nouvelle nomenclature, ainsi de très nombreux établissements ont une période débutant à cette date.\n\nAu moment de la déclaration de l'entreprise, il peut arriver que l'Insee ne soit pas en mesure d'attribuer le bon code APE : la modalité 00.00Z peut alors être affectée provisoirement.\n\nhttps://www.sirene.fr/sirene/public/variable/activitePrincipaleEtablissement",
      title: "Activité principale de l'établissement",
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
      description: 'Contient le même code que le champ activitePrincipaleEtablissement mais uniquement si la nomenclature est NAFRev2.',
      title: "Activité principale de l'établissement (NAFRev2)",
      'x-group': "Informations sur l'établissement",
      'x-refersTo': 'http://www.datatourisme.fr/ontology/core/1.0#apeNaf'
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
      description: 'Contient le même code que le champ activitePrincipaleEtablissement mais uniquement si la nomenclature est NAFRev1.',
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
      description: 'Contient le même code que le champ activitePrincipaleEtablissement mais uniquement si la nomenclature est NAF1993.',
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
      description: 'Contient le même code que le champ activitePrincipaleEtablissement mais uniquement si la nomenclature est NAP.',
      title: "Activité principale de l'établissement (NAP)",
      'x-group': "Informations sur l'établissement"
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
      description: "Cette variable indique la nomenclature d'activité correspondant à la variable activitePrincipaleEtablissement\n\n(cf. ActivitePrincipaleEtablissement).\n\nhttps://www.sirene.fr/sirene/public/variable/nomenclatureActivitePrincipaleEtablissement",
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
      key: 'caractereEmployeurEtablissement',
      type: 'string',
      'x-capabilities': {
        textAgg: false,
        insensitive: false,
        text: false,
        textStandard: false
      },
      description: "Lors de sa formalité d'ouverture, le déclarant indique si l'établissement aura ou non des employés. Par la suite, le déclarant peut également faire des déclarations de prise d'emploi et de fin d'emploi. La prise en compte d'une déclaration de prise d'emploi bascule immédiatement l'établissement en « employeur ».\n\nInversement, lorsqu'une déclaration de fin d'emploi est traitée, l'établissement devient « non employeur ».\n\nPour chaque établissement, il existe à un instant donné un seul code « employeur ».\n\nhttps://www.sirene.fr/sirene/public/variable/caractereEmployeurEtablissement",
      title: "Caractère employeur de l'établissement",
      'x-labels': {
        O: 'établissement employeur',
        N: 'établissement non employeur'
      },
      'x-group': "Informations sur l'établissement"
    }
  ]
}

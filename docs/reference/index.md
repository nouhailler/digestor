# Référence

Les tableaux de référence, maintenus à partir du code.

- [Référence des paramètres](settings.md) — tous les réglages, leur identifiant interne, leur stockage
- [Codes et erreurs](errors.md) — tous les messages affichés par l'application
- [Formats de données](data-formats.md) — sauvegarde, imports, tables locales
- [Glossaire](glossary.md) — le vocabulaire employé
- [Compatibilité](compatibility.md) — plateformes, navigateurs, API requises
- [Limites connues](limitations.md) — ce que l'application ne fait pas

## Écrans et navigation

| Onglet | Écran | Documentation |
|---|---|---|
| `journal` | Journal | [Guide](../guide/journal.md) |
| `aliments` | Aliments | [Guide](../guide/aliments.md) |
| `semaine` | Semaine | [Guide](../guide/semaine.md) |
| `evolution` | Évolution | [Guide](../guide/evolution.md) |
| `reperes` | Repères | [Guide](../guide/reperes.md) |

L'application est **mono-page** : il n'y a pas de routes d'URL par écran. Toute adresse
est servie par la page d'accueil.

## Catégories d'aliments

| Valeur | Libellé | Couleur | Sens |
|---|---|---|---|
| `pro` | Pro-candidose / Pro-SIBO | 🔴 `#f0606a` | Sucres, alcool, farines blanches, levures… à limiter |
| `beneficial` | Bénéfique / Anti-fongique | 🟢 `#5fbf6f` | Légumes non amidonnés, ail, gingembre, protéines maigres, bonnes graisses |
| `neutral` | Neutre | ⚪ `#6b6b70` | À consommer avec modération, ou non encore classé |

## Intensités

| Valeur | Libellé | Couleur | Poids |
|---|---|---|---|
| `absent` | Absent | ⚪ `#6b6b70` | 0 |
| `leger` | Léger | 🟢 `#5fbf6f` | 1 |
| `modere` | Modéré | 🟠 `#e8a13a` | 2 |
| `severe` | Sévère | 🔴 `#f0606a` | 3 |

Pour le **stress**, les libellés sont : Aucun · Léger · Modéré · Élevé.

## Symptômes

Regroupés par système corporel, dans cet ordre d'affichage.

| Catégorie | Symptômes |
|---|---|
| **Digestif** | Ballonnements · Gaz / flatulences · Douleurs abdominales · Reflux / brûlures · Diarrhée / selles molles · Constipation · Nausées · Sensation de trop-plein |
| **Cutané** | Démangeaisons cutanées · Démangeaisons visage / cou · Démangeaisons paumes / plantes · Urticaire · Rougeurs / bouffées · Chaleur cutanée · Œdème léger (paupières, lèvres) |
| **Neurologique** | Maux de tête · Migraine · Vertiges / étourdissements · Fatigue après repas · Brouillard mental |
| **Cardiovasculaire** | Palpitations / tachycardie · Hypotension · Hypertension soudaine · Bouffée de chaleur + pouls |
| **ORL / respiratoire** | Nez qui coule / congestion · Éternuements · Toux · Gorge qui gratte · Difficulté respiratoire |
| **Général** | Envie de sucre · Mycose buccale · Malaise général · Anxiété soudaine · Picotement bouche / lèvres · Salivation anormale · Troubles du sommeil |
| **Signes d'alerte** | Gonflement gorge / langue · Difficulté à avaler · Chute de tension / malaise · Urticaire généralisée qui s'aggrave |

> ⚠️ Les **signes d'alerte** décrivent des urgences médicales. Digestor les enregistre
> mais **n'alerte personne** : appelez les secours.

## Niveaux FODMAP et verdicts

| Niveau FODMAP | Verdict SIBO / candidose |
|---|---|
| Bas · Modéré · Élevé · Inconnu | Favorable · Attention · Éviter · Inconnu |

Groupes FODMAP suivis : **fructose**, **lactose**, **fructanes**, **GOS**, **polyols**.

## Amines biogènes

| Bande de charge | Score du jour |
|---|---|
| Faible | < 2 |
| Modérée | ≥ 2 |
| Élevée | ≥ 5, ou combinaison alcool + fromage/charcuterie/fermenté |

Familles déclencheuses : alcool · fromage · charcuterie · fermenté · poisson · autre.
Tolérances : libre · modérée · à éviter.

## Traitements

Types : Antifongique · Antibiotique · Probiotique · Prébiotique · Complément ·
Phytothérapie · Médicament · Autre.

## Réintroductions FODMAP

Groupes : Fructose · Lactose · Fructanes · GOS · Polyols · Autre.
Verdicts : En cours · Toléré · Toléré en quantité limitée · Non toléré · Abandonné.

## Échelle de Bristol

| Type | Aspect | Zone |
|---|---|---|
| 1 | Billes dures séparées | Constipation |
| 2 | En saucisse, grumeleuse | Constipation |
| 3 | Saucisse craquelée | Normal |
| 4 | Saucisse lisse et molle | Normal |
| 5 | Morceaux mous, bords nets | Normal |
| 6 | Morceaux floconneux déchiquetés | Diarrhée |
| 7 | Entièrement liquide | Diarrhée |

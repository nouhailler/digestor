# Symptômes

## Description

Enregistrement des symptômes ressentis, avec quatre niveaux d'intensité, à **deux
niveaux de granularité** : après un repas précis, ou pour la journée entière.

## Objectif

Relier ce que vous ressentez à ce que vous avez mangé, avec assez de finesse pour que
les corrélations « repas → symptôme » soient exploitables.

## Prérequis

Aucun.

## Comment l'utiliser

- **Par repas** : dans le bloc du repas, dépliez **« Symptômes après ce repas »** et
  touchez une pastille. Chaque toucher fait avancer l'intensité :
  **absent → léger → modéré → sévère → absent**.
- **Pour la journée** : section **Symptômes** de la carte du jour, plus un champ
  **« Moment »** (ex. « 2 h après le dîner »).
- Toucher le **libellé** d'un symptôme ouvre sa
  [fiche détaillée](encyclopedie-symptomes.md).

## Options

Les symptômes sont regroupés par système corporel :

| Catégorie | Exemples |
|---|---|
| **Digestif** | Ballonnements, gaz, douleurs abdominales, reflux, diarrhée, constipation, nausées, sensation de trop-plein |
| **Cutané** | Démangeaisons (générales, visage/cou, paumes/plantes), urticaire, rougeurs, chaleur cutanée, œdème léger |
| **Neurologique** | Maux de tête, migraine, vertiges, fatigue après repas, brouillard mental |
| **Cardiovasculaire** | Palpitations, hypotension, hypertension soudaine, bouffée de chaleur + pouls |
| **ORL / respiratoire** | Nez qui coule, éternuements, toux, gorge qui gratte, difficulté respiratoire |
| **Général** | Envie de sucre, mycose buccale, malaise général, anxiété soudaine, picotements bouche/lèvres, salivation anormale, troubles du sommeil |
| **Signes d'alerte** | Gonflement gorge/langue, difficulté à avaler, chute de tension avec malaise, urticaire généralisée qui s'aggrave |

Liste complète : [Référence des symptômes](../reference/index.md#symptômes).

> ⚠️ Les **signes d'alerte** décrivent des situations d'**urgence médicale**. Digestor
> les enregistre mais n'alerte personne à votre place : appelez les secours.

## Paramètres associés

Aucun.

## Données utilisées

`Meal.symptoms` (par repas) et `DayEntry.symptoms` (journée), plus
`DayEntry.symptomTiming`. Toute lecture agrégée utilise le **maximum** des deux
niveaux — un symptôme noté sur un repas compte pour la journée.

## Résultat

- Détermine le **badge de qualité** du jour.
- Alimente le **score de sévérité** (léger = 1, modéré = 2, sévère = 3) tracé dans
  l'Évolution.
- Nourrit les [corrélations](correlations.md) et le [dossier médical](dossier-medical.md).

## Fonctionnement hors connexion

Intégral.

## Fonctionnement en ligne

Identique. Seule la **fiche détaillée** d'un symptôme peut faire appel à l'IA — et
seulement si vous le demandez.

## Limites

- Pas d'horodatage précis d'un symptôme : la granularité maximale est « après ce repas ».
- Pas de durée : seule l'intensité est enregistrée.

## Erreurs possibles

Aucune.

## Dépannage

[Les corrélations ne s'affichent pas](../troubleshooting/pas-de-correlations.md)

## FAQ

- [Faut-il noter les symptômes par repas ou par jour ?](../faq/index.md#faut-il-noter-les-symptômes-par-repas-ou-par-jour)

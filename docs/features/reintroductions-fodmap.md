# Réintroductions FODMAP

## Description

L'outil de la phase de réintroduction du protocole pauvre en FODMAP : tester **un
aliment représentatif d'un groupe à la fois**, par doses croissantes, et consigner le
verdict.

## Objectif

Sortir d'un régime d'élimination de façon méthodique, en sachant lequel des cinq groupes
pose problème, et à quelle dose.

## Prérequis

Aucun. Idéalement mené avec un professionnel de santé.

## Comment l'utiliser

1. **Menu `⋯` → Réintroductions FODMAP**.
2. **Aliment testé** (ex. Miel, Avocat, Lait…).
3. **Groupe FODMAP testé** : Fructose · Lactose · Fructanes · GOS · Polyols · Autre.
4. **Date de début**.
5. **Étapes de dose & réaction** : ajoutez des étapes (ex. « Jour 1 : ¼ d'avocat ») et
   notez la réaction (absent → léger → modéré → sévère) d'un toucher.
6. **Verdict** : En cours · Toléré · Toléré en quantité limitée · Non toléré · Abandonné.
7. **Notes** (seuil de tolérance, contexte).

## Options

Les tests **en cours** apparaissent en premier, puis les autres du plus récent au plus
ancien. Chaque test peut être modifié ou supprimé.

## Paramètres associés

La **phase FODMAP** du [profil santé](profil-sante.md) (Aucune / Élimination /
Réintroduction / Personnalisée) est un contexte transmis à l'IA ; elle n'influe pas sur
cet écran.

## Données utilisées

Table `reintroChallenges` : `id`, `foodName`, `group`, `startDate`, `endDate?`,
`result`, `doses[]`, `notes?`.

## Résultat

Un historique de tests, repris dans le [dossier médical](dossier-medical.md).

## Fonctionnement hors connexion

Intégral.

## Fonctionnement en ligne

Identique.

## Limites

- Digestor ne planifie ni ne rappelle les doses : il enregistre ce que vous faites.
- Le verdict est **le vôtre** : il n'est pas déduit automatiquement des réactions saisies.
- Aucun lien automatique avec les symptômes du journal des mêmes dates.

## Erreurs possibles

Aucune.

## Dépannage

Aucune procédure spécifique.

## FAQ

- [Quel aliment tester pour quel groupe ?](../faq/index.md#quel-aliment-tester-pour-quel-groupe-fodmap)

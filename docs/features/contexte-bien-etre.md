# Bien-être & contexte

## Description

Trois facteurs qui modulent fortement les symptômes digestifs, enregistrés par jour :
**stress**, **heures de sommeil** et **règles**.

## Objectif

Éviter d'attribuer à un aliment ce qui vient d'une nuit courte ou d'une semaine
difficile. Digestor calcule séparément le lien entre ces facteurs et les jours à
symptômes.

## Prérequis

Aucun.

## Comment l'utiliser

Journal → mode édition → section **Bien-être & contexte**.

| Champ | Type | Valeurs |
|---|---|---|
| **Stress** | Sélection | Aucun · Léger · Modéré · Élevé |
| **Sommeil (h)** | Nombre | Heures de la nuit précédente |
| **Règles** | Oui / non | Cochez les jours concernés |

## Options

Aucune.

## Paramètres associés

Aucun.

## Données utilisées

`DayEntry.stress`, `DayEntry.sleepH`, `DayEntry.menstrual`.

## Résultat

- Bloc **Facteurs contextuels** des [corrélations](correlations.md) (écran Semaine) :
  `facteur → X % de jours à symptômes vs Y % sinon`.
- Repris dans le [dossier médical](dossier-medical.md).
- Transmis à l'[analyse IA de journée](analyse-journee-ia.md) quand vous la lancez.

## Fonctionnement hors connexion

Intégral.

## Fonctionnement en ligne

Identique.

## Limites

Les facteurs contextuels ne sont analysés que par **association le même jour** :
un effet retardé (mauvaise nuit → symptômes le surlendemain) n'est pas détecté.

## Erreurs possibles

Aucune.

## Dépannage

[Les corrélations ne s'affichent pas](../troubleshooting/pas-de-correlations.md)

## FAQ

- [Pourquoi noter le stress dans un journal alimentaire ?](../faq/index.md#pourquoi-noter-le-stress-dans-un-journal-alimentaire)

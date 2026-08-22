# Apparence (thème sombre / clair)

## Description

Deux thèmes : **sombre** (par défaut) et **clair**.

## Objectif

Confort de lecture, notamment le soir et pour l'impression.

## Prérequis

Aucun.

## Comment l'utiliser

**Menu `⋯` → Apparence** → **Sombre** ou **Clair**. L'effet est immédiat.

## Options

Le thème modifie les surfaces et le texte. La **palette sémantique**
(rouge / ambre / vert / gris) est **identique** sur les deux thèmes, pour que le code
couleur reste lisible partout.

La couleur de la barre du navigateur mobile suit le thème (`#0e0e0f` en sombre,
`#f6f6f7` en clair).

## Paramètres associés

Le pliage de la **légende des couleurs** de l'en-tête est également une préférence
d'appareil, mémorisée séparément.

## Données utilisées

`localStorage`, clé `digestor-theme`. Volontairement **hors de la base de données et de
la sauvegarde JSON** : c'est une préférence d'affichage propre à l'appareil, pas une
donnée patient.

## Résultat

Le thème est réappliqué au démarrage, sans effet de bascule visible.

## Fonctionnement hors connexion

Intégral.

## Fonctionnement en ligne

Identique.

## Limites

- Pas de mode « automatique » suivant le réglage du système.
- Le choix ne suit pas d'un appareil à l'autre (il n'est pas exporté).
- En navigation privée stricte, `localStorage` peut être indisponible : le thème
  s'applique pour la session mais n'est pas mémorisé.

## Erreurs possibles

Aucune.

## Dépannage

Aucune procédure spécifique.

## FAQ

- [Pourquoi mon thème n'est-il pas restauré après un import ?](../faq/index.md#pourquoi-mon-thème-nest-il-pas-restauré-après-un-import)

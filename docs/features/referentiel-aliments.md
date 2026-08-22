# Référentiel d'aliments (export / import)

## Description

Export de tout le catalogue d'aliments dans un fichier JSON, et réimport d'un
référentiel complété (typiquement enrichi en profils d'amines).

## Objectif

Deux usages :

1. **Fiabiliser la saisie vocale** : déposer le référentiel dans la zone Fichiers d'un
   Projet Claude Web pour que la dictée reconnaisse vos aliments.
2. **Compléter en masse** hors de l'application, puis réinjecter le résultat.

## Comment l'utiliser

**Exporter** — écran **Aliments** → **Exporter le référentiel d'aliments (N)**.
Le fichier contient le dictionnaire embarqué, les aliments de vos repas et vos analyses,
avec leur profil d'amines.

**Importer** — écran **Aliments** → **Importer un référentiel** → collez le JSON →
prévisualisez → importez. La fusion **n'écrase pas** les analyses déjà en place ; elle
complète ce qui manque.

Un prompt prêt à l'emploi pour compléter les amines est fourni :
[`docs/claude-web-amines-prompt.md`](../claude-web-amines-prompt.md).

## Options

Le format attendu est `{ "type": "food-reference", "foods": [ … ] }`.
Voir [Formats de données](../reference/data-formats.md#référentiel-daliments).

## Paramètres associés

Aucun.

## Données utilisées

Les fiches d'aliments (`foodInsights`) et le dictionnaire embarqué. **Aucune donnée de
journal, de symptôme ou de profil** n'est présente dans ce fichier.

## Résultat

Un fichier JSON téléchargé, ou des fiches d'aliments complétées.

## Fonctionnement hors connexion

Intégral : export et import sont locaux (copier-coller / téléchargement).

## Fonctionnement en ligne

Identique. La rédaction du référentiel enrichi se fait ailleurs (Claude Web), hors de
l'application.

## Limites

- Les fichiers de référentiel exportés sont volumineux (plusieurs centaines de Ko).
- L'import est **additif** : il ne supprime pas d'aliments.
- Les référentiels exportés sont exclus du dépôt Git (`.gitignore`) car ils contiennent
  vos aliments réels.

## Erreurs possibles

`JSON invalide.` — voir [Un import ne passe pas](../troubleshooting/import-json-refuse.md).

## Dépannage

[Un import ne passe pas](../troubleshooting/import-json-refuse.md)

## FAQ

- [Quelle différence avec la sauvegarde JSON ?](../faq/index.md#quelle-différence-entre-le-référentiel-daliments-et-la-sauvegarde)

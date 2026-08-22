# Import vocal de la satiété

## Description

Même principe que l'[import vocal des repas](import-vocal-repas.md), pour les relevés de
satiété : vous dictez votre ressenti, un Projet Claude Web dédié produit le JSON, vous
le collez.

## Objectif

Renseigner les relevés à +1 h, +2 h, +3 h sans ouvrir l'app à chaque fois.

## Prérequis

Un accès à claude.ai. Les repas concernés doivent **déjà exister** dans le journal.

## Comment l'utiliser

1. **Menu `⋯` → Entrer votre satiété (voix → JSON)**.
2. Copiez le prompt dédié, créez un Projet Claude Web, dictez votre ressenti.
3. Collez le JSON dans Digestor, prévisualisez, importez.

Prompt versionné : [`docs/claude-web-satiete-prompt.md`](../claude-web-satiete-prompt.md).

## Options

Le rattachement au bon repas se fait par **date + heure du repas** (`mealTime`).

## Paramètres associés

Aucun.

## Données utilisées

Format `{ "app": "digestor", "type": "satiety", "sets": [ … ] }`.
Voir [Formats de données](../reference/data-formats.md#import-de-satiété).
Les relevés sont écrits dans `Meal.satiety` du repas correspondant.

## Résultat

Les relevés apparaissent sous le repas, et les durées de satiété sont recalculées —
voir [Satiété](satiete.md).

## Fonctionnement hors connexion

L'import fonctionne hors ligne.

## Fonctionnement en ligne

Aucun appel réseau émis par Digestor.

## Limites

- Si aucun repas ne correspond à la date + heure indiquées, le relevé ne peut pas être
  rattaché.
- Le format doit correspondre au prompt fourni.

## Erreurs possibles

`JSON invalide.` — voir [Un import ne passe pas](../troubleshooting/import-json-refuse.md).

## Dépannage

[Un import ne passe pas](../troubleshooting/import-json-refuse.md)

## FAQ

- [Pourquoi mon relevé de satiété n'apparaît nulle part ?](../faq/index.md#pourquoi-mon-relevé-de-satiété-napparaît-nulle-part)

# Favoris

## Description

Une étoile ★ sur les aliments que vous consommez souvent, pour les retrouver en tête
des suggestions.

## Objectif

Accélérer la saisie et limiter les doublons d'orthographe (« Tomate » / « tomates »).

## Prérequis

Aucun.

## Comment l'utiliser

- **Ajouter / retirer** : touchez l'étoile d'une ligne dans l'écran **Aliments**.
- **Consulter** : écran Aliments → portée **Favoris ★**.
- **Automatique** : un produit [scanné](scan-code-barres.md) devient favori, avec sa
  date de scan (affichée « Scanné le … »).

## Options

Aucune.

## Paramètres associés

Aucun.

## Données utilisées

Table `favorites` : `key` (nom normalisé), `name`, `addedAt`, `scannedAt?`.

## Résultat

Dans le champ **« ajouter un aliment… »** du Journal, l'ordre des suggestions est :
**favoris ★**, puis aliments **récents** (aujourd'hui / hier / avant-hier), puis le
reste du catalogue.

## Fonctionnement hors connexion

Intégral (sauf le scan, qui interroge Open Food Facts).

## Fonctionnement en ligne

Identique.

## Limites

Le favori est indexé sur le **nom normalisé** : deux orthographes très différentes du
même aliment restent deux favoris distincts. Utilisez **Trouver les doublons** dans
l'écran Aliments.

## Erreurs possibles

Aucune.

## Dépannage

Aucune procédure spécifique.

## FAQ

- [Comment supprimer un aliment en double ?](../faq/index.md#comment-supprimer-un-aliment-en-double)

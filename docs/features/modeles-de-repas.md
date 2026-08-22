# Modèles de repas

## Description

Des repas récurrents enregistrés une fois, réutilisables en un geste.

## Objectif

Réduire la saisie quotidienne pour les repas qui ne changent pas (petit-déjeuner
habituel, collation type).

## Prérequis

Aucun.

## Comment l'utiliser

**Créer un modèle** — deux voies :

- Depuis un repas existant : en mode édition, icône **signet** du repas.
- Depuis zéro : **Menu `⋯` → Modèles de repas** → nom du modèle, heure suggérée
  (facultative), aliments.

**Utiliser un modèle** : Journal → mode édition → **Depuis un modèle** sous la section
Repas → choisissez le modèle. Le repas est inséré avec des identifiants neufs : le
modifier ensuite ne touche pas au modèle.

## Options

- Modifier ou supprimer un modèle depuis **Menu `⋯` → Modèles de repas**.
- Dans l'éditeur de modèle, un toucher sur une chip change sa catégorie de couleur.

## Paramètres associés

Aucun.

## Données utilisées

Table `mealTemplates` : `id`, `name`, `time?`, `foods[]` (nom, catégorie, quantité),
`updatedAt`. Incluse dans la [sauvegarde JSON](sauvegarde-restauration.md).

## Résultat

Un repas complet ajouté au jour courant, y compris les quantités mémorisées.

## Fonctionnement hors connexion

Intégral.

## Fonctionnement en ligne

Identique.

## Limites

- Un modèle ne mémorise **ni symptômes ni satiété** : seulement l'heure et les aliments.
- Modifier un modèle ne met pas à jour les repas déjà insérés.

## Erreurs possibles

Aucune.

## Dépannage

Aucune procédure spécifique.

## FAQ

- [Modifier un modèle change-t-il mes repas passés ?](../faq/index.md#modifier-un-modèle-change-t-il-mes-repas-passés)

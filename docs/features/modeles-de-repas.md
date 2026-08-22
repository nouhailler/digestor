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

**Créer un modèle** depuis un repas existant : en mode édition, le bouton
**« Enregistrer comme modèle »** sous le repas.

**Utiliser un modèle** — deux façons :

| Voie | Effet |
|---|---|
| **Depuis un modèle**, sous la section Repas | Ajoute un **nouveau repas** à la journée, à l'heure suggérée du modèle |
| **Depuis un modèle**, dans un repas déjà ouvert | **Remplit le repas courant** avec les aliments du modèle, **quelle que soit son heure**. L'heure du repas est conservée, et les aliments déjà présents ne sont pas dupliqués |

Dans les deux cas, les aliments sont copiés avec des identifiants neufs : les modifier
ensuite ne touche pas au modèle.

## Options

- Modifier ou supprimer un modèle depuis **Menu `⋯` → Modèles de repas**, ou directement
  via **« Modifier les modèles… »** au bas de la liste déroulante « Depuis un modèle ».
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

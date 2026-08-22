# Profil santé

## Description

Un questionnaire facultatif : qui vous êtes, ce que vous ne tolérez pas, ce que vous
prenez. Il personnalise les analyses IA et alimente le dossier médical.

## Objectif

Éviter qu'une analyse recommande un aliment auquel vous êtes allergique, et donner du
contexte au professionnel qui lira le dossier.

## Prérequis

Aucun.

## Comment l'utiliser

**Menu `⋯` → Profil santé**, puis **Enregistrer le profil**.

| Champ | Type | Valeur par défaut |
|---|---|---|
| **Nom du patient** | Texte | `exemple` |
| **Âge** | Nombre 0–120 | vide |
| **Sexe** | Femme / Homme / Autre | vide |
| **Conditions / diagnostics** | Multi-sélection + saisie libre | vide |
| **Phase FODMAP** | Aucune / Élimination / Réintroduction / Personnalisée | Aucune |
| **Intolérances** | Multi-sélection + saisie libre | vide |
| **Allergies** | Multi-sélection + saisie libre | vide |
| **Aliments à éviter** | Saisie libre | vide |
| **Antécédents médicaux** | Texte libre | vide |
| **Médicaments pris — lesquels** | Texte libre | vide |
| **Notes santé** | Texte libre | vide |

Suggestions proposées (la saisie libre reste toujours possible) :

- **Conditions** : SIBO (confirmé), SIBO (suspecté), SII, Candidose intestinale,
  RGO / reflux, Maladie cœliaque.
- **Intolérances** : Lactose, Gluten, Fructose, Polyols (sorbitol…), Histamine,
  FODMAP en général, Caféine.
- **Allergies** : Arachides, Fruits à coque, Œuf, Lait, Poisson, Crustacés, Soja, Blé,
  Sésame.

## Options

Déclarer **Histamine** dans les intolérances signale une sensibilité aux amines
biogènes, prise en compte dans les analyses.

## Paramètres associés

Le nom du patient s'affiche dans l'en-tête : « *semaine* — Patient : *nom* ». S'il est
vide, il revient à `exemple`.

## Données utilisées

Stocké dans la table `meta` sous la clé `profile`. Inclus dans la
[sauvegarde](sauvegarde-restauration.md).

**Transmis à OpenRouter uniquement quand vous lancez une analyse**, sous forme d'une
phrase de contexte : âge, sexe, conditions, phase FODMAP, intolérances, allergies
(signalées comme impératives), aliments à éviter, antécédents, médicaments, note.
Le **nom du patient n'est pas transmis**.

## Résultat

Les analyses affichent « Analyse personnalisée selon votre profil santé » quand le
contexte est exploité.

## Fonctionnement hors connexion

La saisie et la consultation fonctionnent hors ligne.

## Fonctionnement en ligne

Le contexte de profil accompagne les requêtes IA que vous déclenchez.

## Limites

- Tous les champs sont facultatifs ; un profil vide n'ajoute aucun contexte.
- Le profil n'est pas utilisé par les calculs locaux (statistiques, corrélations).

## Erreurs possibles

Aucune.

## Dépannage

Aucune procédure spécifique.

## FAQ

- [Mon nom est-il envoyé à l'IA ?](../faq/index.md#mon-nom-est-il-envoyé-à-lia)

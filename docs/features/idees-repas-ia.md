# Idées de repas adaptées

## Description

Des propositions de repas pauvres en FODMAP, générées par l'IA en tenant compte de
votre profil santé, ajoutables directement au Journal.

## Objectif

Sortir de l'impasse « je ne sais plus quoi manger » sans quitter l'application.

## Prérequis

Clé OpenRouter + modèle + réseau.

## Comment l'utiliser

1. Écran **Aliments** → bouton **« Idées de repas adaptées »**.
2. Parcourez les propositions : titre, liste d'aliments, et **pourquoi** c'est adapté.
3. Ajoutez une idée au jour courant du Journal, ou demandez d'autres propositions.

## Options

| Action | Effet |
|---|---|
| Remplacer **une** idée | Régénère uniquement cette proposition |
| Régénérer **tout** | Remplace l'ensemble par un nouveau jeu |
| Ajouter au Journal | Crée un repas dans la journée sélectionnée |

## Paramètres associés

[Profil santé](profil-sante.md) : allergies et intolérances sont respectées dans la
demande.

## Données utilisées

**Envoyé** : le contexte de profil. **Reçu et mis en cache** : le jeu de suggestions
(clé `mealSuggestions` de la table `meta`), avec le modèle et la date.

## Résultat

Un jeu de suggestions consultable hors ligne une fois généré.

## Fonctionnement hors connexion

Consultation du dernier jeu en cache : oui. Génération : non.

## Fonctionnement en ligne

Un appel OpenRouter par génération ou par remplacement d'une idée.

## Limites

- Les suggestions sont **génériques** : elles ne connaissent pas votre stock ni votre
  budget, et ne remplacent pas un diététicien.
- Un seul jeu est conservé en cache à la fois.

## Erreurs possibles

Voir [Codes et erreurs](../reference/errors.md#openrouter-ia).

## Dépannage

[L'IA ne répond pas](../troubleshooting/ia-ne-repond-pas.md)

## FAQ

- [Les idées de repas tiennent-elles compte de mes allergies ?](../faq/index.md#les-idées-de-repas-tiennent-elles-compte-de-mes-allergies)

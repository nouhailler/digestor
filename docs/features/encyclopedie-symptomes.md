# Encyclopédie des symptômes

## Description

Un socle de fiches sur les symptômes digestifs, classées par catégorie, consultable hors
ligne et approfondissable par l'IA.

## Objectif

Comprendre ce que l'on note. Une fiche explique d'où vient un symptôme, comment il se
manifeste, ce qu'il entraîne et ce qu'on peut faire.

## Prérequis

Aucun pour le socle statique. L'approfondissement et l'enrichissement nécessitent l'IA.

## Comment l'utiliser

- **Repères → Encyclopédie** : liste par catégorie, avec recherche et filtre.
- Depuis le **Journal** : toucher le libellé d'un symptôme ouvre sa fiche.
- Depuis le tableau de **Repères** : toucher un symptôme discriminant.

## Options

| Bloc de la fiche | Contenu |
|---|---|
| **Origine** | D'où vient le symptôme |
| **Manifestation** | Comment il se présente |
| **Effets** | Conséquences |
| **Que faire** | Pistes pour l'éviter ou l'atténuer |
| **Symptômes liés** | Renvois croisés cliquables |

Le bouton **« Enrichir avec l'IA »** demande des symptômes supplémentaires, ajoutés aux
catégories existantes. Un bouton **stop** interrompt le traitement.

## Paramètres associés

[Assistant IA](../settings/index.md#assistant-ia-openrouter).

## Données utilisées

Socle statique embarqué + tables `symptomNotes` (fiches détaillées générées) et clé
`encyclopediaExtra` de `meta` (symptômes ajoutés par l'IA). Les deux sont incluses dans
la sauvegarde.

## Résultat

Des fiches consultables hors ligne une fois générées.

## Fonctionnement hors connexion

Le socle statique et toutes les fiches déjà en cache sont disponibles.

## Fonctionnement en ligne

Génération d'une fiche détaillée ou enrichissement de la liste, sur action explicite.

## Limites

- Contenu **informatif, non médical** : aucune fiche ne remplace un avis clinique.
- Les fiches générées ne sont pas révisées automatiquement.

## Erreurs possibles

Voir [Codes et erreurs](../reference/errors.md#openrouter-ia).

## Dépannage

[L'IA ne répond pas](../troubleshooting/ia-ne-repond-pas.md)

## FAQ

- [Les fiches sont-elles fiables ?](../faq/index.md#les-fiches-de-lencyclopédie-sont-elles-fiables)

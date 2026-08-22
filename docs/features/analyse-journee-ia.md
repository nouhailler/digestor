# Analyse d'une journée (IA)

## Description

Un bilan d'une journée complète : verdict global, déclencheurs probables et pistes
d'amélioration **justifiées** (chaque recommandation dit ce qu'elle vise).

## Objectif

Relier repas, symptômes et contexte d'une même journée, ce qu'un tableau de chiffres ne
fait pas.

## Prérequis

- Une journée **non vide** (au moins un repas ou un symptôme).
- Clé OpenRouter + modèle + réseau.

## Comment l'utiliser

1. Journal → placez-vous sur la date voulue.
2. Bouton **« Analyser ma journée avec l'IA »** sous la carte du jour.
3. Lancez l'analyse. Le résultat est mis en cache : rouvrir la feuille ne relance rien.

## Options

| Bouton | Effet |
|---|---|
| **Partager** | Feuille de partage native (mail, messagerie, Fichiers…), repli presse-papiers (« Copié ») |
| **Télécharger** | Fichier texte `digestor-analyse-AAAA-MM-JJ.txt` |

## Paramètres associés

[Assistant IA](../settings/index.md#assistant-ia-openrouter) et
[Profil santé](profil-sante.md) (l'analyse indique « Analyse personnalisée selon votre
profil santé » quand il est renseigné).

## Données utilisées

**Envoyé à OpenRouter** : une description de la journée — repas, heures, aliments,
symptômes et intensités, transit, hydratation, facteurs contextuels — les fiches
d'aliments déjà analysées, et le contexte de profil. Le résultat est stocké dans la
table `dayAnalyses` (clé = date).

## Résultat

| Bloc | Contenu |
|---|---|
| **Verdict** | Favorable / attention / éviter / inconnu |
| **Résumé** | Synthèse de la journée |
| **Déclencheurs probables** | Aliments ou combinaisons suspects |
| **Pistes d'amélioration** | Action + justification |

Ces analyses alimentent aussi, une fois en cache, les blocs **Déclencheurs probables
récurrents** et **Pistes d'amélioration proposées** de l'écran
[Évolution](../guide/evolution.md).

## Fonctionnement hors connexion

Consultation d'une analyse déjà en cache : oui. Nouvelle analyse : non.

## Fonctionnement en ligne

Un appel OpenRouter par analyse, sur action explicite.

## Limites

- Une analyse est figée : elle ne se met pas à jour si vous modifiez la journée ensuite.
- Les analyses de journées **ne sont pas incluses** dans le partage natif au format
  fichier sur toutes les plateformes ; le repli presse-papiers couvre les autres.
- Contenu indicatif, non médical.

## Erreurs possibles

Voir [Codes et erreurs](../reference/errors.md#openrouter-ia).

## Dépannage

[L'IA ne répond pas](../troubleshooting/ia-ne-repond-pas.md)

## FAQ

- [Puis-je envoyer l'analyse à mon médecin ?](../faq/index.md#puis-je-envoyer-lanalyse-à-mon-médecin)

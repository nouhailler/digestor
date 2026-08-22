# Rapport de période

## Description

Un bilan de la plage affichée dans l'écran Évolution : des **tendances calculées
localement** et, si l'IA est configurée, une **synthèse** rédigée.

## Objectif

Répondre à « est-ce que ça s'améliore ? » — la question que ni un jour ni une semaine ne
tranchent.

## Prérequis

Assez de jours renseignés sur la plage. La partie synthèse nécessite l'IA ; la partie
tendances, non.

## Comment l'utiliser

1. Écran **Évolution** → choisissez la plage (**Semaine**, **4 semaines**, **Tout**).
2. Bouton **« Rapport de la période (*plage*) »**.

## Options

Le rapport est mis en cache par **portée + plage de dates** (ex. `4weeks:2026-05-01:2026-05-28`).
Changer de plage produit un rapport distinct.

## Paramètres associés

[Assistant IA](../settings/index.md#assistant-ia-openrouter),
[Profil santé](profil-sante.md).

## Données utilisées

Les jours de la plage. Les **tendances** sont calculées hors ligne en comparant la
première et la seconde moitié de la période. La **synthèse** envoie à OpenRouter une
description agrégée de la période. Résultat en cache dans `periodAnalyses`.

> Le cache des rapports de période **n'est pas exporté** dans la sauvegarde JSON, et il
> est vidé à l'import : il est régénérable.

## Résultat

| Bloc | Origine |
|---|---|
| **Tendances** calculées (métrique, direction, détail « 60 % → 30 % », favorable ou non) | Local |
| **Verdict**, **résumé**, **tendances narratives** | IA |
| **Déclencheurs récurrents**, **pistes d'amélioration** | IA |

## Fonctionnement hors connexion

Les tendances calculées s'affichent. La synthèse IA nécessite le réseau.

## Fonctionnement en ligne

Un appel OpenRouter par rapport, sur action explicite.

## Limites

- Message si la période est trop courte : *« Pas assez de jours renseignés sur cette
  période pour dégager des tendances. »*
- Un rapport ne se met pas à jour tout seul quand la période change de contenu.

## Erreurs possibles

Voir [Codes et erreurs](../reference/errors.md#openrouter-ia).

## Dépannage

[L'IA ne répond pas](../troubleshooting/ia-ne-repond-pas.md)

## FAQ

- [Quelle plage choisir ?](../faq/index.md#quelle-plage-choisir-pour-le-rapport-de-période)

# Récurrence des aliments

## Description

Un tableau factuel : combien de fois chaque aliment revient dans votre journal sur les
**30 derniers jours**, sur combien de jours différents, à quel rythme, et de quelle
date à quelle date.

## Objectif

Voir ce que vous mangez vraiment souvent. C'est un **décompte**, pas une conclusion :
aucune corrélation ni verdict n'y est attaché.

## Prérequis

Aucun.

## Comment l'utiliser

Écran **Évolution** → carte **« Récurrence des aliments (30 derniers jours) »**.
Les 12 premières lignes sont affichées ; **voir tout** déplie le reste.

## Options

| Colonne | Signification |
|---|---|
| **Mentions** | Nombre de fois où l'aliment apparaît dans un repas |
| **Jours** | Nombre de jours différents où il apparaît |
| **Rythme** | Écart moyen entre deux jours de consommation |
| **Plage** | Première → dernière mention, et le temps écoulé depuis |

## Paramètres associés

Aucun. La fenêtre de 30 jours est fixe et **indépendante du sélecteur de plage** de
l'écran.

## Données utilisées

Les repas des 30 jours de la fenêtre. La fenêtre se termine au **dernier jour
renseigné**, pas nécessairement aujourd'hui.

## Résultat

Un tableau trié, avec la pastille de catégorie de chaque aliment. Les variantes proches
(« Tomate » / « Tomates », accents, espaces) sont **regroupées** ; le nom affiché est
l'orthographe la plus fréquente.

## Fonctionnement hors connexion

Intégral.

## Fonctionnement en ligne

Identique.

## Limites

- Fenêtre fixe de 30 jours : pas de réglage.
- Le regroupement des variantes est orthographique, pas sémantique (« pomme » et
  « compote de pommes » restent distincts).

## Erreurs possibles

Aucune.

## Dépannage

[Un graphe ne s'affiche pas](../troubleshooting/graphe-absent.md)

## FAQ

- [Pourquoi la récurrence ne suit-elle pas la plage choisie ?](../faq/index.md#pourquoi-la-récurrence-ne-suit-elle-pas-la-plage-choisie)

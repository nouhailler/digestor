# Transit & hydratation

## Description

Section de la fiche du jour regroupant l'aspect des selles (échelle de Bristol), leur
nombre, la quantité d'eau bue et le délai de digestion ressenti.

## Objectif

Suivre le transit, qui est l'un des signaux les plus discriminants entre les profils
digestifs, et le corréler à l'alimentation.

## Prérequis

Aucun.

## Comment l'utiliser

1. Journal → mode édition → section **Transit & hydratation**.
2. **Échelle de Bristol** : choisissez le type 1 à 7.

| Type | Aspect | Interprétation |
|---|---|---|
| 1 | Billes dures séparées | Constipation sévère |
| 2 | En saucisse, grumeleuse | Légère constipation |
| 3 | Saucisse craquelée | Normal |
| 4 | Saucisse lisse et molle | Idéal |
| 5 | Morceaux mous, bords nets | Tendance molle |
| 6 | Morceaux floconneux déchiquetés | Légère diarrhée |
| 7 | Entièrement liquide | Diarrhée |

3. **Nombre de selles** dans la journée.
4. **Eau (L)** : litres bus sur la journée (arrondi au dixième).
5. **Délai digestion (h)** : temps ressenti entre le repas et la digestion / l'évacuation.

## Options

Un libellé libre peut accompagner les selles (« Selles molles », « Selles normales »…),
notamment via l'[import vocal](import-vocal-repas.md).

## Paramètres associés

Aucun.

## Données utilisées

`DayEntry.stool` (`bristol`, `count`, `label`), `DayEntry.hydrationL`,
`DayEntry.digestionDelayH`.

## Résultat

- Graphe **Évolution des selles (échelle de Bristol)** dans l'écran Évolution, avec des
  points colorés selon la zone (constipation / normal / diarrhée).
- Section **Transit & hydratation** du [dossier médical](dossier-medical.md), qui
  affiche l'hydratation moyenne en L/j.

## Fonctionnement hors connexion

Intégral.

## Fonctionnement en ligne

Identique.

## Limites

- L'hydratation n'a **pas** de graphe dédié dans l'écran Évolution : elle reste visible
  dans la fiche du jour et dans le dossier médical, qui en donne la moyenne en L/j.
- Un seul relevé de Bristol par jour : un transit qui varie dans la journée n'est pas
  détaillé.

## Erreurs possibles

Aucune.

## Dépannage

[Un graphe ne s'affiche pas](../troubleshooting/graphe-absent.md)

## FAQ

- [Où est passée la courbe d'hydratation ?](../faq/index.md#où-est-passée-la-courbe-dhydratation)

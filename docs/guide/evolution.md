# Écran — Évolution

## Objectif

Suivre les tendances dans le temps : sévérité, symptômes après les repas, aliments
suspects, amines, selles, catégories d'aliments, récurrence des aliments, satiété, et
la synthèse des analyses IA de journées.

## Accès

Onglet **Évolution** (4ᵉ onglet). L'écran et sa librairie de graphes sont **chargés à
la demande** (« Chargement des graphes… » au premier accès).

## Éléments de l'interface

### Sélecteur de plage

**Semaine** · **4 semaines** (par défaut) · **Tout**. Tous les graphes de l'écran se
recalculent — **sauf** le tableau de récurrence, qui couvre toujours 30 jours.

### Rapport de la période

Bouton **« Rapport de la période (*plage*) »** → tendances calculées localement
(1ʳᵉ vs 2ᵈᵉ moitié) et, si l'IA est configurée, une synthèse. Voir
[Rapport de période](../features/rapport-periode-ia.md).

### Graphes et tableaux

Les blocs n'apparaissent que lorsque les données correspondantes existent.

| Bloc | Contenu |
|---|---|
| **Sévérité globale par jour** | Score de sévérité cumulé des symptômes |
| **Symptômes après les repas (jour × heure)** | Nuage de points : quand les symptômes surviennent |
| **Aliment suspect par symptôme (après repas)** | Tableau : taux de repas suivis du symptôme avec / sans l'aliment, avec cohérence amine ↔ symptôme |
| **Tendance amines biogènes** | Courbe de charge journalière, seuils *modéré ≥ 2* et *élevé ≥ 5* |
| **Évolution des selles (échelle de Bristol)** | Points colorés par zone (constipation / normal / diarrhée) |
| **Catégories d'aliments par jour** | Répartition 🔴 / 🟢 / ⚪ |
| **Récurrence des aliments (30 derniers jours)** | Mentions, jours distincts, rythme, 1ʳᵉ → dernière date |
| **Top symptômes sur la période** | Classement des symptômes les plus présents |
| **Déclencheurs probables récurrents** | Agrégation des analyses IA de journées en cache |
| **Pistes d'amélioration proposées** | Idem, côté recommandations |
| **Satiété après les repas** | Courbe moyenne + comparatifs par catégorie dominante et par niveau FODMAP |

## Actions et résultats

| Action | Résultat |
|---|---|
| Changer de plage | Recalcule tous les graphes (sauf la récurrence, fixée à 30 jours) |
| **Rapport de la période** | Ouvre le bilan de la plage affichée |
| Toucher **voir tout** sous la récurrence | Déplie le tableau au-delà des 12 premières lignes |
| Survol / appui sur un point | Infobulle avec les valeurs du jour |

## Cas particuliers

- Sans données sur la plage : « Pas encore assez de données sur cette période. »
- **Récurrence des aliments** : la fenêtre de 30 jours se termine au dernier jour
  renseigné (pas forcément aujourd'hui) ; les variantes proches (« Tomate » /
  « Tomates ») sont regroupées.
- Les blocs **Déclencheurs / Pistes** n'apparaissent que si des analyses IA de journées
  ont déjà été générées et mises en cache.
- La **satiété** n'apparaît qu'au-delà d'un nombre minimal de repas suivis.

## Où aller ensuite

→ [Récurrence des aliments](../features/recurrence-aliments.md) ·
[Amines biogènes](../features/amines-biogenes.md) ·
[Satiété](../features/satiete.md)

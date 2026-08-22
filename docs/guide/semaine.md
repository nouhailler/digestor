# Écran — Semaine

## Objectif

Voir la semaine en cours d'un coup d'œil (agenda coloré + 6 indicateurs) et consulter
les **corrélations personnalisées** calculées sur l'ensemble du journal.

## Accès

Onglet **Semaine** (3ᵉ onglet). La semaine affichée est celle du jour sélectionné dans
le Journal ; elle va du **lundi au dimanche**.

## Éléments de l'interface

### Agenda de la semaine

Sept cases (lun → dim). Chaque case affiche l'abréviation du jour, le numéro, une
pastille de couleur (qualité du jour, transparente si le jour est vide) et le nombre
de repas. **Toucher une case ouvre ce jour dans le Journal.**

### Récapitulatif de la semaine

Six cartes. **Toucher une carte ouvre son explication** (comment elle est calculée).

| Carte | Ce qu'elle compte | Couleur |
|---|---|---|
| **Jours difficiles** | Jours dont vous avez **forcé** le badge sur « difficile », sur le total de jours. Les journées classées difficiles automatiquement ne sont pas comptées ici — voir [Incohérences connues](../reference/limitations.md#incohérences-connues) | 0 = vert · 1-2 = ambre · ≥ 3 = rouge |
| **Épisodes de ballonnements sévères** | Jours avec ballonnements *sévères* | idem |
| **Épisodes de diarrhée** | Jours avec diarrhée *modérée ou sévère* | idem |
| **Jours sans sucre ajouté** | Parmi les jours **avec repas**, ceux sans sucre ajouté ni alcool | tous = vert · aucun = rouge |
| **Amines (note /10)** | Charge en amines biogènes sur les jours avec repas ; 10 = peu chargé | ≥ 7 vert · ≥ 4 ambre · sinon rouge |
| **Score énergie moy.** | Inverse de la fatigue après repas et du brouillard mental | idem |

### Corrélations personnalisées

Bloc calculé sur **tout le journal**, pas seulement la semaine affichée. Il indique le
nombre de jours renseignés analysés, puis :

- **Déclencheurs suspectés** — `aliment → symptôme : X % des jours avec vs Y % sans`
- **Aliments fréquents bien tolérés** — chips vertes
- **Facteurs contextuels** — stress, sommeil, règles
- **Amines biogènes (histamine)** — affiché indépendamment des corrélations alimentaires

Si l'échantillon est insuffisant : *« Pas encore assez de données pour les corrélations
alimentaires — continuez à remplir le journal. »* **Aucun motif n'est inventé.**

## Actions et résultats

| Action | Résultat |
|---|---|
| Flèches ← → | Semaine précédente / suivante ; tout se recalcule |
| Toucher un jour | Ouvre ce jour dans le Journal |
| Toucher une carte | Ouvre l'explication du calcul |

## Cas particuliers

- Les jours **non renseignés** ne pénalisent pas les indicateurs : « Jours sans sucre
  ajouté » est rapporté aux jours *avec repas*.
- Les notes /10 (amines, énergie) affichent `—` si aucun jour exploitable.

## Où aller ensuite

→ [Corrélations](../features/correlations.md) · [Évolution](evolution.md) ·
[Amines biogènes](../features/amines-biogenes.md)

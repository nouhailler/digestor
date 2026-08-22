# Versions

Version actuelle de l'application : **0.15.2**. Version de la documentation : **1.0.0**.

Digestor est en développement pré‑1.0 : les versions se suivent rapidement et le format
de données peut évoluer (les migrations sont automatiques et non destructives).
Historique technique complet : [`CHANGELOG.md`](../../CHANGELOG.md).

---

# En cours de développement

Présent dans le code mais non encore publié sous un numéro de version :

- **Récurrence des aliments** — tableau de l'écran Évolution sur une fenêtre glissante de
  30 jours (mentions, jours distincts, rythme, première → dernière date), avec regroupement
  des variantes proches. Voir [Récurrence des aliments](../features/recurrence-aliments.md).

---

# Version 0.15.2

Date : 23 juillet 2026

## Nouveautés

Aucune fonctionnalité nouvelle.

## Améliorations

- **Visites guidées remises à niveau sur les cinq écrans**, avec de nouvelles bulles
  ancrées : bilan IA de la journée (Journal), portées / scan / actions et référentiel
  (Aliments), récapitulatif chiffré et corrélations (Semaine), rapport de période
  (Évolution), sous-onglets (Repères).
- Les visites couvrent désormais les fonctions arrivées depuis leur création : amines,
  satiété, échelle de Bristol, saisie vocale, partage de fiche en image, référentiel
  d'aliments, dossier médical avec graphes.

## Corrections

Aucune.

## Changements

Aucun changement de comportement.

## Changements incompatibles

Aucun.

## Modifications de paramètres

Aucune.

## Modifications de données

Aucune.

## Modifications de confidentialité

Aucune.

## Documentation mise à jour

[Aide, tutoriel & visites guidées](../features/aide-visites-guidees.md)

---

# Version 0.15.1

Date : 23 juillet 2026

## Nouveautés

- **Graphes d'évolution dans le dossier médical** : nouvelle section
  « Évolution sur la période », avec la sévérité des symptômes par jour (barres empilées
  léger / modéré / sévère) et le transit (échelle de Bristol, zones constipation /
  diarrhée), imprimables.

## Améliorations

- **Axe temporel continu** : les trous de saisie restent visibles comme des trous, sans
  étirer artificiellement l'axe.
- Règles d'impression ajoutées pour que les graphes sortent correctement en PDF.

## Corrections

Aucune.

## Changements

Le dossier médical n'est chargé qu'à son ouverture (temps de démarrage préservé).

## Changements incompatibles / paramètres / données / confidentialité

Aucun.

## Documentation mise à jour

[Dossier médical imprimable](../features/dossier-medical.md)

---

# Version 0.15.0

Date : 23 juillet 2026

## Nouveautés

- **Amines biogènes de bout en bout** : profil détaillé par amine (histamine, tyramine,
  putrescine) et par mécanisme (histamino-libérateur, freineur de DAO, inhibiteur de MAO,
  fermenté, dépendant de la fraîcheur) ; charge journalière globale **et** par amine ;
  pastille d'amines sur chaque aliment ; bandeau « Amines » cliquable dans le Journal ;
  carte « Amines (note /10) » dans la Semaine ; corrélations amine ↔ symptôme à seuils
  conservateurs ; dimension amines dans le dossier médical et les analyses IA.
- **Repères enrichis** : référence de **toutes** les amines biogènes, tableau des plus
  problématiques, fiches détaillées, catégorie « Amines biogènes » dans l'encyclopédie.
- **Référentiel d'aliments** : export du catalogue et import fusionnant, avec un prompt
  Claude Web dédié pour compléter les amines en masse.
- **Partage de la fiche d'un aliment** : en **texte** (partage natif ou presse-papiers) et
  en **carte image PNG**.
- **Enrichissement des amines par l'IA** : bouton dédié avec progression et arrêt, et
  décompte honnête des aliments restant à enrichir.

## Améliorations

- Écran Semaine retravaillé (bloc amines découplé des corrélations).
- Légumineuses ajoutées au dictionnaire d'aliments.

## Corrections

Aucune.

## Changements

- **Retrait des corrélations heuristiques codées en dur** (dont « sans céréales ») dans
  l'écran Semaine et le dossier médical. Seules subsistent les corrélations **calculées
  sur vos données réelles**.

## Changements incompatibles

Aucun.

## Modifications de paramètres

Aucune.

## Modifications de données

Le champ `amines` des fiches d'aliments s'enrichit (détail par amine et mécanismes).
Aucune migration de base n'est nécessaire.

## Modifications de confidentialité

Aucune : le calcul des amines est entièrement local.

## Documentation mise à jour

[Amines biogènes](../features/amines-biogenes.md) ·
[Référentiel d'aliments](../features/referentiel-aliments.md) ·
[Corrélations](../features/correlations.md)

---

# Version 0.14.0

Date : 30 juin 2026

## Nouveautés

- **Suivi de la satiété** : relevés VAS 0–100 (faim, énergie, envie de sucre) aux
  checkpoints immédiat / +1 h / +2 h / +3 h, plus un type de satiété.
- **Saisie vocale de la satiété** (voix → JSON) avec rattachement au repas par date et
  heure.
- **Durée de satiété** mesurée et attendue, reportée dans les notes du jour.
- **Tags de composition** par repas (protéiné / fibres / sucré).
- **Corrélation de satiété** dans l'écran Évolution.

## Améliorations

- Légende des couleurs de l'en-tête rendue **repliable**, avec mémorisation du choix.

## Modifications de données

Champs `Meal.satiety` et `Meal.tags` ajoutés dans le repas — aucune migration de base.

## Documentation mise à jour

[Satiété](../features/satiete.md) ·
[Import vocal de la satiété](../features/import-vocal-satiete.md)

---

# Versions antérieures

Résumé des apports principaux. Détail : [`CHANGELOG.md`](../../CHANGELOG.md).

| Version | Apport principal |
|---|---|
| **0.13.0** | Partage et téléchargement de l'analyse de journée |
| **0.12.0** | Visites guidées par écran, quantité « nombre seul », démarrage robuste |
| **0.11.0** | Facteurs contextuels, modèles de repas, rapport de période, recherche |
| **0.10.0** | Traitements, réintroductions FODMAP, corrélations personnalisées |
| **0.9.19** | Dossier médical imprimable |
| **0.9.18** | Aliments favoris |
| **0.9.17** | Scan de produit par code-barres |
| **0.9.16** | Quantités d'aliments |
| **0.9.15** | Mode clair en option |
| **0.9.13** | Autocomplétion d'aliments, pistes d'amélioration justifiées |
| **0.9.4** | Encyclopédie des symptômes |
| **0.9.0** | Symptômes par repas |
| **0.8.0** | Import vocal enrichi (Claude Web → JSON) |
| **0.7.0** | Profil santé et analyse IA de journée |
| **0.6.0** | Assistant IA (OpenRouter) |
| **0.1.0** | Première version |

## Migrations de la base de données

Le schéma local est en version **8**. Les migrations sont appliquées automatiquement à
l'ouverture, sans perte de données.

| Version du schéma | Ajout |
|---|---|
| 1 | Journées et réglages |
| 2 | Fiches d'aliments analysées |
| 3 | Analyses IA de journées |
| 4 | Fiches de symptômes |
| 5 | Approfondissements d'organes |
| 6 | Aliments favoris |
| 7 | Traitements et réintroductions FODMAP |
| 8 | Modèles de repas et rapports de période |

Le format de **sauvegarde JSON** suit la même numérotation : un fichier plus ancien reste
importable, les sections absentes sont simplement ignorées.

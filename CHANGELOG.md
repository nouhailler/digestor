# Changelog

Toutes les évolutions notables de Digestor. Format inspiré de
[Keep a Changelog](https://keepachangelog.com/fr/), versions en
[SemVer](https://semver.org/lang/fr/) (pré-1.0 : l'app évolue rapidement).

## [0.9.14] — Couleur d'aliment IA dans les repas & remontée pendant la génération

- **Couleur d'aliment reflétée dans le repas** : dès qu'un aliment a été analysé par l'IA, sa chip
  dans le Journal prend dynamiquement la couleur de sa **sévérité FODMAP** (Élevé → rouge, Modéré →
  ambre, Bas → vert ; inconnu → catégorie dérivée). Mise à jour **live** (`useLiveQuery`) : générer
  l'analyse repeint le repas sans recharger. En **édition**, la chip garde la catégorie manuelle pour
  que le cycle de couleur au tap reste visible.
- **Analyse de journée enrichie** : « Analyser ma journée avec l'IA » injecte désormais, pour chaque
  aliment analysé, ses repères (niveau FODMAP, verdicts SIBO/candida) dans le prompt — le bilan tient
  compte des fiches générées plutôt que de la seule catégorie saisie.
- **Aliments en cours de génération remontés** : dans l'onglet Aliments, un aliment dont l'analyse IA
  tourne remonte **en haut de la liste** (badge « Génération… » + sablier vert) le temps de la
  génération, toutes provenances confondues (analyse en masse, fiche, recherche d'un nouvel aliment)
  — confirmation visuelle qu'il a bien été lancé / créé. Source : libellés du store d'activité IA.

## [0.9.13] — Autocomplétion d'aliments & pistes d'amélioration justifiées

- **Autocomplétion des aliments (anti-doublon)** : dans le Journal, en saisissant un aliment, dès
  **3 caractères** une liste propose les aliments **déjà saisis** ailleurs dans le journal
  (dédup. par forme normalisée, hors aliments déjà dans le repas). Un clic les ajoute — on réutilise
  la même orthographe/casse au lieu de créer des variantes (« Tomate » / « tomates »). Source live
  via le hook `useKnownFoods`.
- **Pistes d'amélioration expliquées (IA)** : l'analyse de journée justifie désormais chaque piste.
  `DayAnalysis.improvements` passe de `string[]` à `{ action, why }[]` ; le prompt et la coercition
  imposent un **« Pourquoi »** (bénéfice attendu / mécanisme), affiché sous chaque recommandation.
  Coercition tolérante (chaîne simple ou ancien cache → `why` vide) ; les analyses déjà en cache
  s'affichent sans planter, « Réanalyser » régénère la version justifiée.

## [Non publié]

### Encyclopédie (Repères)
- **Sous-onglets** « Repères » / « Encyclopédie » dans l'écran Repères (fiches regroupées au même endroit).
- **Échelle de Bristol illustrée** (glyphes SVG par type + couleurs).
- **Recherche** + **filtre par catégorie** dans l'encyclopédie.
- **Socle statique enrichi** (~35 symptômes classés par catégorie).
- **Symptômes du Journal cliquables** → ouvrent leur fiche détaillée (origine / manifestation / effets / conseils).
- **Pré-génération en masse** des fiches manquantes (« Tout détailler », séquentiel + progression + arrêt).
- **Liens croisés** : chaque fiche propose des « symptômes liés » cliquables (champ `related` de l'IA).

### Persistance & sauvegarde
- **Stockage persistant** demandé au démarrage (`navigator.storage.persist()`) pour limiter
  l'effacement automatique des données locales (notamment l'éviction iOS/Safari).
- **Export JSON complet** (v4) : journal, profil, fiches d'aliments, analyses, **fiches de symptômes**,
  **idées de repas**, **encyclopédie enrichie** et **réglages** (modèle IA choisi + onboarding).
  La clé API reste volontairement exclue (secret). L'import restaure l'ensemble.
- **Bouton « Sauvegarder mes données » mis en avant** (vert) en tête du menu.
- **Rappel de sauvegarde** : bannière discrète si des données existent et qu'aucun export n'a eu lieu
  depuis 7 jours (bouton « Sauvegarder » intégré, masquable). Date du dernier export mémorisée.

### Dépôt
- Premier commit public sur https://github.com/nouhailler/digestor.
- Icône d'application (feuille verte sur fond sombre, accents de la palette) + `apple-touch-icon`.
- `CHANGELOG.md`, `LICENSE` (MIT), CI GitHub Actions (build + tests), README enrichi (badges, captures).

## [0.9.4] — Encyclopédie des symptômes (Repères)

- Chaque symptôme du tableau Repères est **cliquable** → fiche détaillée (origine, manifestation,
  effets, conseils) générée par l'IA et mise en cache (Dexie v4, table `symptomNotes`).
- Bouton **« Plus d'informations »** : encyclopédie des symptômes digestifs classés par catégorie
  (socle statique `lib/encyclopedia.ts`).
- Bouton **« Enrichir avec l'IA »** : ajoute des symptômes supplémentaires par catégorie (cache meta).

## [0.9.3] — Idées de repas actionnables & infobulles

- Idées de repas : bouton en pastille verte ; par idée **« Ajouter au journal »** (action locale,
  sans clé) et **« Autre idée »** ; boutons **« Générer plus d'idées (IA) »** et **« Tout régénérer »**.
- Infobulles `title` sur les symptômes du tableau Repères.

## [0.9.2] — Agenda hebdomadaire

- Page Semaine : **agenda cliquable** des 7 jours (couleur = qualité), clic → ouvre le jour.

## [0.9.1] — Catalogue d'aliments

- Écran Aliments : sélecteur « De mes repas » / **« Catalogue »** (~267 aliments du dictionnaire),
  ouvert sur le catalogue par défaut. Recherche sur tout le catalogue.

## [0.9.0] — Symptômes par repas & saisie enrichie

- **Symptômes par repas** (`Meal.symptoms`) + symptômes effectifs (max jour + repas) pour tous les
  agrégats. Badge qualité **3 niveaux** (vert/orange/rouge) selon le cumul.
- Combobox **échelle de Bristol** pour les selles ; infobulles d'aide sur les champs.
- Écran Aliments : liste de tous les aliments des repas, **analyse en masse**, recherche combobox.
- Profil santé : champs facultatifs **âge, sexe, antécédents médicaux, médicaments**.

## [0.8.0] — Import vocal enrichi (Claude Web → JSON)

- Menu **« Entrer un repas (voix → JSON) »** : collez un JSON dicté à Claude Web →
  prévisualisation → ajout/remplacement. Le JSON peut porter, **par aliment**, sa fiche
  FODMAP/SIBO/candidose (cache sans appel API) et, **par jour**, symptômes / transit / hydratation.
- Prompt copiable + guide `docs/claude-web-repas-prompt.md`.
- Correctif : une fiche d'aliment en cache reste consultable sans clé.

## [0.7.0] — Profil santé & IA de journée

- **Profil santé** (conditions, phase FODMAP, intolérances, allergies…) injecté dans les prompts IA.
- **Analyse IA d'une journée** (verdict, déclencheurs, pistes) + **suggestions de repas**.
- **Aide contextuelle** (`?`), **tips** par écran, **onboarding** au premier lancement.

## [0.6.0] — Assistant IA (OpenRouter)

- Paramètres IA : clé OpenRouter locale, recherche des **modèles gratuits (:free)**, sélection.
- **Analyse d'aliments** à la demande (FODMAP par groupe, verdicts SIBO/candidose) + cache (Dexie v2).
- Nouvel onglet **Aliments** + analyse au tap sur une chip.

## [0.2.0] — Tests, perfs, dictionnaire

- Tests unitaires (Vitest). Code-splitting de Recharts (chunk dédié, chargé à la demande).
- Dictionnaire d'aliments étendu (~260 entrées).

## [0.1.0] — Première version

- PWA Vite + React 19 + TypeScript + Tailwind v4, **100 % offline** (Dexie/IndexedDB).
- Écrans Journal / Semaine / Évolution / Repères, thème sombre fidèle aux maquettes.
- Seed Lundi/Mardi, export/import JSON, export PDF, `netlify.toml`.

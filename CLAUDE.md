# CLAUDE.md — Digestor

Guide pour travailler dans ce dépôt. Voir `CONTEXT.md` pour l'état détaillé / décisions / TODO.

## Nature du projet

PWA React 19 + TypeScript, **100 % offline**, sans backend. Journal alimentaire & symptômes
(candidose / SIBO / SII). UI **en français**, thème **sombre**. Données locales (Dexie/IndexedDB).

## Commandes

| But | Commande |
|---|---|
| Dev | `npm run dev` |
| Build (typecheck strict + bundle) | `npm run build` |
| Preview du build | `npm run preview` |
| Tests unitaires (`lib/`) | `npm test` |
| Tests en watch | `npm run test:watch` |

Tests : **Vitest**. Par défaut environnement **Node** (fonctions pures de `src/lib`). Les tests de
**composants** (`*.test.tsx`, RTL + jsdom) déclarent `// @vitest-environment jsdom` en tête de fichier
et appellent `afterEach(cleanup)` localement (pas de setup global). 154 tests : `foodClassifier`, `dates`,
`quality`, `quantity`, `openFoodFacts`, `foodSuggestions`, `medicalRecord`, `personalCorrelations`,
`contextCorrelations`, `mealTemplates`, `periodReport`, `journalSearch`, `aggregates`, `correlations`,
`ai/foodInsight`, `ai/dayAnalysis`, `ai/mealSuggestions`, `Chip`, `SymptomGrid`, `MultiChipSelect`,
`TipBanner`, … `npm run build` typecheck aussi les tests.

`tsconfig.app.json` active `strict`, `noUnusedLocals`, `noUnusedParameters` :
les imports/variables inutilisés **cassent le build**.

## Architecture

```
src/
  types.ts            # modèle de données (source de vérité)
  index.css           # thème Tailwind v4 (@theme : couleurs sémantiques)
  App.tsx             # shell : onglets, en-tête, seed au 1er lancement
  hooks/
    useDay.ts         # charge + autosave (debounce) d'un DayEntry
    useDays.ts        # charge en live une liste de jours (useLiveQuery)
  hooks/
    useProfile.ts        # profil santé en live (nom, intolérances, allergies…)
    useAiConfig.ts       # config IA (clé + modèle) en live + helper ready
    useFoodInsight.ts    # analyse IA d'un aliment à la demande + cache
    useDayAnalysis.ts    # analyse IA d'une journée (clé = date) + cache
    useMealSuggestions.ts# suggestions de repas IA (cache meta)
    useFavorites.ts      # aliments favoris en live (table favorites)
    useTreatments.ts     # traitements & compléments en live (table treatments)
    useReintroChallenges.ts # tests de réintroduction FODMAP en live (table reintroChallenges)
    useMealTemplates.ts  # modèles de repas en live (table mealTemplates)
    usePeriodAnalysis.ts # rapport IA d'une période (clé portée+plage) + cache
  lib/                # logique métier pure (testable, sans React)
    constants.ts      # ordres, libellés, couleurs, cycles
    dates.ts          # semaine lundi→dimanche, labels fr
    factory.ts        # uid(), emptyDay(), makeMeal/makeFood
    foodClassifier.ts # dictionnaire ~260 aliments → catégorie + normalisation
    quality.ts        # heuristique badge qualité + score sévérité
    quantity.ts       # unités de portion (càc/càs/g…), format + parsing tolérant (import)
    foodSuggestions.ts# suggestions d'aliments (favoris d'abord) pour l'ajout à un repas
    medicalRecord.ts  # buildMedicalRecord : synthèse complète du journal (dossier médical imprimable)
    personalCorrelations.ts # corrélations aliment→symptôme calculées sur les données réelles (déclencheurs / aliments sûrs)
    contextCorrelations.ts # facteurs contextuels (stress/sommeil/règles) → jours à symptômes
    treatments.ts     # libellés/types de traitements & compléments + helpers (actif, tri)
    reintro.ts        # libellés groupes/verdicts FODMAP + tri (tests de réintroduction)
    mealTemplates.ts  # modèles de repas : repas↔modèle (instanciation avec id neufs)
    periodReport.ts   # tendances (1re vs 2de moitié) + describePeriod (résumé pour l'IA)
    journalSearch.ts  # recherche dans le journal (aliments / symptômes / notes)
    aggregates.ts     # stats hebdo + séries pour graphes
    correlations.ts   # détection heuristique aliment → symptôme
    db.ts             # Dexie v8 : days/meta/foodInsights/dayAnalyses/symptomNotes/organNotes/favorites/treatments/reintroChallenges/mealTemplates/periodAnalyses, export/import, config IA
    encyclopedia.ts   # socle statique des symptômes digestifs (catégorisé) — Repères
    aggregates.ts     # (+ dayHasContent / latestActiveDate, réutilisés par db.ts)
    seed.ts           # données démo Lundi/Mardi conformes aux maquettes
    profile.ts        # options profil + buildProfileContext (contexte injecté à l'IA)
    help.ts           # registre aide + tips par onglet (HELP[tab])
    tour.ts           # visites guidées (coach-marks) par écran : étapes ancrées via data-tour (TOURS[tab])
    json.ts           # parseJsonLoose (extraction JSON tolérante, partagée)
    openFoodFacts.ts  # recherche produit par code-barres (Open Food Facts, sans clé)
    barcodeScanner.ts # lecture code-barres caméra (BarcodeDetector natif + @zxing à la demande)
    mealsImport.ts    # parse/merge du JSON importé (repas + fiches FODMAP + symptômes + transit)
    mealImportPrompt.ts # CLAUDE_WEB_PROMPT (prompt copiable dans la sheet)
    ai/               # couche IA (OpenRouter), optionnelle
      openrouter.ts   # client : fetchFreeModels, chatJSON (parse JSON robuste)
      foodInsight.ts  # prompt + analyzeFood + buildFoodInsight (réutilisé par l'import) + deriveCategory
      dayAnalysis.ts  # describeDay + analyzeDay + coercition (analyse de journée)
      periodAnalysis.ts # rapport IA d'une période : prompt + analyzePeriod + coercition
      mealSuggestions.ts # prompt + suggestMeals + coercition
      insightFormat.ts# libellés/couleurs FODMAP & verdicts
  components/         # UI réutilisable (Chip, SymptomGrid, DayCard, MultiChipSelect, ProfileSheet,
                      #   HelpSheet, TipBanner, Onboarding, Tour [visite guidée ancrée], ImportMealsSheet, ScanProductSheet,
                      #   MedicalRecordSheet [dossier médical imprimable],
                      #   TreatmentsSheet, ReintroSheet, MealTemplatesSheet,
                      #   JournalSearchSheet, ContextRow, …)
    ai/               # AiSettingsSheet, FoodInsightCard, FoodInsightSheet, PeriodReportSheet
  views/              # un écran par onglet (Journal/Aliments/Week/Evolution/Reperes)
```

## Conventions

- **Couleurs** : ne jamais coder une couleur en dur dans un composant — utiliser les
  variables `--color-*` de `@theme` (`index.css`), exposées via `lib/constants.ts`
  (`INTENSITY_COLOR`, `CATEGORY_COLOR`). Palette : rouge `#f0606a` (sévère/pro),
  ambre `#e8a13a` (modéré), vert `#5fbf6f` (léger/bénéfique), gris `#6b6b70` (absent/neutre).
  Exception : `EvolutionView` passe des hex littéraux à Recharts (qui ne lit pas les var CSS).
- **Logique métier dans `lib/`** : composants = présentation + appels aux fonctions de `lib`.
- **Persistance** : un `DayEntry` par date (clé primaire = date ISO). La « semaine » est
  toujours *calculée* (jamais stockée). Écriture via `useDay.update` (autosave) ou `db.putDay`.
- **Symptômes** : par repas (`Meal.symptoms`) + niveau jour (`DayEntry.symptoms`, général/import).
  Pour TOUTE lecture agrégée (badge, stats, graphes, corrélations) passer par
  `effectiveDaySymptoms(day)` (max jour + repas) — ne pas lire `day.symptoms` directement.
  Badge auto : `suggestDayQuality(day)` (vert/orange/rouge selon le cumul).
- **Honnêteté des corrélations** : `correlations.ts` ne conclut que si l'échantillon ≥ seuil ;
  sinon liste vide → l'UI affiche « pas encore assez de données ». Ne pas inventer de motif.
- **Heures de repas** : stockées `"HH:MM"`, affichées « 7 h 30 ».

## IA (OpenRouter) — règles

- **Optionnelle et jamais bloquante** : aucun appel réseau sans clé + modèle configurés ET action
  explicite (bouton). Le cœur reste offline. Toujours gérer le repli (non configuré / hors-ligne).
- **Clé locale** : stockée dans `meta` (`aiConfig`), envoyée uniquement à openrouter.ai, jamais
  incluse dans l'export JSON.
- **Robustesse modèles :free** : ne pas envoyer `response_format`. Le prompt impose un JSON strict,
  `parseJsonLoose` extrait l'objet, puis on coerce chaque champ (cf. `foodInsight.ts`). Un nouveau
  champ d'analyse = l'ajouter au prompt **et** à la coercition **et** au type `FoodInsight`.
- Résultats mis en cache dans `foodInsights` (clé = nom normalisé via `normalize`).

## Pièges connus

- Tailwind v4 : config via `@import "tailwindcss"` + `@theme` dans `index.css`
  (pas de `tailwind.config.js`), plugin `@tailwindcss/vite`.
- Les icônes PWA (`public/icons/*.png`) sont générées depuis `public/favicon.svg` et
  `public/maskable.svg` via ImageMagick — régénérer si le logo change.
- **Dexie** : `orderBy('champ')` exige que `champ` soit **indexé** dans le schéma `.stores()`
  (ex. `foodInsights: '&key, name'` pour permettre `orderBy('name')`). Sinon → DexieError au runtime.

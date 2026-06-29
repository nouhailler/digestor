# CONTEXT.md — Digestor

État du projet, décisions et TODO. Mémoire de travail à tenir à jour.

## Objectif

PWA mobile-first 100 % offline : journal alimentaire + suivi des symptômes pour
candidose intestinale / SIBO / SII. Saisie jour par jour → récap hebdo → corrélations →
graphes d'évolution. Aucun backend, données locales (IndexedDB), export/import JSON.
Rendu visuel fidèle à 4 maquettes (thème sombre, chips colorées, pastilles d'intensité).

## État actuel — v0.13.0 (récupération de l'analyse de journée : partage natif OS + repli presse-papiers + téléchargement texte ; visite guidée par écran avec bulles ancrées, quantité « nombre seul » sans unité, détection des doublons d'aliments + suppression définitive + aliments récents en tête de l'autocomplétion, démarrage robuste ; + facteurs contextuels stress/sommeil/cycle, modèles de repas, rapport IA de période + tendances, recherche dans le journal, suivi des traitements & compléments, réintroductions FODMAP, corrélations personnalisées pilotées par les données, dossier médical imprimable, aliments favoris, scan de produit par code-barres, quantités d'aliments, mode clair en option, symptômes par repas, Aliments enrichi, activité IA en arrière-plan, guide système digestif + fiches d'organes, autocomplétion d'aliments, pistes d'amélioration justifiées, couleur d'aliment IA répercutée dans les repas, 159 tests)

✅ Scaffold Vite + React 19 + TS + Tailwind v4 + PWA (manifest, SW autoUpdate, icônes).
✅ Modèle de données (`types.ts`) + Dexie (`db.ts`) avec export/import/clear.
✅ Logique métier isolée dans `lib/` : classifieur d'aliments, dates, qualité,
   agrégats hebdo, corrélations heuristiques, seed.
✅ Écran **Journal** : carte du jour lecture/édition inline (repas, symptômes, notes, transit),
   navigation date + boutons flottants, autosave debounce.
✅ Écran **Semaine** : 6 cartes-stats + corrélations, navigation semaine.
✅ Écran **Évolution** : 4 graphes Recharts (sévérité, hydratation, catégories, top symptômes).
✅ Écran **Repères** : tableau Candidose / SIBO-SII + écran « À propos » (avertissement médical).
✅ Menu `⋯` : nom patient, export/import JSON, export PDF (print), reset démo.
✅ Invite d'installation A2HS.
✅ Seed Lundi 9 / Mardi 10 juin 2025 conforme aux maquettes (vérifié par capture d'écran).
✅ **Tests unitaires** (Vitest) : 37 tests verts sur classifier/dates/quality/aggregates/correlations.
✅ **Code-splitting** : `EvolutionView` en `React.lazy` + chunk `recharts` séparé (~428 kB,
   chargé à la demande) — bundle principal repassé sous 500 kB, warning Vite levé.
✅ **Dictionnaire d'aliments étendu** à ~260 entrées (102 pro / 97 bénéfiques / 62 neutres).
✅ **IA (OpenRouter)** — brique 1 livrée :
   - Paramètres IA dans le menu : saisie de la clé OpenRouter (stockée localement), bouton
     « Rechercher les modèles gratuits (:free) », sélection d'un modèle.
   - Analyse d'aliments **à la demande** (bouton) : FODMAP (niveau global + 5 groupes :
     fructose/lactose/fructanes/GOS/polyols), verdict SIBO, verdict candidose, portion tolérée,
     synthèse, conseils. Résultat normalisé/validé puis mis en cache (Dexie v2, table `foodInsights`).
   - Nouvel onglet **Aliments** (recherche + bibliothèque des analyses) et analyse accessible
     **au tap sur une chip** d'aliment dans le journal.
   - Repli gracieux : sans clé/modèle, l'UI invite à configurer ; hors-ligne, l'appel échoue
     proprement avec message. Le cœur de l'app reste 100 % offline.
✅ **Profil santé** (menu → « Profil santé ») : nom, **âge**, **sexe**, conditions/diagnostics,
   phase FODMAP, intolérances, allergies, aliments à éviter, **antécédents médicaux**, **médicaments**,
   notes. Champs démographiques/médicaux **facultatifs** (infobulle « Facultatif… » sur chacun).
   Stocké en local (`meta`/profile).
   Injecté comme contexte dans les analyses IA (`buildProfileContext`) ; les allergies sont
   signalées en priorité dans le prompt. Badge « analyse personnalisée » dans la fiche.
✅ **Aide contextuelle + tips + infobulles** : bouton `?` dans l'en-tête → `HelpSheet` de l'écran
   courant (intro + tips, registre `lib/help.ts`). Bandeau `TipBanner` masquable par écran.
   **Infobulles `title` au survol** sur les éléments clés : chips de catégorie (`CATEGORY_HINT`),
   pastilles d'intensité (`INTENSITY_HINT`), chaque symptôme (`SYMPTOM_HINTS`), badge qualité
   (`QUALITY_HINT`), champs de saisie (heure, ajout d'aliment, eau, selles/Bristol, délai digestion,
   âge/sexe/antécédents/médicaments), boutons d'action (analyser la journée, idées de repas, analyse
   en masse, recherche). Centralisées dans `lib/constants.ts`.
✅ **Onboarding** : visite guidée 5 étapes au premier lancement (`Onboarding`), flag `onboardingDone`
   en base (`meta`). Rejouable via « Revoir le tutoriel » dans le menu.
✅ **Analyse IA d'une journée** (bouton « Analyser ma journée » sous la carte) : verdict global,
   déclencheurs probables, pistes d'amélioration. Cache Dexie v3 (`dayAnalyses`, clé = date).
✅ **Suggestions de repas IA** (onglet Aliments → « Idées de repas adaptées ») : 4 idées pauvres
   en FODMAP respectant le profil. Cache meta (`mealSuggestions`).
✅ **Fenêtre Évolution ancrée** sur le dernier jour renseigné (`getLatestActiveDate`) plutôt que
   sur la date courante → plus de période vide.
✅ **Tests de composants (RTL/jsdom)** : Chip, SymptomGrid, MultiChipSelect, TipBanner.
✅ **Import vocal enrichi** (menu → « Entrer un repas (voix → JSON) ») : l'utilisateur dicte sa
   journée à Claude Web (Projet dédié), colle le JSON dans `ImportMealsSheet` → prévisualisation →
   Ajouter/Remplacer → import puis navigation vers le jour. Le JSON peut porter **par aliment** une
   fiche complète (catégorie + FODMAP global et par groupe + verdicts SIBO/candidose + portion/résumé/
   conseils) → mise en cache dans `foodInsights` **sans appel OpenRouter** ; et **par jour** les
   symptômes (clés canoniques + synonymes/accents tolérés), `symptomTiming`, `hydrationL`, `stool`,
   `digestionDelayH`, `quality`, `notes` → écrits dans le `DayEntry`. Parsing tolérant
   (`parseMealsImport`) : JSON entouré de prose/fences, jour unique, heure invalide → 12:00, jour
   sans repas mais avec symptômes accepté. Prompt copiable + guide `docs/claude-web-repas-prompt.md`.
   100 % local (pas d'API). Total 80 tests.

## v0.9 — symptômes par repas & écran Aliments enrichi

- **Symptômes par repas** : `Meal.symptoms` (optionnel). Chaque repas a sa zone « Symptômes après ce
  repas » (grille éditable ; en lecture, liste compacte des symptômes actifs). Les symptômes « jour »
  (`DayEntry.symptoms`, saisie générale / import / seed) restent affichés dans une zone « hors repas »
  si présents ou s'il n'y a aucun repas.
- **Symptômes effectifs** (`effectiveDaySymptoms`) = max par symptôme entre niveau jour et tous les
  repas. **Tous** les agrégats (semaine, évolution, top symptômes, corrélations, score énergie,
  `dayHasContent`) et le badge qualité s'appuient dessus → rien à resynchroniser.
- **Badge qualité 3 niveaux** (`suggestQuality`, cumul journée) : vert `bonne` (≤1 léger) →
  orange `correcte` (2–3 symptômes) → rouge `difficile` (≥4 cumulés ou ≥2 sévères). `correcte` est
  désormais **ambre** dans `QualityBadge`.
- **Selles** : combobox échelle de Bristol complète (`STOOL_OPTIONS`, types 1–7 + « Aucune selle »),
  qui fixe `label` + `bristol`. Champ « nb » conservé.
- **Infobulles** (`title`) ajoutées sur les zones d'édition (eau, selles/Bristol, délai digestion,
  pastilles symptômes, recherche d'aliments, analyse en masse…).
- **Écran Aliments** : liste l'**union** des aliments des repas + des fiches analysées (chaque ligne
  « analysé / à analyser », pastille de catégorie estimée via le classifieur si non analysé).
  **Analyse en masse** des non-analysés (séquentielle, progression, arrêt possible). Recherche
  **combobox dynamique** (préfixe à partir de 3 lettres) avec option « Analyser « … » » pour un
  aliment nouveau. Suppression / réanalyse par aliment. Une fiche en cache reste consultable **sans
  clé** (cf. correctif v0.8).
- **Catalogue complet** (v0.9.1) : sélecteur « De mes repas (N) » / « Catalogue (~267) », **ouvert
  sur le catalogue par défaut**. Le catalogue expose tout le dictionnaire embarqué
  (`dictionaryFoods`), pas seulement les aliments des repas. La recherche porte toujours sur le
  catalogue entier. L'analyse en masse demande confirmation au-delà de 20 aliments.

## v0.9.2 — agenda hebdo cliquable

- La page **Semaine** était déjà dynamique (`useDays` → `useLiveQuery`, stats + corrélations calculées
  en live). Ajout d'un **agenda des 7 jours** (lun→dim) en tête : chaque cellule montre le jour, une
  pastille de couleur = qualité effective (rouge/orange/vert, neutre si aucune donnée) et un
  indicateur de repas. **Clic → ouvre le jour dans le Journal** (`onOpenDay` → `setDate` + onglet
  Journal). Jour courant en gras, jour sélectionné entouré.

## v0.9.3 — idées de repas actionnables & infobulles Repères

- **Idées de repas** : bouton d'accès en **pastille verte pleine** (cohérent avec « Analyser les
  aliments »). Dans la sheet, chaque idée a **« Ajouter au journal »** (crée un repas dans le jour
  courant — heure devinée d'après le titre — action **locale, sans clé IA**) et **« Autre idée »**
  (régénère cette suggestion via l'IA). Boutons globaux **« Générer plus d'idées (IA) »** (ajoute
  sans écraser) et **« Tout régénérer »**. `suggestMeals` accepte `count` + `avoid` (évite de
  reproposer les mêmes repas) ; hook `useMealSuggestions` expose `generate` / `more` / `regenerate`.
- Comme pour les fiches d'aliments : un jeu d'idées **en cache reste consultable et ajoutable au
  journal sans clé** ; seule la (re)génération exige l'IA.
- **Repères** : infobulle explicative sur chaque symptôme du tableau (souligné pointillé), ex.
  « Envie compulsive de sucre » → « Le Candida se nourrit de sucre… ».

## v0.9.4 — encyclopédie des symptômes (Repères)

- **Repères** : chaque symptôme du tableau est **cliquable → fiche détaillée** (`SymptomDetailSheet`) :
  repère statique affiché d'emblée + section IA **origine / manifestation / effets / conseils**,
  générée à la demande (`explainSymptom`) et mise en cache (Dexie v4, table `symptomNotes`). Repli
  gracieux sans clé ; une fiche en cache reste consultable sans clé.
- Sous le tableau : **« Plus d'informations »** ouvre l'`EncyclopediaSheet` — socle **statique**
  (`lib/encyclopedia.ts`, ~22 symptômes classés par catégorie : haut, bas, selles & transit,
  systémiques, signes d'alarme) ; chaque entrée ouvre sa fiche détaillée.
- **« Enrichir avec l'IA »** (bouton IA) : `enrichEncyclopedia` génère des symptômes supplémentaires
  par catégorie (en évitant les doublons), fusionnés au socle et mis en cache (meta `encyclopediaExtra`).
- Socle volontairement concis : « petite encyclopédie » à étoffer progressivement.

## v0.9.5 — encyclopédie étoffée

- Écran **Repères** réorganisé en **sous-onglets** : « Repères » (tableau discriminant) et
  « Encyclopédie » (`EncyclopediaList` inline — remplace l'ancienne sheet modale).
- **Échelle de Bristol illustrée** (`BristolScale` : glyphes SVG par type 1-7 + couleurs).
- **Recherche** dans l'encyclopédie (nom ou manifestation), masque le schéma Bristol pendant la recherche.
- Socle statique enrichi (~35 entrées, `lib/encyclopedia.ts`).
- **Symptômes du Journal liés à leur fiche** : en lecture, un symptôme (zone par repas ou « hors repas »)
  est cliquable → `SymptomDetailSheet`. `SymptomGrid` accepte `onInfo`, `MealEditor` `onSymptomInfo`,
  propagés depuis `DayCard`/`JournalView` (clé → libellé + repère statique).

## v0.9.6 — encyclopédie : masse, liens croisés, filtre

- **Pré-génération en masse** : bouton « Tout détailler (N) » dans l'encyclopédie → détaille via l'IA
  toutes les fiches manquantes du périmètre affiché (séquentiel, progression, arrêt, confirmation >20).
  Coche verte sur les symptômes déjà détaillés (`getAllSymptomInfos`).
- **Liens croisés** : `SymptomInfo.related` (renvoyé par l'IA) → chips « Symptômes liés » cliquables
  qui rouvrent la fiche correspondante (`onSelectRelated`, hint via `findManifestation`). `JournalView`
  stocke désormais `{name, hint}` (au lieu d'une `SymptomKey`) pour gérer les liens arbitraires.
- **Filtre par catégorie** (select) en plus de la recherche dans `EncyclopediaList`.

## v0.9.7 — persistance & export complet

- **Stockage persistant** : `ensurePersistentStorage()` (`lib/storage.ts`) appelé au démarrage
  (`App`) → `navigator.storage.persist()` (best-effort) pour réduire l'éviction (surtout iOS).
- **Export/import complets** (payload v4) : ajout de `symptomNotes`, `mealSuggestions`,
  `encyclopediaExtra` à `exportAll`/`importAll`. La config IA (`aiConfig`, clé) reste **exclue**
  (secret local). Transaction d'import en forme tableau (Dexie limite le nb d'arguments).
- À propos : mention du stockage persistant + de ce que contient l'export.

## v0.9.8 — rappel de sauvegarde & export des réglages

- `lib/backup.ts` : `downloadBackup()` (export + horodatage `lastExportAt`), `daysSince`,
  `BACKUP_REMINDER_DAYS` (7).
- **`BackupReminder`** (rendu sous l'en-tête) : bannière si données présentes (>2 jours, ou fiches
  d'aliments/symptômes) et jamais exporté / > 7 jours. Bouton « Sauvegarder », masquable (session).
- **MenuSheet** : bouton vert proéminent « Sauvegarder mes données (JSON) » en tête ; l'ancien
  « Exporter JSON » du grid devient « Restaurer (JSON) » pour l'import.
- **Export v4 + réglages** : `settings { modelId, onboardingDone }` (sans la clé API). L'import
  restaure le modèle (sans écraser une clé déjà présente) et l'état d'onboarding.

## v0.9.9 — activité IA en arrière-plan & indicateur global

- **Exécution en arrière-plan** : les analyses IA ne sont plus liées au cycle de vie des composants.
  Un store global hors React (`lib/ai/aiActivity.ts`, `runAiTask(label, fn)`) lance le travail
  (appel réseau + écriture en cache) qui **se poursuit même si l'utilisateur quitte l'écran** — fini
  l'`AbortController` qui annulait tout au démontage. Les hooks (`useFoodInsight`, `useDayAnalysis`,
  `useMealSuggestions`, `useSymptomInfo`) gardent un drapeau `mounted` pour ne mettre à jour leur état
  local (loading/error) que s'ils sont encore montés ; le cache Dexie (`useLiveQuery`) se met à jour
  tout seul au retour sur l'écran.
- **Indicateur global d'en-tête** (`AiActivityBadge`, monté dans `Legend`) : sablier ambre qui tourne
  + « IA » + décompte en secondes tant qu'au moins une tâche tourne (compteur ×N si plusieurs), puis
  pastille verte « IA ✓ » pendant ~4 s à la réussite. S'appuie sur `useSyncExternalStore`
  (`useAiActivity`) ; `useSecondTick` rafraîchit le décompte.
- **Boutons CTA** : composant `AiBusy` (sablier + secondes) remplace le simple `Loader2` sur les
  boutons « Analyser » des sheets (aliment, journée, repas, symptôme).
- **Générations en masse** (`AlimentsView`, `EncyclopediaList`) : chaque item passe par `runAiTask`,
  donc visible dans le badge global (compteur).
- Annexe outillage : `shot.mjs` + devDep `playwright-core` (utilitaire de capture d'écran, hors app).

## v0.9.10 — guide illustré du système digestif (Repères)

- Nouveau **3ᵉ sous-onglet « Système digestif »** dans l'écran Repères (à droite d'Encyclopédie,
  `ReperesView` → `SubTab = 'reperes' | 'encyclopedie' | 'systeme'`, icône `HeartPulse`). Boutons de
  découverte depuis l'onglet Repères (« Comprendre la digestion »).
- Composant `components/DigestiveGuide.tsx`, **mélange image réelle + schémas SVG maison** :
  - **Anatomie** : planche du tube digestif **embarquée localement** (`public/anatomy/digestive-system-fr.svg`,
    303 ko), affichée sur un cartouche **fond blanc** (libellés noirs illisibles sur thème sombre).
    Image **domaine public** : Mariana Ruiz (LadyofHats), Jmarchn, trad. fr. Moez — via Wikimedia Commons.
    Attribution affichée en pied de section.
  - **Transit étape par étape** : timeline verticale (bouche → œsophage → estomac → grêle → côlon →
    rectum) avec durées indicatives et rôle de chaque organe (style cohérent avec `BristolScale`).
  - **Microbiote** : 2 panneaux SVG comparant **eubiose** (pastilles vertes majoritaires) vs **dysbiose**
    (rouges/ambre en excès) — pastilles placées par `gutDots()` (grille 6×4, permutation déterministe
    `(i*11)%24`), légende + rôles + lien explicatif vers SIBO / Candida.
- **100 % offline** : le SVG anatomique est précaché par le SW (précache 18 → 19 entrées, ~1018 → ~1323 ko).
  Aucun appel réseau, pas d'IA. Composant purement présentationnel (pas de logique `lib/` → pas de test unitaire).

## v0.9.11 — garde-fou de rendu (fini l'« écran noir »)

- 🐞 **Symptôme** : clic sur l'onglet **Évolution** → écran noir. Cause la plus probable : `EvolutionView`
  est chargé en **lazy** (chunk séparé) et n'était entouré que d'un `<Suspense>`, **sans error boundary**.
  Si l'import du chunk échoue (chunk obsolète après un nouveau déploiement, le SW servant un index qui
  pointe vers un ancien hash, ou coupure réseau), l'exception remonte et fait planter **toute**
  l'arborescence React → page noire (pas seulement l'onglet).
- ✅ **Correctif** : `components/ErrorBoundary.tsx` enveloppe le contenu de `<main>` dans `App.tsx`
  (avec `key={tab}` → repart d'un état propre à chaque changement d'onglet). Affiche un repli lisible
  + bouton « Recharger » au lieu de l'écran noir. Pour un échec de chargement de chunk
  (`isChunkLoadError`), **recharge automatiquement une fois** (garde `sessionStorage` anti-boucle) pour
  récupérer la version à jour.
- Les fonctions d'agrégation (`severityByDay`, `categoryCountsByDay`, `hydrationByDay`, `topSymptoms`)
  ont été revues : défensives (accès via `effectiveDaySymptoms`, au pire des `NaN`, pas de throw).
- Tests : `ErrorBoundary.test.tsx` (RTL/jsdom) — repli affiché sur enfant qui throw, rendu normal sinon.
  Total **94 tests**.

## v0.9.12 — fiches d'organes cliquables (guide système digestif)

- Dans le guide **Système digestif**, chaque étape du transit (Bouche, Œsophage, Estomac, Intestin grêle,
  Gros intestin, Rectum & anus) devient **cliquable** → `OrganDetailSheet` :
  - **Image** de l'organe (illustrations **SEER / NCI**, domaine public, embarquées dans
    `public/anatomy/organs/`, sur cartouche fond blanc).
  - **Rôle dans la digestion** + **pathologies fréquentes** : contenu **statique** curé
    (`lib/organs.ts`, `ORGANS[]`), affiché d'emblée, hors-ligne, non diagnostique.
  - **Bouton IA « Approfondir avec l'IA »** → `OrganInfo` (aperçu, pathologies détaillées, lien
    candidose/SIBO/SII, conseils, signes d'alarme). Cache **Dexie v5** (table `organNotes`, clé = id
    d'organe). Mêmes garde-fous que les fiches de symptômes : repli sans clé, exécution en arrière-plan
    (`runAiTask`), une fiche en cache reste consultable sans clé.
- Couche : `types.ts` (`OrganInfo`), `lib/organs.ts` (catalogue + `getOrgan`), `lib/ai/organInfo.ts`
  (`explainOrgan` + coercition), `hooks/useOrganInfo.ts`, `components/OrganDetailSheet.tsx`.
  `DigestiveGuide` reçoit `onOpenAiSettings` (passé par `ReperesView`).
- **DB v5** + **export/import** étendus (`organNotes` ajouté à `exportAll`/`importAll`/`clearAll`,
  payload `version: 5`). Clé API toujours exclue de l'export.
- **PWA** : `vite.config.ts` — `globPatterns` étendu à `jpg,jpeg` (sinon les 5 illustrations JPG
  n'étaient **pas** précachées → indispo hors-ligne). Précache 19 → 25 entrées (~1,6 Mo).
- 94 tests (inchangé : composant/UI, pas de logique `lib` nouvelle testable hors prompt).

## v0.9.13 — autocomplétion d'aliments & pistes d'amélioration justifiées

- **Autocomplétion d'aliments (anti-doublon)** : nouveau hook `hooks/useKnownFoods.ts` — `useLiveQuery`
  sur `db.days`, collecte tous les noms d'aliments dédupliqués par forme **normalisée** (`normalize`
  de `foodClassifier`, on garde la 1ʳᵉ orthographe vue), triés alpha. `JournalView` le calcule une
  fois et le passe en prop `knownFoods` → `DayCard` → `MealEditor`. Dans `MealEditor`, dès **3 lettres**
  saisies, suggestions filtrées (sous-chaîne normalisée, hors aliments déjà dans le repas, max 6),
  rendues en menu déroulant ; sélection via `onMouseDown` (avant le blur de l'input) → `addFood(name)`.
  But explicite : réutiliser une orthographe/casse existante au lieu de créer des doublons.
- **Pistes d'amélioration justifiées (analyse de journée IA)** : `DayAnalysis.improvements` n'est plus
  `string[]` mais `DayImprovement[]` (`{ action, why }`, nouveau type dans `types.ts`). Le prompt
  (`lib/ai/dayAnalysis.ts`) demande un objet par piste avec un `why` **non vide** (bénéfice attendu /
  mécanisme FODMAP/sucres) ; nouvelle coercition `coerceImprovements` **tolérante** (objet attendu,
  mais aussi simple chaîne ou ancien cache → `why` vide). `DayAnalysisSheet` rend un `ImprovementsBlock`
  dédié : action + ligne « Pourquoi : … » atténuée ; `normalizeImprovement` gère l'ancien format en
  cache (pas de plantage, mais sans justification → « Réanalyser » régénère la version expliquée).
  Tests `dayAnalysis.test.ts` mis à jour (format objet + tolérance chaîne). Total **95 tests**.

## v0.9.14 — couleur d'aliment IA répercutée dans les repas & remontée pendant la génération

- **Couleur d'aliment dans le repas reflète l'analyse IA** : nouveau hook `hooks/useFoodInsightMap.ts`
  (`useLiveQuery` → `Map<nomNormalisé, FoodInsight>`) propagé `JournalView` → `DayCard` → `MealEditor`.
  Helper `insightChipColor` (`lib/ai/insightFormat.ts`) : couleur = **niveau FODMAP** (Élevé→sévère,
  Modéré→ambre, Bas→léger ; `unknown`→catégorie dérivée). C'est le seul signal réellement **tri-niveau**
  (la catégorie pro/bénéfique/neutre n'a pas d'ambre), d'où ce choix pour « Sévère/Modéré/Léger ».
  `MealEditor` applique cette couleur **en lecture** uniquement ; **en édition**, on garde
  `CATEGORY_COLOR[food.category]` pour que le cycle de catégorie au tap reste visible. Réactif :
  générer une fiche repeint la chip sans rechargement.
- **Analyse de journée enrichie par les fiches** : `describeDay`/`analyzeDay` (`lib/ai/dayAnalysis.ts`)
  acceptent une `Map<string, FoodInsight>` optionnelle ; chaque aliment analysé est annoté
  `nom (FODMAP …, SIBO …, candida …)` au lieu de `nom (catégorie)`. Rétrocompatible (sans map → ancien
  format). `useDayAnalysis.analyze` et `DayAnalysisSheet` (via `useFoodInsightMap`) transmettent la map.
- **Aliments en cours de génération en haut de la liste** : `AlimentsView` lit les **libellés** du store
  d'activité IA (`useAiActivity`), extrait ceux préfixés `Aliment · ` (constante `FOOD_TASK_PREFIX`),
  normalise → clés en cours de génération. Ces lignes sont **épinglées en tête** (badge « Génération… »
  + `Loader2` vert, bordure verte) le temps de la génération, puis retombent dans l'ordre alpha. Couvre
  toutes les provenances (analyse en masse, fiche `FoodInsightSheet`, recherche d'un nouvel aliment) ;
  un aliment encore absent de la liste est **synthétisé** pour apparaître pendant sa génération.
- Test ajouté : `describeDay` enrichit bien un aliment avec analyse, laisse les autres sur leur
  catégorie (`dayAnalysis.test.ts`). Total **96 tests**.

## v0.13.0 — récupérer l'analyse de journée (partage & téléchargement)

- **Sortie de l'analyse IA de journée** : `lib/dayAnalysisExport.ts` (logique pure + helpers navigateur).
  - `formatDayAnalysis(analysis)` — met en forme en **texte simple** (markdown léger) : titre daté,
    verdict (`VERDICT_LABEL`), résumé, **déclencheurs probables**, **pistes d'amélioration justifiées**
    (« Pourquoi : … », tolère l'ancien format chaîne), mention « Repère indicatif, non médical ».
    N'émet pas de section vide. Fonction **pure**, testée (`dayAnalysisExport.test.ts`).
  - `shareDayAnalysis(analysis)` — `navigator.share` si disponible (feuille OS : mail, messagerie,
    Fichiers…), **repli `navigator.clipboard.writeText`** sinon ; renvoie `'shared' | 'copied' |
    'cancelled'` (une **annulation** `AbortError` ne retombe **pas** sur la copie).
  - `downloadDayAnalysis(analysis)` — Blob `text/plain` → `digestor-analyse-AAAA-MM-JJ.txt`
    (même mécanique que `lib/backup.ts`).
- **UI** : `components/ai/DayAnalysisSheet.tsx` — sous l'analyse, à côté de « Réanalyser » (séparés par
  un filet), composant `ExportButtons` : **Partager** (icône `Share2`, bascule « Copié ✓ » 2 s sur repli
  presse-papiers) et **Télécharger** (icône `Download`). Pas de nouvelle table Dexie.
- **Rappel** : app 100 % offline → aucun envoi serveur ; le partage natif est le plus proche d'un
  « envoyer par email ».
- Total **159 tests** (dont `dayAnalysisExport.test.ts` : formatage, justifications vides, ancien format
  chaîne, sections vides, nom de fichier).

## v0.12.0 — visite guidée par écran, quantité « nombre seul » & robustesse

- **Visite guidée par écran (coach-marks)** : `lib/tour.ts` (`TOURS[tab]` : étapes ciblant un
  élément par son attribut `data-tour="…"`, ou bulle centrée si la cible est absente) +
  `components/Tour.tsx` (superposition : assombrit l'écran, **halo** sur la cible via
  `box-shadow: 0 0 0 9999px`, bulle ancrée — position **mesurée puis clampée** dans le viewport,
  au-dessus / en dessous selon la place ; navigation Suivant/Précédent/Passer, points de progression,
  flèches clavier + Échap). Auto-démarrage à la **première arrivée** sur chaque écran (une fois
  l'onboarding passé), **mémorisé** dans `meta.toursSeen` (`getSeenTours`/`markTourSeen`/`resetTours`).
  Rejouable : bouton « Lancer la visite guidée de cet écran » dans `HelpSheet` ; « Revoir le tutoriel &
  les visites guidées » (menu) réinitialise tout puis rejoue. Attributs `data-tour` posés sur les
  éléments réels (header help/menu/légende, barre d'onglets, et un point d'ancrage stable par vue :
  date du Journal, crayon+badge de la carte, recherche d'Aliments, navigation Semaine, plage Évolution).
  Vérifié au navigateur (Chromium piloté) : ancrage, clamp, auto-démarrage par écran, aucune erreur console.
- **Quantité « nombre seul »** : nouvelle unité `'unite'` (`types.ts`/`QuantityUnit`, en tête de
  `QUANTITY_UNITS`) — `formatQuantity` n'affiche **que le chiffre** (« 2 ») sans libellé, pour les
  aliments qui se comptent (œufs…). `parseQuantity` reconnaît « unité »/« unités » explicites mais
  **conserve** le repli existant (un nombre sans unité reste ignoré à l'import — test « unité manquante »).
- **Aliments — doublons & récents** : détection / fusion des doublons et **suppression définitive**
  d'un aliment ; aliments **récents** (aujourd'hui / hier / avant-hier) remontés en tête de
  l'autocomplétion (`useRecentFoods`). Onboarding mis à jour.
- **Démarrage robuste** : `App` n'est plus figé sur « Chargement » en cas d'erreur au boot — l'erreur
  est capturée, affichée sous l'en-tête, et l'app se rend quand même (`ready` toujours posé en `finally`).
- 🐞 **Rafraîchissement après import vocal** : `hooks/useDay.ts` passe en **réactif** (`useLiveQuery`).
  Avant, le hook ne rechargeait la journée que sur changement de **date** ; un import écrivant le jour
  **déjà affiché** (`putDay`) n'était pas reflété → il fallait naviguer au jour précédent/suivant pour
  voir le repas. Désormais l'écran se met à jour tout seul. Garde-fous : un drapeau `dirty` empêche
  d'écraser une édition locale non encore sauvegardée (autosave debounce intact) ; le querier renvoie
  toujours une journée (vide au besoin) → `stored === undefined` = « chargement » sans ambiguïté (pas de
  faux « Chargement… »). Vérifié au navigateur (flux d'import réel : chip absente → présente sans changer
  de date, aucune erreur console).
- Total **154 tests** (dont `quantity.test.ts` : « nombre seul » n'affiche que le chiffre).

## v0.11.0 — facteurs contextuels, modèles de repas, rapport de période & recherche (Tier 2)

Quatre fonctionnalités (cf. brainstorming « Tier 2 »).

- **Facteurs contextuels (stress / sommeil / cycle)** : `DayEntry` += `stress` (Intensity), `sleepH`,
  `menstrual`. Saisie via `components/ContextRow.tsx` (section « Bien-être & contexte » du Journal).
  `lib/contextCorrelations.ts` (pur, testé) : stress élevé / sommeil court (< 6 h) / règles → taux de
  jours à symptômes (avec vs sans), seuils conservateurs. Affiché dans **Semaine** et le **dossier
  médical** ; injecté aussi à `describeDay` (prompt d'analyse de journée).
- **Modèles de repas** : type `MealTemplate` + table Dexie **v8 `mealTemplates`** + `lib/mealTemplates.ts`
  (`templateFromMeal`, `mealFromTemplate`, pur/testé) + hook `useMealTemplates`. `MealTemplatesSheet`
  (menu) pour créer/éditer ; bouton signet dans `MealEditor` pour enregistrer un repas comme modèle ;
  « Depuis un modèle » dans `DayCard` pour insérer un repas en un geste.
- **Rapport IA de période + tendances** : `lib/periodReport.ts` (`computeTrends` comparant 1re/2de
  moitié + `describePeriod`, pur/testé), `lib/ai/periodAnalysis.ts` (pipeline IA, cache table **v8
  `periodAnalyses`** clé = portée+plage), hook `usePeriodAnalysis`, `PeriodReportSheet` ouvert depuis
  **Évolution** (tendances locales toujours visibles ; synthèse IA optionnelle, non bloquante).
- **Recherche dans le journal** : `lib/journalSearch.ts` (aliments / symptômes actifs / notes, pur/testé)
  + `JournalSearchSheet` (menu) ; résultats cliquables → ouvrent le jour.
- **DB v8** : 2 tables ajoutées ; export/import couvre `mealTemplates` (le cache `periodAnalyses` est
  régénérable, vidé à l'import) ; `clearAll` couvre tout. Menu enrichi (Recherche, Modèles de repas).
- Tests : `contextCorrelations`, `mealTemplates`, `periodReport`, `journalSearch`. Total **148 tests**.

## v0.10.0 — traitements, réintroductions FODMAP & corrélations personnalisées (Tier 1)

Trois fonctionnalités cliniques majeures (cf. brainstorming « Tier 1 »).

- **Suivi des traitements & compléments** : type `Treatment` + table Dexie **v7 `treatments`** + CRUD +
  hook `useTreatments`. `lib/treatments.ts` (8 types : antifongique, antibiotique, probiotique,
  prébiotique, complément, phytothérapie, médicament, autre ; `isTreatmentActive`, tri en cours
  d'abord). `components/TreatmentsSheet.tsx` (menu, sous Profil santé) : ajout/édition/suppression,
  « marquer terminé », dose / fréquence / dates / notes.
- **Réintroductions FODMAP** : types `ReintroChallenge` / `ReintroDose` + table **v7
  `reintroChallenges`** + CRUD + hook `useReintroChallenges`. `lib/reintro.ts` (groupes FODMAP +
  « autre », verdicts toléré / partiel / non toléré / abandonné / en cours avec couleurs, tri).
  `components/ReintroSheet.tsx` : aliment testé, groupe, verdict, **journal des doses** (étape +
  réaction colorée), notes.
- **Corrélations personnalisées (données réelles)** : `lib/personalCorrelations.ts` (pur, testé) —
  pour chaque aliment assez fréquent, taux de symptôme « les jours avec » vs « sans », **déclencheurs
  suspectés** (seuils conservateurs, respecte la règle d'honnêteté) + **aliments fréquents bien
  tolérés**. Affiché dans **Semaine** (sur tout l'historique) et dans le **Dossier médical**.
- **Intégrations** : export/import JSON **v7** + `clearAll` couvrent les deux nouvelles tables ;
  `buildMedicalRecord(days, profile, insights, treatments, reintro)` ajoute 3 sections (traitements,
  réintroductions, corrélations personnalisées).
- Tests : `personalCorrelations.test.ts` (seuils, déclencheur net, aliment rare, aliments tolérés).
  Total **130 tests**.

## v0.9.19 — dossier médical imprimable

- **Objectif** : produire une synthèse complète de toutes les données du journal, à imprimer / exporter
  en PDF pour la remettre à un médecin. Accessible via le menu ⋯ (entre « Revoir le tutoriel » et
  « À propos & avertissement médical »).
- **Builder pur** `lib/medicalRecord.ts` (`buildMedicalRecord(days, profile, insights)`) : ne compte
  que les jours renseignés (`dayHasContent`), période couverte (1er→dernier jour + amplitude),
  **synthèse des symptômes** (jours présents / dont sévères / intensité max, via `effectiveDaySymptoms`,
  triée par poids), **aliments les plus fréquents** (dédup par nom normalisé, catégorie issue de l'IA si
  dispo) + repérage des **aliments défavorables** (catégorie `pro`), **transit & hydratation** (moyenne,
  répartition Bristol, jours avec selle), **corrélations** (`detectCorrelations`), et **détail
  chronologique** des jours (repas + heures + quantités + symptômes par repas + transit + notes).
- **UI** `components/MedicalRecordSheet.tsx` : overlay **plein écran** (hors `Sheet`, car l'impression
  cible spécifiquement `#dossier`), thème sombre à l'écran, sections : profil santé (repli « non
  renseigné »), synthèse symptômes (tableau + pastilles d'intensité), transit, aliments, corrélations,
  journal détaillé, avertissement médical. Données live (`getAllDays` + `useFoodInsightMap` + profil).
- **Impression** : bouton « Imprimer / PDF » → `window.print()` après ajout de `body.printing-dossier`
  (retiré sur `afterprint`). Règles `@media print` dans `index.css` : on n'imprime que `#dossier`, en
  **noir sur blanc** (texte forcé `#111`), en **conservant les pastilles de couleur** (sévérité /
  catégorie, via `background-color`). N'interfère pas avec l'« Exporter PDF » existant (semaine).
- Tests : `medicalRecord.test.ts` (période, agrégation symptômes, dédup aliments + défavorables,
  transit/Bristol, détail chronologique, cas vide). Total **126 tests**.

## v0.9.18 — aliments favoris

- **Objectif** : retrouver vite ses aliments habituels et savoir si un produit acheté a déjà été
  repéré. Les favoris sont **proposés en tête** lors de l'ajout d'un aliment à un repas.
- **Modèle** : `FavoriteFood { key, name, addedAt, scannedAt? }` (`types.ts`), clé = nom normalisé.
  Table Dexie **v6 `favorites`** (`db.ts`, `name` indexé pour `orderBy`). CRUD `getAllFavorites`,
  `addFavorite` (conserve `addedAt`/`name`, pose `scannedAt` sans l'effacer), `removeFavorite`,
  `toggleFavorite`. Inclus dans l'export/import JSON (payload **v6**) et `clearAll`.
- **Suggestions favoris-d'abord** : `lib/foodSuggestions.ts` (pur, testé) — requête vide → liste des
  favoris (ajout rapide) ; 1–2 car. → rien ; ≥ 3 car. → favoris correspondants puis aliments connus ;
  dédup par forme normalisée, exclusion des aliments déjà dans le repas, correspondance exacte ignorée
  (déjà ajoutable via Entrée). `MealEditor` l'utilise (★ ambre, liste affichée au focus du champ),
  threadé via `DayCard` → `JournalView` (hook `useFavorites`).
- **Scan → favori automatique** : à la validation d'un produit scanné (`AlimentsView.onPick`),
  `addFavorite(name, { scannedAt: now })`. La **date de scan** est affichée dans la fiche de l'aliment
  (`FoodInsightSheet` : « Scanné le … » + étoile favori) et sous l'aliment dans la liste Favoris.
- **Gérer les favoris** : `AlimentsView` ajoute l'onglet **« Favoris (n) »** (à côté de « De mes repas »
  / « Catalogue ») et une **étoile cliquable sur chaque ligne** (ajout/retrait, toutes portées). Les
  favoris peuvent inclure des produits scannés absents des repas/catalogue.
- Tests : `foodSuggestions.test.ts` (ordre favoris/connus, dédup, exclusion, seuils). Total **120 tests**.

## v0.9.17 — scan de produit par code-barres

- **Objectif** : savoir si un produit acheté est déconseillé (FODMAP / SIBO / candidose) en scannant
  son code-barres. Optionnel et non bloquant, comme le reste de l'IA ; le cœur reste hors-ligne.
- **Flux** : code-barres (caméra ou saisie) → recherche **Open Food Facts** (base libre, sans clé) →
  nom + marque + **ingrédients** → on passe le tout à l'analyse IA existante (FODMAP/SIBO/candidose),
  mise en cache dans `foodInsights` comme n'importe quel aliment (donc visible ensuite dans Aliments,
  couleur de chip dans le journal, etc.).
- `lib/openFoodFacts.ts` : `lookupProduct(barcode)` (préfère le FR, marque, ingrédients, contenance),
  `isValidBarcode`, `productDetails` (contexte texte injecté au prompt). Seul le code-barres est envoyé.
- `lib/barcodeScanner.ts` : `startBarcodeScan(video, onResult)` — **`BarcodeDetector` natif** si dispo
  (Android/Chrome, zéro poids), sinon **`@zxing/browser` importé à la demande** (iPhone/Safari). C'est
  nous qui ouvrons le flux (caméra arrière) pour unifier permission/affichage/nettoyage. Chunk zxing
  (~436 kB) **séparé et non préchargé** (vérifié : absent de `index.html`).
- `components/ScanProductSheet.tsx` : caméra + cadre de visée + **saisie manuelle** du code en secours ;
  états scanning / looking / found / notfound (nom à saisir si produit inconnu). Handoff `onPick(name,
  details)` → `AlimentsView` ouvre la `FoodInsightSheet` avec le contexte produit.
- **Enrichissement IA** : `analyzeFood`/`userPrompt` + `useFoodInsight.analyze` + `FoodInsightSheet`
  acceptent un `details` optionnel (ingrédients/marque) — meilleure précision pour les produits
  transformés. Rétrocompatible (sans `details` = inchangé).
- **Dépendance ajoutée** : `@zxing/browser` (lazy). Les 5 vulnérabilités `npm audit` sont **pré-existantes**
  (vite/vitest/esbuild, dev only), non liées à zxing.
- Tests : `openFoodFacts.test.ts` (validation code, mapping/repli via fetch mocké, `productDetails`).
  Total **114 tests**.

## v0.9.16 — quantités d'aliments (cuillères, portions, poids)

- **Quantité optionnelle par aliment** : `FoodItem.quantity?: { amount, unit }` (`types.ts`).
  Unités : càc, càs, pincée, portion, poignée, tranche, verre, bol, g, ml. Motivation : « confiture »
  ≠ « 1 càc de confiture » pour l'analyse IA — la portion change l'impact FODMAP/sucre.
- `lib/quantity.ts` : `QUANTITY_UNITS` (libellés + pas + défaut par unité), `formatQuantity`
  (« 1 càc », « 2 càs », « ½ portion », pluriel géré), `clampAmount`, `defaultQuantity`, et
  `parseQuantity` (parseur **tolérant** pour l'import : objet `{amount,unit}` ou chaîne libre
  « 1 càc » / « 2 cuillères à soupe » / « 150 g » / « ½ verre », synonymes + fractions/glyphes).
- **UI** : `components/FoodQuantityEditor.tsx` — petit popover ancré sous la chip (en édition) :
  stepper −/+ (pas adapté à l'unité), choix d'unité, « Effacer ». `MealEditor` ajoute une icône
  balance (`Scale`) sur chaque chip en édition ; la quantité s'affiche en préfixe de la chip
  (lecture **et** édition). Ouvrir le popover n'ajoute rien tant qu'on n'interagit pas.
  Balance 16 px avec **zone tactile élargie** (padding + marges négatives, sans grossir la chip)
  et **séparée de la croix** de suppression par un léger trait — viser au doigt sur mobile.
- **Symptômes par repas repliés par défaut** (en édition) : la grille 12 symptômes prenait beaucoup
  de hauteur par repas alors que la plupart n'en ont aucun. `MealEditor` la met derrière un en-tête
  cliquable (chevron) ; replié, il affiche un **résumé** des symptômes déjà saisis (pastille + libellé).
  La grille (sœur du bouton, jamais imbriquée) ne s'affiche que déplié. Lecture inchangée.
- **IA** : `dayAnalysis.foodTag` préfixe le nom par la quantité (« 1 càc confiture (pro) ») et le
  `SYSTEM_PROMPT` invite à pondérer selon la portion.
- **Import** : `mealsImport.parseFood` lit `quantity` (via `parseQuantity`) → propagé jusqu'au repas
  créé. Prompt `CLAUDE_WEB_PROMPT` + doc miroir mis à jour (champ `quantity` privilégié sur la
  quantité dans le nom).
- Tests : `quantity.test.ts` (format, clamp, défaut, parsing) + `describeDay` préfixe la quantité.
  Total **106 tests**.

## v0.9.15 — mode clair en option

- **Thème clair en plus du sombre** (Menu → « Apparence » : Sombre / Clair). Sombre reste le défaut.
- `lib/theme.ts` : source de vérité en **`localStorage`** (lecture synchrone au boot → pas de « flash »
  sombre avant le clair), volontairement **hors** de Dexie et de l'export JSON (préférence d'affichage
  propre à l'appareil, pas une donnée patient). Applique l'attribut `data-theme` sur `<html>` et met à
  jour `<meta name="theme-color">` (barre du navigateur mobile). Hook `hooks/useTheme.ts`.
- `index.css` : bloc `html[data-theme='light']` qui surcharge **uniquement** les surfaces et le texte
  (`--color-bg/surface/surface-2/border/ink/muted`). La palette sémantique (rouge/ambre/vert/gris) reste
  identique — lisible sur les deux fonds (vérifié par capture). Spécificité > `:root` → tous les
  utilitaires Tailwind v4 (qui résolvent `var(--color-*)`) basculent automatiquement.
- `EvolutionView` : Recharts ne lit pas les var CSS → les couleurs « chrome » (grille, axes, tooltip,
  curseur) sont calquées sur le thème courant via `CHROME[theme]`. Les barres/courbes (palette
  sémantique) restent inchangées.
- `main.tsx` applique le thème mémorisé avant le premier rendu.

## Parcours d'import vérifié (bout en bout)

Testé en navigateur avec un JSON réaliste « façon Claude Web » (prose + bloc ```json, 4 repas,
11 aliments analysés, symptômes en langage naturel, transit) :
- Parsing tolérant OK (extraction malgré la prose), synonyme « fringale sucree » → `envie_sucre`,
  banane mûre classée `pro` d'après son analyse, 11 fiches FODMAP mises en cache **sans appel API**.
- Jour importé entièrement rempli (repas + symptômes + timing + transit + qualité auto).
- 🐞 **Bug corrigé** : `FoodInsightSheet` masquait une fiche en cache quand aucune clé OpenRouter
  n'était configurée. Désormais une fiche en cache (analyse IA **ou** import) est **toujours
  consultable**, la clé n'étant requise que pour (ré)analyser.
- 🐞 **Bug corrigé (v0.12.0)** : après import, le Journal du jour **déjà affiché** ne se rafraîchissait
  pas (il fallait changer de date). `useDay` est passé en réactif (`useLiveQuery`) → mise à jour
  immédiate. Cf. section v0.12.0.

## Décisions

- **Édition inline** : la carte du jour sert à la lecture ET à l'édition (toggle crayon/✓
  dans l'en-tête de carte). Le rendu lecture est identique aux maquettes.
- **Catégories d'aliments du seed** fixées explicitement pour coller pixel-près aux maquettes
  (ex. « poulet rôti » est neutre le Lundi, bénéfique le Mardi — conforme aux visuels).
- **Badge qualité** : heuristique dans `quality.ts` (≥2 sévères ⇒ difficile ; 0 sévère & ≤1 modéré
  ⇒ bonne/correcte), proposé si l'utilisateur n'a rien fixé, surchargeable par cycle au tap.
- **Corrélations conservatrices** : seuil minimal d'échantillon (3 jours actifs) avant de conclure.
- **Premier lancement** : si base vide → seed + ouverture sur la semaine de référence (09/06/2025).
- **Stepper hydratation** par pas de 0,1 L ; couleur des selles dérivée du score de Bristol.
- **IA optionnelle, jamais bloquante** : aucun appel réseau sans action explicite (bouton) +
  clé/modèle configurés. La clé OpenRouter est stockée localement (table `meta`, jamais exportée).
- **Pas de `response_format`** dans l'appel OpenRouter (mal supporté par certains modèles :free) :
  on demande du JSON strict dans le prompt et on parse en souplesse (`parseJsonLoose`), puis on
  valide/coerce chaque champ (enums → fallback `unknown`/`inconnu`).
- **Catégorie de chip dérivée de l'analyse** (`deriveCategory`) : à éviter (FODMAP élevé ou verdict
  « eviter ») ⇒ pro ; tout au vert ⇒ beneficial ; sinon neutral.

## TODO / pistes

- [x] Tests unitaires des fonctions `lib/` (classifier, aggregates, correlations, quality, dates) —
      37 tests, `npm test`. A révélé et corrigé un bug : la ligature `œ` n'était pas dépliée par
      `normalize` (`œufs` → `ufs`), désormais mappée `œ→oe` / `æ→ae`.
- [x] Code-splitting : `EvolutionView` en `React.lazy`, `recharts` en chunk dédié (`vite.config.ts`).
- [x] Dictionnaire d'aliments étendu (~80 → ~260 entrées).
- [ ] Fenêtre par défaut de l'onglet Évolution : envisager de centrer sur la dernière semaine
      contenant des données plutôt que sur `date`.
- [ ] Affiner le mapping couleur « Selles molles » pour matcher la teinte saumon de la maquette.
- [ ] Raffiner les motifs de corrélation (effet « lendemain », combinaisons d'aliments).
- [ ] Tests de composants/vues (React Testing Library) si besoin — non couverts pour l'instant.

### Suite IA — toutes livrées
- [x] **Profil santé** : questionnaire conditions / phase FODMAP / intolérances / allergies /
      aliments à éviter / notes (`ProfileSheet`). Injecté via `buildProfileContext` → `analyzeFood`.
- [x] **Aide contextuelle + tips** sur chaque écran (`HelpSheet` + `TipBanner`, registre `lib/help.ts`).
- [x] **Onboarding** au premier lancement (`Onboarding`, flag `meta.onboardingDone`, rejouable).

### Pistes restantes (optionnelles)
- [x] Analyse d'une journée entière par l'IA (`dayAnalyses`, `DayAnalysisSheet`).
- [x] Suggestions de repas adaptées (`mealSuggestions`, `MealSuggestionsSheet`).
- [x] Tests de composants (RTL/jsdom) — directive `// @vitest-environment jsdom` par fichier.
- [x] Fenêtre Évolution ancrée sur la dernière période avec données.
- [ ] (Idées futures) Tests E2E Playwright intégrés au repo ; analyse multi-jours ; partage chiffré.

## Modèle de données (résumé)

Table `days` (clé = date ISO `YYYY-MM-DD`) : `DayEntry { quality, meals[], symptoms{12 clés},
symptomTiming?, notes?, hydrationL?, stool?, digestionDelayH? }`.
Table `meta` : profil + config IA (`aiConfig`) + flag `onboardingDone` + `mealSuggestions` + `toursSeen`.
Table `foodInsights` (clé = nom normalisé, index `name`) : analyses d'aliments en cache.
Table `dayAnalyses` (clé = date) : analyses IA de journées en cache (Dexie v3).
Détails dans `src/types.ts`.

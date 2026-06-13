# CONTEXT.md — Digestor

État du projet, décisions et TODO. Mémoire de travail à tenir à jour.

## Objectif

PWA mobile-first 100 % offline : journal alimentaire + suivi des symptômes pour
candidose intestinale / SIBO / SII. Saisie jour par jour → récap hebdo → corrélations →
graphes d'évolution. Aucun backend, données locales (IndexedDB), export/import JSON.
Rendu visuel fidèle à 4 maquettes (thème sombre, chips colorées, pastilles d'intensité).

## État actuel — v0.9 (symptômes par repas, badge 3 niveaux, combobox selles, Aliments enrichi, 83 tests)

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

## Parcours d'import vérifié (bout en bout)

Testé en navigateur avec un JSON réaliste « façon Claude Web » (prose + bloc ```json, 4 repas,
11 aliments analysés, symptômes en langage naturel, transit) :
- Parsing tolérant OK (extraction malgré la prose), synonyme « fringale sucree » → `envie_sucre`,
  banane mûre classée `pro` d'après son analyse, 11 fiches FODMAP mises en cache **sans appel API**.
- Jour importé entièrement rempli (repas + symptômes + timing + transit + qualité auto).
- 🐞 **Bug corrigé** : `FoodInsightSheet` masquait une fiche en cache quand aucune clé OpenRouter
  n'était configurée. Désormais une fiche en cache (analyse IA **ou** import) est **toujours
  consultable**, la clé n'étant requise que pour (ré)analyser.

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
Table `meta` : profil + config IA (`aiConfig`) + flag `onboardingDone` + `mealSuggestions`.
Table `foodInsights` (clé = nom normalisé, index `name`) : analyses d'aliments en cache.
Table `dayAnalyses` (clé = date) : analyses IA de journées en cache (Dexie v3).
Détails dans `src/types.ts`.

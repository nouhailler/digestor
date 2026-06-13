# Prompt Claude Code — « Digestor » : journal alimentaire & symptômes (Candidose / SIBO / SII)

> Copie/colle ce brief dans Claude Code (à la racine d'un dossier vide). Nom de l'app modifiable (`Digestor`, `Candidor`, `Intestinor`…). UI **en français**.

---

## 1. Objectif

Construis une **PWA mobile-first, 100 % offline**, installable sur téléphone et **déployable sur Netlify**, qui sert de **journal alimentaire et de suivi des symptômes** pour le suivi de la **candidose intestinale**, du **SIBO** et du **SII**.

L'app permet une **saisie réelle jour par jour** (repas, symptômes, transit, notes), agrège les données en **récapitulatif hebdomadaire**, détecte des **corrélations aliment → symptôme**, et affiche des **graphiques d'évolution** dans le temps. Aucun backend : tout est stocké localement et exportable.

La présentation visuelle doit **reproduire fidèlement les maquettes** décrites en section 4 (thème sombre, chips colorées, pastilles d'intensité, cartes arrondies).

---

## 2. Stack technique (impérative)

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** (config via `@import "tailwindcss"` + `@theme`)
- **vite-plugin-pwa** (`registerType: 'autoUpdate'`, manifest + service worker, offline complet)
- **Persistance locale** : IndexedDB via **Dexie** (`dexie` + `dexie-react-hooks`). Pas de localStorage pour les données du journal (volume multi-semaines).
- **Graphiques** : **Recharts**
- **Dates** : **date-fns** (locale `fr`)
- **Icônes** : **lucide-react**
- **Aucun backend, aucune API réseau** requise au runtime. L'app doit fonctionner avion/offline.
- **Export / Import JSON** complet du journal. Export **PDF** de la semaine en bonus (via `window.print()` + feuille print CSS suffit).

Conventions de projet attendues (mon style habituel) :
- `CONTEXT.md` + `CLAUDE.md` à la racine (état du projet, décisions, modèle de données, TODO).
- `README.md` avec instructions install / dev / build / déploiement Netlify.
- Composants découpés proprement, types centralisés dans `src/types.ts`, logique métier (classification, corrélations, agrégats) isolée dans `src/lib/`.

---

## 3. Modèle de données

```ts
// src/types.ts
export type FoodCategory = 'pro' | 'beneficial' | 'neutral';
// 'pro'        => Pro-candidose / Pro-SIBO  (rouge)
// 'beneficial' => Bénéfique / Anti-fongique (vert)
// 'neutral'    => Neutre (gris)

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory; // auto-suggérée puis modifiable
}

export interface Meal {
  id: string;
  time: string;          // "07:30"
  foods: FoodItem[];
}

export type SymptomKey =
  | 'ballonnements' | 'gaz' | 'douleurs_abdo' | 'reflux'
  | 'fatigue_apres_repas' | 'envie_sucre' | 'diarrhee' | 'constipation'
  | 'brouillard_mental' | 'mycose_buccale' | 'demangeaisons' | 'nausees';

export type Intensity = 'absent' | 'leger' | 'modere' | 'severe';
// gris        | vert    | ambre   | rouge

export type DayQuality = 'difficile' | 'correcte' | 'bonne' | null; // badge auto ou manuel

export interface Stool {
  bristol?: number;      // 1..7
  count?: number;        // nb de selles
  label?: string;        // "Selles molles", "Selles normales"…
}

export interface DayEntry {
  date: string;                 // ISO "2025-06-09" — clé primaire
  quality: DayQuality;
  meals: Meal[];
  symptoms: Record<SymptomKey, Intensity>;
  symptomTiming?: string;       // ex: "2 h après repas du soir"
  notes?: string;
  hydrationL?: number;          // 1.2
  stool?: Stool;
  digestionDelayH?: number;     // 3 => "Délai digestion : ~3 h"
}

export interface Profile {
  patientName: string;          // affiché "Patient : exemple"
}
```

Stocke un `DayEntry` par date dans une table Dexie indexée par `date`. La « semaine » est calculée (lundi→dimanche) à partir d'une date courante, pas stockée.

---

## 4. Design system — à reproduire À L'IDENTIQUE des maquettes

### 4.1 Thème (sombre)
- Fond global quasi-noir `#0e0e0f`. Cartes en surface légèrement plus claire `#1c1c1e` avec bordure subtile `#2a2a2c`, coins **très arrondis** (`rounded-2xl`), padding généreux.
- Texte principal `#ececec`, texte secondaire / heures `#8a8a8e`.
- Police sans-serif système / Inter, poids 400–600, interlignage aéré.

### 4.2 Palette sémantique
| Rôle | Couleur | Usage |
|---|---|---|
| Sévère | rouge `#f0606a` | pastille intensité, chip rouge, badge « Journée difficile » |
| Modéré | ambre `#e8a13a` | pastille intensité |
| Léger | vert `#5fbf6f` | pastille intensité, chip vert, badge « Journée correcte » |
| Absent | gris `#6b6b70` | pastille intensité, chip neutre |

### 4.3 Chips aliments (pills)
`rounded-full`, fond translucide foncé, **bordure 1px colorée + texte coloré** selon la catégorie :
- `pro` → bordure/texte rouge `#f0606a` (ex. *pain blanc (2 tranches)*, *confiture*, *jus d'orange*, *vin blanc (1 verre)*, *biscuits sucrés*).
- `beneficial` → bordure/texte vert `#5fbf6f` (ex. *brocoli vapeur*, *œufs brouillés*, *ail*, *huile de coco*, *tisane de gingembre*).
- `neutral` → bordure/texte gris (ex. *café*, *poulet rôti*, *salade verte*, *quinoa (petite portion)*).
Les chips s'enroulent (`flex-wrap`).

### 4.4 Pastilles symptômes
Petit cercle plein coloré (selon intensité) + libellé. Disposés en **grille de 4 colonnes × 3 lignes** sur desktop, **2 colonnes** sur mobile, dans cet ordre exact :
```
Ballonnements        | Gaz / flatulences   | Douleurs abdominales   | Reflux / brûlures
Fatigue après repas  | Envie de sucre      | Diarrhée / selles molles | Constipation
Brouillard mental    | Mycose buccale      | Démangeaisons cutanées | Nausées
```

### 4.5 En-tête + légende (barre du haut, sticky)
- Ligne titre : « **Semaine du 9 au 15 juin 2025 — Patient : exemple** » (dates calculées, nom éditable), avec un menu `⋯` à droite (export/import/réglages).
- **Aliments :** trois chips légende → *Pro-candidose / Pro-SIBO* (rouge), *Bénéfique / Anti-fongique* (vert), *Neutre* (gris).
- **Intensité :** quatre pastilles → *Sévère* (rouge), *Modéré* (ambre), *Léger* (vert), *Absent* (gris).

### 4.6 Carte d'un jour (cf. maquettes Lundi / Mardi)
En-tête de carte : icône calendrier + « **Lundi 9 juin** », et à droite un **badge de qualité** (`Journée difficile` rouge translucide / `Journée correcte` vert).
Sections internes, chacune avec une icône lucide + titre en petites capitales :
1. 🍴 **REPAS DU JOUR** — pour chaque repas : heure (gris, petit) puis chips aliments qui s'enroulent. Repas types : ~7h30 / 12h30 / 16h00 / 19h30 (modifiables, ajout/suppression libre).
2. ✦ **SYMPTÔMES** — sous-titre optionnel entre parenthèses = `symptomTiming` (ex. *(2 H APRÈS REPAS DU SOIR)*), puis la grille de pastilles 4×3.
3. 📝 **NOTES** — encadré texte libre (cf. note exemple : « Ballonnements très importants dès 21 h, ventre gonflé comme un ballon… »).
4. 💧 **TRANSIT & HYDRATATION** — rangée de 3 chips : `1,2 L d'eau`, `Selles molles (×2)` (colorée selon état), `Délai digestion : ~3 h`.

Entre les jours : un **bouton rond flottant à flèche** (↓ / ↑) pour naviguer d'un jour à l'autre.

Reproduis fidèlement l'aspect des deux journées de référence : Lundi = journée difficile (beaucoup de chips rouges, pastilles rouges/ambre) ; Mardi = journée correcte (chips vertes, pastilles vertes/grises).

---

## 5. Écrans / fonctionnalités

### 5.1 Saisie jour par jour (le cœur — saisie réelle)
- Sélecteur/navigation de date (← jour →, + accès direct à aujourd'hui).
- **Ajout de repas** : bouton « + Repas », champ heure, puis ajout d'aliments par **chip d'entrée** : l'utilisateur tape un nom, la **catégorie est auto-suggérée** depuis le dictionnaire (section 6) et reste **modifiable d'un tap** (cycle pro→beneficial→neutral). Suppression d'un aliment/d'un repas.
- **Symptômes** : taper une pastille fait **cycler l'intensité** `absent → leger → modere → severe → absent`, la couleur suit. Champ `symptomTiming` libre.
- **Notes** : textarea.
- **Transit & hydratation** : litres d'eau (stepper), selles (label + nb + Bristol optionnel), délai digestion (heures).
- **Badge qualité** : auto-proposé d'après la sévérité agrégée des symptômes du jour (heuristique : ≥2 symptômes sévères ⇒ « difficile » ; aucun sévère & ≤1 modéré ⇒ « correcte/bonne »), **surchargé manuellement** si besoin.
- Sauvegarde automatique (Dexie, debounce).
- La **même carte** sert d'affichage (lecture) et bascule en mode édition — ou édition inline directe. Au choix, mais le rendu lecture doit être identique aux maquettes.

### 5.2 Récapitulatif de la semaine (cf. maquette 3)
Grille de **cartes-statistiques** calculées sur les 7 jours de la semaine courante, avec valeur colorée :
- **Jours difficiles** : `3 / 7` (rouge)
- **Épisodes de ballonnements sévères** : `5` (rouge) — compte les jours où `ballonnements === 'severe'`
- **Épisodes de diarrhée** : `4` (ambre)
- **Jours sans sucre ajouté** : `4 / 7` (vert) — jour sans aucun aliment `pro` de type sucre/alcool
- **Hydratation moy. / jour** : `1,6 L` (vert)
- **Score énergie moy.** : `5 / 10` (ambre) — dérivé inverse de `fatigue_apres_repas` + `brouillard_mental`

Puis un encadré « **Corrélations identifiées cette semaine** » : liste à pastilles (cf. 5.4).

### 5.3 Graphiques d'évolution (Recharts)
Vue dédiée « Évolution » avec, sur une plage glissante (semaine / 4 semaines / tout) :
- **Sévérité globale par jour** (aire ou barres empilées par intensité) → repérer les bons/mauvais jours.
- **Tendance hydratation** (ligne) avec ligne-cible 1,5 L.
- **Fréquence des catégories d'aliments** par jour (barres empilées pro/beneficial/neutral) superposable visuellement à la sévérité → faire ressortir le lien « plus de rouge ⇒ plus de symptômes ».
- **Top symptômes** sur la période (barres horizontales, par fréquence pondérée par intensité).
Couleurs des graphes = palette sémantique de 4.2. Tooltips en français, dates `date-fns` locale `fr`.

### 5.4 Détection de corrélations (heuristique, lib dédiée)
`src/lib/correlations.ts` : sur la fenêtre choisie, génère des phrases lisibles « **Aliment/combinaison → symptôme (délai)** ». Logique simple et transparente (pas de stats lourdes) :
- Pour chaque catégorie/aliment fréquent, mesurer la co-occurrence **même jour** avec symptômes sévères/modérés, et un effet « lendemain » optionnel.
- Détecter quelques motifs cextiles attendus, ex. :
  - *Sucre + alcool → ballonnements sévères dans les 2 h* (rouge)
  - *Pain blanc le matin → envie compulsive de sucre l'après-midi* (rouge)
  - *Quinoa et patate douce → ballonnements légers tolérables* (ambre)
  - *Ail + gingembre → digestion plus confortable* (vert)
  - *Jours sans céréales → 0 ballonnement sévère* (gris)
- Chaque corrélation porte une pastille de couleur selon qu'elle est défavorable (rouge), à surveiller (ambre) ou favorable (vert).
- **N'invente pas** de corrélation non soutenue par les données saisies ; si l'échantillon est trop faible, afficher « Pas encore assez de données ».

### 5.5 Référence : symptômes discriminants (cf. maquette 4)
Écran/onglet statique « Repères » avec un tableau **deux colonnes Candidose / SIBO-SII** :

| Candidose | SIBO / SII |
|---|---|
| Envie compulsive de sucre | Ballonnements dans les 1-2 h après repas |
| Démangeaisons, mycoses | Gaz excessifs (surtout hydrogène = SIBO H2) |
| Brouillard mental persistant | Alternance diarrhée / constipation |
| Fatigue chronique | Selles mal formées (Bristol 6-7 ou 1-2) |
| Enduit lingual blanc | Douleurs qui soulagent après évacuation |

### 5.6 Navigation
Barre d'onglets basse (mobile) : **Journal** (saisie/jours) · **Semaine** (récap) · **Évolution** (graphes) · **Repères**. Navigation semaine précédente/suivante dans Journal & Semaine.

---

## 6. Dictionnaire de classification des aliments

`src/lib/foodClassifier.ts` : table d'environ 60–100 aliments français → catégorie, avec normalisation (minuscule, sans accents, correspondance partielle) pour l'auto-suggestion. À étendre facilement.

- **`pro` (rouge — pro-candidose / pro-SIBO)** : sucres raffinés, confiture, miel en excès, pâtisseries, biscuits, pain blanc / farines blanches, pâtes blanches, riz blanc, jus de fruits, fruits très sucrés, yaourt/laitage sucré, alcool (vin, bière), boissons sucrées, levures (pain industriel, bière), féculents en grande quantité, sirop, sodas.
- **`beneficial` (vert — bénéfique / anti-fongique)** : ail, gingembre, huile de coco, légumes non amidonnés (brocoli, courgette, épinard, salade…), protéines animales non transformées (poulet, poisson, œufs), herbes aromatiques, vinaigre de cidre, oléagineux (amandes en petite quantité), avocat, huile d'olive, tisanes.
- **`neutral` (gris)** : café/thé nature, quinoa, patate douce, légumineuses modérées, riz complet (portion modérée), aliments non classés.

La catégorie reste **toujours surchargeable** par l'utilisateur (le classement est indicatif).

---

## 7. PWA + Netlify

**PWA :**
- `manifest` : `name`/`short_name` (Digestor), `display: standalone`, `orientation: portrait`, `theme_color: #0e0e0f`, `background_color: #0e0e0f`, icônes 192/512 + **maskable** (génère des icônes SVG→PNG simples, motif intestin/feuille stylisé sur fond sombre).
- Service worker `autoUpdate`, **precache de l'app shell**, fonctionnement **100 % offline**.
- Mobile-first : cibles tactiles ≥ 44px, gestion des `env(safe-area-inset-*)` (encoche), pas de scroll horizontal.
- Invite d'installation A2HS discrète.

**Netlify :**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```
README : `npm i` → `npm run dev` → `npm run build`, puis déploiement Netlify (drag&drop `dist` ou liaison Git).

---

## 8. Données d'exemple (seed)

Au premier lancement (base vide), pré-remplis **la semaine du 9 au 15 juin 2025** avec **Lundi** et **Mardi** exactement conformes aux maquettes (mêmes repas, mêmes chips et couleurs, mêmes symptômes/intensités, mêmes notes, transit, délais), pour que l'app s'ouvre déjà sur le rendu de référence. Bouton « Réinitialiser les données de démo » dans le menu `⋯`.

---

## 9. Avertissement médical (obligatoire)

Inclure un encart/écran « À propos » précisant : outil de **suivi et de repérage de tendances**, **pas un dispositif de diagnostic** ; le SIBO se confirme par test respiratoire, le SII par critères cliniques (Rome IV) ; l'hypothèse de candidose **systémique** chronique reste débattue en médecine (la candidose intestinale localisée, elle, est reconnue) ; **consulter un médecin / gastro-entérologue** pour toute interprétation. Données **stockées uniquement sur l'appareil**.

---

## 10. Livrables attendus
1. Projet Vite complet qui build sans erreur, PWA installable, offline OK.
2. Rendu visuel **fidèle aux 4 maquettes**.
3. Saisie réelle persistée (Dexie), récap hebdo calculé, corrélations, graphes d'évolution.
4. `CONTEXT.md`, `CLAUDE.md`, `README.md`, `netlify.toml`.
5. Seed Lundi/Mardi conforme.

Commence par proposer l'arborescence des fichiers et le `types.ts`, puis implémente écran par écran. Demande-moi confirmation seulement si une ambiguïté bloque ; sinon, déroule.

# Digestor

**Journal alimentaire & suivi des symptômes** pour la candidose intestinale, le SIBO et le SII.
PWA mobile-first, **100 % hors-ligne**, installable sur téléphone, déployable sur Netlify.
Toutes les données restent **sur l'appareil** (IndexedDB) — aucun backend, aucune API réseau.

> Dépôt : https://github.com/nouhailler/digestor

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/nouhailler/digestor)

## Fonctionnalités

- **Journal** — saisie réelle jour par jour : repas (chips d'aliments auto-classés rouge/vert/gris,
  catégorie modifiable d'un tap) avec **une zone de symptômes par repas** (pastilles d'intensité),
  notes, transit & hydratation (sélecteur de selles sur l'échelle de Bristol). Badge « qualité de
  journée » **vert → orange → rouge** selon le cumul de symptômes, surchargeable. Infobulles d'aide
  au survol. Sauvegarde automatique (debounce).
- **Semaine** — **agenda cliquable** des 7 jours (couleur = qualité de la journée, clic → ouvre le
  jour dans le Journal) + récapitulatif calculé en direct sur 7 jours (jours difficiles, ballonnements
  sévères, diarrhée, jours sans sucre ajouté, hydratation moyenne, score énergie) + **corrélations**.
- **Évolution** — graphes Recharts (sévérité par jour, hydratation vs cible 1,5 L,
  catégories d'aliments par jour, top symptômes) sur semaine / 4 semaines / tout.
- **Aliments** *(IA, optionnel)* — analyse d'un aliment via OpenRouter : niveau FODMAP global et par
  groupe (fructose, lactose, fructanes, GOS, polyols), verdicts SIBO et candidose, portion tolérée,
  synthèse et conseils. Analyses mises en cache localement ; accessibles aussi en tapant une chip
  d'aliment dans le journal. Liste **tous les aliments de vos repas** (analysés ou non), avec
  **analyse en masse** des non-analysés, recherche **combobox** (préfixe à partir de 3 lettres),
  réanalyse et suppression par aliment. Bouton **« Idées de repas adaptées »** selon le profil.
- **Analyse de journée** *(IA, optionnel)* — bouton « Analyser ma journée » sous la carte : verdict
  global, déclencheurs probables, pistes d'amélioration (mis en cache par date).
- **Repères / encyclopédie** — tableau des symptômes discriminants Candidose vs SIBO/SII ;
  chaque symptôme est **cliquable** pour une fiche détaillée (origine, manifestation, effets, conseils,
  générée par l'IA et mise en cache). Bouton **« Plus d'informations »** : encyclopédie des symptômes
  digestifs classés par catégorie, **enrichissable par l'IA**. + avertissement médical.
- **Profil santé** *(menu ⋯)* — conditions/diagnostics, phase FODMAP, intolérances, allergies,
  aliments à éviter. Pris en compte par l'IA lors des analyses d'aliments (allergies signalées en priorité).
- **Entrer un repas (voix → JSON)** *(menu ⋯)* — dictez votre journée à Claude Web, collez le JSON
  généré : prévisualisation puis import (ajout ou remplacement). Le JSON peut inclure, **par aliment**,
  sa fiche FODMAP/SIBO/candidose (mise en cache sans appel d'API, même pour des aliments inconnus de
  Digestor) et, **par jour**, les symptômes, le transit et l'hydratation. Voir
  [`docs/claude-web-repas-prompt.md`](./docs/claude-web-repas-prompt.md). 100 % local, sans clé API.
- **Aide & tips** — bouton `?` dans l'en-tête pour l'aide de l'écran courant, astuces contextuelles,
  et **visite guidée** au premier lancement (rejouable via le menu).
- **Export / Import JSON** complet, **export PDF** de la semaine (impression).

## Assistant IA (OpenRouter) — optionnel

L'analyse d'aliments utilise [OpenRouter](https://openrouter.ai). Pour l'activer :

1. Créez une clé sur https://openrouter.ai/keys.
2. Menu `⋯` → **Assistant IA (OpenRouter)** → collez la clé.
3. **Rechercher les modèles gratuits (:free)** → sélectionnez un modèle.
4. Onglet **Aliments** (ou tap sur une chip dans le journal) → **Analyser avec l'IA**.

La clé est **stockée uniquement sur l'appareil** et n'est envoyée qu'à OpenRouter ; elle n'est pas
incluse dans l'export JSON. Sans clé/modèle, ou hors-ligne, l'app reste pleinement utilisable :
seules les analyses IA sont indisponibles.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · Dexie (IndexedDB) · Recharts · date-fns (fr) ·
lucide-react · vite-plugin-pwa.

## Démarrage

```bash
npm install      # installer les dépendances
npm run dev      # serveur de dev (http://localhost:5173)
npm run build    # build de production (typecheck + bundle dans dist/)
npm run preview  # prévisualiser le build
npm test         # tests unitaires + composants (Vitest)
```

Au premier lancement (base vide), l'app pré-remplit **Lundi 9 et Mardi 10 juin 2025**
(données de démo conformes aux maquettes). Bouton « Données de démo » dans le menu `⋯`
pour réinitialiser.

## Déploiement Netlify

Le fichier [`netlify.toml`](./netlify.toml) est déjà configuré (build `npm run build`,
publish `dist`, redirect SPA, Node 20).

- **Drag & drop** : `npm run build` puis glisser le dossier `dist/` sur Netlify.
- **Git** : connecter le dépôt ; Netlify détecte `netlify.toml` automatiquement.

## Avertissement médical

Digestor est un outil de **suivi et de repérage de tendances**, **pas un dispositif de diagnostic**.
Le SIBO se confirme par test respiratoire, le SII par critères cliniques (Rome IV) ;
l'hypothèse d'une candidose *systémique* chronique reste débattue. Consultez un
médecin / gastro-entérologue pour toute interprétation. Voir l'écran « À propos ».

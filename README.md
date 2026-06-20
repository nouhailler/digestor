<div align="center">

# 🌿 Digestor

**Journal alimentaire & suivi des symptômes** pour la candidose intestinale, le SIBO et le SII.
PWA mobile-first, **100 % hors-ligne**, installable sur téléphone, déployable sur Netlify.

[![CI](https://github.com/nouhailler/digestor/actions/workflows/ci.yml/badge.svg)](https://github.com/nouhailler/digestor/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-5fbf6f.svg)](./LICENSE)
![PWA](https://img.shields.io/badge/PWA-offline-0e0e0f?logo=pwa)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=000)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=fff)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=fff)
![Tests](https://img.shields.io/badge/tests-130%20✓-5fbf6f)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/nouhailler/digestor)

🔒 Toutes les données restent **sur l'appareil** (IndexedDB) — aucun backend, aucune API réseau obligatoire.

</div>

## 📸 Aperçu

<table>
  <tr>
    <td align="center"><b>📓 Journal</b><br><img src="docs/screenshots/journal.png" width="220" alt="Journal"></td>
    <td align="center"><b>🗓️ Semaine</b><br><img src="docs/screenshots/semaine.png" width="220" alt="Semaine"></td>
    <td align="center"><b>📈 Évolution</b><br><img src="docs/screenshots/evolution.png" width="220" alt="Évolution"></td>
  </tr>
  <tr>
    <td align="center"><b>🍎 Aliments</b><br><img src="docs/screenshots/aliments.png" width="220" alt="Aliments"></td>
    <td align="center"><b>🩺 Repères</b><br><img src="docs/screenshots/reperes.png" width="220" alt="Repères"></td>
    <td></td>
  </tr>
</table>

## ✨ Fonctionnalités

- 📓 **Journal** — saisie jour par jour : repas (chips d'aliments auto-classés 🔴/🟢/⚪, catégorie
  modifiable d'un tap ; **une fois analysée par l'IA, la chip prend dynamiquement la couleur de sa
  sévérité FODMAP** 🔴 élevé / 🟠 modéré / 🟢 bas) avec **une zone de symptômes par repas** (pastilles
  d'intensité), notes,
  transit & hydratation (sélecteur de selles sur l'échelle de Bristol). **Autocomplétion** des
  aliments déjà saisis (dès 3 lettres) pour éviter les doublons d'orthographe, **favoris (★)
  proposés en tête**. **Quantité par aliment** (càc, càs, portion, g, ml…) qui pondère l'analyse.
  Badge « qualité de journée » 🟢→🟠→🔴 selon le cumul de symptômes, surchargeable. Infobulles
  d'aide. Sauvegarde auto.
- 🗓️ **Semaine** — **agenda cliquable** des 7 jours (couleur = qualité, clic → ouvre le jour) +
  récapitulatif calculé en direct (jours difficiles, ballonnements sévères, diarrhée, jours sans sucre
  ajouté, hydratation moyenne, score énergie) + **corrélations** aliment → symptôme. **Corrélations
  personnalisées** calculées sur tout l'historique : déclencheurs suspectés (taux de symptôme les jours
  « avec » vs « sans ») et aliments fréquents bien tolérés — détection conservatrice, jamais inventée.
- 📈 **Évolution** — graphes (sévérité par jour, hydratation vs cible 1,5 L, catégories d'aliments,
  top symptômes) sur semaine / 4 semaines / tout.
- 🍎 **Aliments** *(IA, optionnel)* — analyse FODMAP (global + par groupe), verdicts SIBO & candidose,
  portion tolérée, conseils. **Catalogue de ~267 aliments**, **analyse en masse**, recherche combobox
  (préfixe ≥ 3 lettres), **idées de repas adaptées** (ajoutables au journal). Un aliment en cours
  d'analyse **remonte en haut de la liste** (badge « Génération… ») le temps de sa génération.
- 📷 **Scanner un produit** *(code-barres)* — visez le code-barres d'un produit emballé (caméra, ou
  saisie manuelle en secours) → recherche **Open Food Facts** (base libre, sans clé) → nom + marque +
  ingrédients → analyse FODMAP / SIBO / candidose, pour savoir d'un coup d'œil si un produit acheté est
  déconseillé. `BarcodeDetector` natif quand il existe, sinon `@zxing/browser` chargé à la demande
  (iPhone/Safari). Seul le code-barres est envoyé au réseau.
- ⭐ **Favoris** — marquez vos aliments habituels d'une étoile : ils sont **proposés en premier** quand
  vous remplissez un repas. Un produit **scanné devient automatiquement favori** (avec sa date de scan).
  Onglet « Favoris » dans l'écran Aliments pour tout voir, ajouter ou retirer.
- 🩺 **Repères / encyclopédie** — symptômes discriminants Candidose vs SIBO/SII ; chaque symptôme est
  **cliquable** pour une fiche détaillée (origine, manifestation, effets, conseils). **« Plus
  d'informations »** : encyclopédie classée par catégorie, **enrichissable par l'IA**.
- 🫀 **Système digestif** *(illustré)* — guide hors-ligne du tube digestif : planche anatomique annotée
  (Wikimedia, domaine public), transit étape par étape (durées + rôle des organes), et schéma du
  **microbiote** (équilibre vs dysbiose, lien avec SIBO & Candida). Chaque étape du transit est
  **cliquable** → fiche d'organe (image, rôle, pathologies fréquentes) avec **approfondissement IA**.
- 🧠 **Analyse de journée** *(IA)* — verdict global, déclencheurs probables, pistes d'amélioration
  **justifiées** (chaque recommandation explique le bénéfice recherché). Tient compte des **fiches
  d'aliments déjà analysées** (niveau FODMAP, verdicts SIBO/candida) injectées dans le prompt.
- ⏳ **Analyses IA en arrière-plan** — une analyse lancée **continue même si vous changez d'écran** ;
  un indicateur global dans l'en-tête (sablier + secondes, puis ✓ vert) montre l'activité en cours.
- 👤 **Profil santé** — âge, sexe, conditions, phase FODMAP, intolérances, allergies, antécédents,
  médicaments (champs facultatifs) ; pris en compte par l'IA (allergies signalées en priorité).
- 💊 **Traitements & compléments** — suivez vos cures (antifongiques, antibiotiques, probiotiques,
  phytothérapie, compléments…) avec dose, fréquence et dates (en cours / terminé) ; reprises dans le
  dossier médical.
- 🧪 **Réintroductions FODMAP** — testez **un aliment d'un groupe à la fois**, notez le verdict
  (toléré / limité / non toléré) et un journal des doses : l'outil de la phase de réintroduction.
- 🎙️ **Entrer un repas (voix → JSON)** — dictez votre journée à Claude Web, collez le JSON généré
  (repas + fiches FODMAP + symptômes + transit). Voir [`docs/claude-web-repas-prompt.md`](./docs/claude-web-repas-prompt.md).
- 🩺 **Dossier médical** *(imprimable)* — synthèse complète du journal (profil santé, période couverte,
  fréquence & sévérité des symptômes, transit & hydratation, aliments les plus fréquents et défavorables,
  corrélations, journal détaillé) à **imprimer ou exporter en PDF** pour la remettre à un médecin.
- 🎨 **Apparence** — thème **sombre** (défaut) ou **clair** (Menu → « Apparence »), mémorisé par appareil.
- 💡 **Aide & onboarding** — bouton `?` par écran, astuces contextuelles, visite guidée au 1er lancement.
- 💾 **Export / Import JSON** complet, **export PDF** de la semaine.

## 🤖 Assistant IA (OpenRouter) — optionnel

L'IA est **facultative** : le cœur de l'app fonctionne sans elle. Pour l'activer :

1. Créez une clé sur <https://openrouter.ai/keys>.
2. Menu `⋯` → **Assistant IA (OpenRouter)** → collez la clé.
3. **Rechercher les modèles gratuits (:free)** → sélectionnez-en un.
4. Onglet **Aliments** (ou tap sur une chip) → **Analyser avec l'IA**.

La clé est **stockée uniquement sur l'appareil**, envoyée uniquement à OpenRouter, jamais incluse
dans l'export. Hors-ligne ou sans clé, seules les analyses IA sont indisponibles.

## 🧱 Stack

`Vite` · `React 19` · `TypeScript` (strict) · `Tailwind CSS v4` · `Dexie` (IndexedDB) · `Recharts` ·
`date-fns` (fr) · `lucide-react` · `vite-plugin-pwa` · tests `Vitest` + Testing Library.

## 🚀 Démarrage

```bash
npm install      # dépendances
npm run dev      # serveur de dev (http://localhost:5173)
npm run build    # build de production (typecheck + bundle → dist/)
npm run preview  # prévisualiser le build
npm test         # tests unitaires + composants (Vitest)
```

Au premier lancement, l'app pré-remplit **Lundi 9 et Mardi 10 juin 2025** (données de démo).
Bouton « Données de démo » dans le menu `⋯` pour réinitialiser.

## ☁️ Déploiement Netlify

[`netlify.toml`](./netlify.toml) est prêt (`npm run build`, publish `dist`, redirect SPA, Node 20).

- **Git** : Netlify → *Import from Git* → `nouhailler/digestor` (détection auto).
- **Bouton** : « Deploy to Netlify » ci-dessus.
- **Drag & drop** : `npm run build` puis glisser `dist/` sur Netlify.

## ⚠️ Avertissement médical

Digestor est un outil de **suivi et de repérage de tendances**, **pas un dispositif de diagnostic**.
Le SIBO se confirme par test respiratoire, le SII par critères cliniques (Rome IV) ; l'hypothèse
d'une candidose *systémique* chronique reste débattue. Consultez un médecin / gastro-entérologue
pour toute interprétation. Voir l'écran « À propos ».

## 📄 Licence

[MIT](./LICENSE) © 2026 Patrick Nouhailler

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
![Tests](https://img.shields.io/badge/tests-92%20✓-5fbf6f)

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
  modifiable d'un tap) avec **une zone de symptômes par repas** (pastilles d'intensité), notes,
  transit & hydratation (sélecteur de selles sur l'échelle de Bristol). Badge « qualité de journée »
  🟢→🟠→🔴 selon le cumul de symptômes, surchargeable. Infobulles d'aide au survol. Sauvegarde auto.
- 🗓️ **Semaine** — **agenda cliquable** des 7 jours (couleur = qualité, clic → ouvre le jour) +
  récapitulatif calculé en direct (jours difficiles, ballonnements sévères, diarrhée, jours sans sucre
  ajouté, hydratation moyenne, score énergie) + **corrélations** aliment → symptôme.
- 📈 **Évolution** — graphes (sévérité par jour, hydratation vs cible 1,5 L, catégories d'aliments,
  top symptômes) sur semaine / 4 semaines / tout.
- 🍎 **Aliments** *(IA, optionnel)* — analyse FODMAP (global + par groupe), verdicts SIBO & candidose,
  portion tolérée, conseils. **Catalogue de ~267 aliments**, **analyse en masse**, recherche combobox
  (préfixe ≥ 3 lettres), **idées de repas adaptées** (ajoutables au journal).
- 🩺 **Repères / encyclopédie** — symptômes discriminants Candidose vs SIBO/SII ; chaque symptôme est
  **cliquable** pour une fiche détaillée (origine, manifestation, effets, conseils). **« Plus
  d'informations »** : encyclopédie classée par catégorie, **enrichissable par l'IA**.
- 🧠 **Analyse de journée** *(IA)* — verdict global, déclencheurs probables, pistes d'amélioration.
- ⏳ **Analyses IA en arrière-plan** — une analyse lancée **continue même si vous changez d'écran** ;
  un indicateur global dans l'en-tête (sablier + secondes, puis ✓ vert) montre l'activité en cours.
- 👤 **Profil santé** — âge, sexe, conditions, phase FODMAP, intolérances, allergies, antécédents,
  médicaments (champs facultatifs) ; pris en compte par l'IA (allergies signalées en priorité).
- 🎙️ **Entrer un repas (voix → JSON)** — dictez votre journée à Claude Web, collez le JSON généré
  (repas + fiches FODMAP + symptômes + transit). Voir [`docs/claude-web-repas-prompt.md`](./docs/claude-web-repas-prompt.md).
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

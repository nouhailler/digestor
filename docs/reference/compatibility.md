# Compatibilité

## Plateformes

| Plateforme | Application | Installation PWA | Scan caméra | Remarques |
|---|---|---|---|---|
| **Android — Chrome / Edge** | ✅ | ✅ (bannière ou menu) | ✅ (`BarcodeDetector` natif) | Configuration la mieux servie |
| **iOS / iPadOS — Safari** | ✅ | ✅ (*Partager → Sur l'écran d'accueil*) | ✅ (bibliothèque chargée à la demande) | Éviction du stockage plus fréquente |
| **iOS — Chrome / Firefox** | ✅ | ❌ | ⚠️ `À vérifier` | L'installation PWA passe obligatoirement par Safari |
| **Desktop — Chrome / Edge** | ✅ | ✅ | ✅ si webcam | — |
| **Desktop — Firefox** | ✅ | ❌ | ⚠️ `À vérifier` | Utilisable dans le navigateur |
| **Desktop — Safari** | ⚠️ `À vérifier` | ⚠️ `À vérifier` | ⚠️ `À vérifier` | Non vérifié |

> Les cases marquées `À vérifier` n'ont pas été validées sur ces configurations ; elles
> ne sont pas déclarées compatibles pour autant.

## Exigences techniques

| Exigence | Détail |
|---|---|
| **HTTPS** | Obligatoire pour le service worker (hors ligne) et pour la caméra |
| **IndexedDB** | Obligatoire — c'est le stockage des données |
| **JavaScript** | Obligatoire |
| **Service worker** | Nécessaire au fonctionnement hors ligne ; l'application marche sans, mais seulement en ligne |

## Fonctions dépendantes du navigateur

| Fonction | API utilisée | Repli |
|---|---|---|
| Lecture de code-barres | `BarcodeDetector` natif | Bibliothèque `@zxing/browser` chargée à la demande |
| Accès caméra | `getUserMedia` | Saisie manuelle du code-barres |
| Partage d'une analyse | Feuille de partage native (*Web Share*) | Copie dans le presse-papiers |
| Stockage persistant | `navigator.storage.persist()` | Fonctionne sans, avec un risque d'éviction accru |
| Invite d'installation | `beforeinstallprompt` | Installation par le menu du navigateur |
| Préférence de thème et bandeaux | `localStorage` / `sessionStorage` | Le thème s'applique pour la session sans être mémorisé |

## Modes de navigation

| Mode | Comportement |
|---|---|
| **Navigation normale** | Nominal |
| **Navigation privée** | Fonctionne, mais les données sont perdues à la fermeture de la session — **déconseillé** |
| **Blocage strict du stockage** | L'application peut échouer au démarrage (bandeau d'erreur) |

## Environnement de build

Ces informations concernent le développement, pas l'usage courant.

| Élément | Version |
|---|---|
| Node.js (CI et Netlify) | 20 |
| React | 19 |
| Vite | 6 |
| TypeScript | 5.7 (mode strict) |
| Tailwind CSS | 4 |

## Voir aussi

- [Limites connues](limitations.md)
- [Bien démarrer — installation](../getting-started/index.md#installation-pwa)

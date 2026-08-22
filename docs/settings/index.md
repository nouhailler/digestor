# Paramètres

Digestor expose peu de réglages : l'essentiel de son comportement découle de vos
données. Cette page décrit **tous** les paramètres accessibles à l'utilisateur.

Vue synthétique : [Référence des paramètres](../reference/settings.md).

## Assistant IA (OpenRouter)

**Accès** : Menu `⋯` → **Assistant IA (OpenRouter)**.

### Clé API OpenRouter

| | |
|---|---|
| **Identifiant interne** | `aiConfig.apiKey` |
| **Type** | Texte masqué (champ mot de passe) |
| **Valeur par défaut** | vide |
| **Valeurs possibles** | Une clé OpenRouter, de la forme `sk-or-v1-…` |
| **Effet** | Active les fonctions IA. Sans elle, aucune requête n'est émise |
| **Application** | Immédiate (bouton **OK**, ou automatiquement lors d'une recherche de modèles réussie) |
| **Stockage** | Table `meta`, clé `aiConfig` (IndexedDB, local) |
| **Interactions** | Sans **modèle** sélectionné, l'IA reste inactive |
| **Réinitialisation** | Videz le champ et validez |

> 🔒 La clé **n'est jamais incluse dans la sauvegarde JSON** et n'est envoyée qu'à
> `openrouter.ai`. Voir [Données et confidentialité](../data/index.md).

### Modèle

| | |
|---|---|
| **Identifiant interne** | `aiConfig.modelId` |
| **Type** | Sélection dans une liste |
| **Valeur par défaut** | aucun (`null`) |
| **Valeurs possibles** | Les modèles **gratuits** renvoyés par OpenRouter (suffixe `:free` ou tarif nul), triés par nom |
| **Effet** | Modèle utilisé pour toutes les analyses |
| **Application** | Immédiate |
| **Stockage** | Table `meta`, clé `aiConfig` |
| **Interactions** | La recherche de modèles nécessite une clé saisie |
| **Réinitialisation** | Sélectionnez un autre modèle |

**Procédure** : saisissez la clé → **Rechercher les modèles gratuits (:free)** →
touchez un modèle. Le modèle actif est rappelé en bas de la feuille.

> Le modèle choisi **est** restauré par un import JSON ; la clé, non.

## Profil santé

**Accès** : Menu `⋯` → **Profil santé**. Onze champs, tous facultatifs sauf le nom
(qui retombe sur `exemple` s'il est vide).

Détail complet : [Profil santé](../features/profil-sante.md).
**Application** : à l'enregistrement. **Stockage** : `meta` → `profile`.
**Réinitialisation** : videz les champs et enregistrez.

## Apparence

| | |
|---|---|
| **Nom** | Apparence — **Sombre** / **Clair** |
| **Identifiant interne** | `digestor-theme` |
| **Type** | Sélection (2 valeurs) |
| **Valeur par défaut** | `dark` (sombre) |
| **Effet** | Change les surfaces et le texte ; la palette sémantique reste identique |
| **Application** | Immédiate |
| **Stockage** | `localStorage` (préférence d'appareil, **non exportée**) |
| **Réinitialisation** | Rechoisissez **Sombre** |

## Légende des couleurs (repliée / dépliée)

| | |
|---|---|
| **Nom** | Bouton « Légende des couleurs » de l'en-tête |
| **Identifiant interne** | `digestor-legend-open` |
| **Type** | Booléen |
| **Valeur par défaut** | Repliée |
| **Application** | Immédiate |
| **Stockage** | `localStorage` (préférence d'appareil, non exportée) |

## Aide et visites guidées

| Paramètre | Identifiant | Type | Défaut | Stockage |
|---|---|---|---|---|
| Tutoriel de bienvenue vu | `onboardingDone` | Booléen | `false` | `meta` — **exporté** dans les réglages |
| Visites guidées vues | `toursSeen` | Liste d'écrans | `[]` | `meta` — non exporté |

**Réinitialisation** : Menu `⋯` → **Revoir le tutoriel & les visites guidées** (remet les
deux à zéro).

## Bandeaux

| Paramètre | Identifiant | Type | Portée | Effet |
|---|---|---|---|---|
| Invite d'installation masquée | `digestor-a2hs-dismissed` | Booléen | `localStorage`, permanent | La bannière « Installer Digestor » ne revient plus |
| Rappel de sauvegarde masqué | `digestor-backup-reminder-dismissed` | Booléen | `sessionStorage`, la session | Le bandeau revient au prochain lancement |
| Date du dernier export | `lastExportAt` | Date ISO | `meta` | Déclenche le rappel au-delà de **7 jours** |

**Réinitialisation** : effacer les données du site remet les bandeaux à zéro (⚠️ cela
efface aussi le journal).

## Réglages d'écran (non persistés)

Ces choix reviennent à leur valeur par défaut au prochain lancement.

| Écran | Réglage | Valeurs | Défaut |
|---|---|---|---|
| Évolution | Plage | Semaine · 4 semaines · Tout | **4 semaines** |
| Aliments | Portée | De mes repas · Catalogue · Favoris | **Catalogue** |
| Aliments | Panneau des doublons | Ouvert / fermé | Fermé |
| Repères | Sous-onglet | Repères · Encyclopédie · Système digestif | **Repères** |
| Import de repas | Mode de fusion | Ajouter · Remplacer | **Ajouter** |

## Ce qui n'est pas paramétrable

- Les **seuils de corrélation** (fixés dans le code — voir [Corrélations](../features/correlations.md)).
- La **fenêtre de récurrence** des aliments (30 jours).
- Les **checkpoints de satiété** (immédiat, +1 h, +2 h, +3 h).
- Le **délai du rappel de sauvegarde** (7 jours).
- Les **notifications** : il n'y en a aucune.

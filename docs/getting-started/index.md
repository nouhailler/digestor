# Bien démarrer

## Présentation

Digestor est une **PWA** (application web installable). Elle s'ouvre dans un
navigateur, puis peut être ajoutée à l'écran d'accueil pour se comporter comme une
application native : plein écran, icône, démarrage hors connexion.

Il n'y a **ni compte, ni inscription, ni serveur**. À la première ouverture, la base
locale est créée dans le navigateur (IndexedDB) et deux journées de démonstration
sont chargées pour que l'écran ne soit pas vide.

## Compatibilité

| Plateforme | Statut | Remarques |
|---|---|---|
| Android — Chrome / Edge | Supporté | Installation par bannière ou menu du navigateur |
| iOS / iPadOS — Safari | Supporté | Installation par « Partager → Sur l'écran d'accueil » |
| Desktop — Chrome / Edge | Supporté | Installation par l'icône dans la barre d'adresse |
| Desktop — Firefox | Fonctionne dans le navigateur | Pas d'installation PWA native |

Détails et limites : [Compatibilité](../reference/compatibility.md).

## Installation PWA

### Android (Chrome, Edge)

1. Ouvrez l'adresse de Digestor dans le navigateur.
2. Une bannière **« Installer Digestor sur votre téléphone ? »** apparaît en bas de
   l'écran → touchez **Installer**.
3. Si vous l'avez fermée : menu `⋮` du navigateur → **Installer l'application** /
   **Ajouter à l'écran d'accueil**.
4. **Lancement** : icône Digestor sur l'écran d'accueil.
5. **Désinstallation** : appui long sur l'icône → **Désinstaller**. ⚠️ Cela supprime
   aussi les données locales — [sauvegardez d'abord](../features/sauvegarde-restauration.md).

> La bannière interne de Digestor ne s'affiche que si le navigateur propose
> l'installation (événement `beforeinstallprompt`). Si vous la fermez avec la croix,
> elle ne revient plus sur cet appareil (choix mémorisé dans `localStorage`).

### iOS / iPadOS (Safari)

1. Ouvrez Digestor dans **Safari** (l'installation n'est pas possible depuis Chrome iOS).
2. Bouton **Partager** → **Sur l'écran d'accueil** → **Ajouter**.
3. L'app s'ouvre ensuite en plein écran, sans barre d'adresse.

Limites iOS connues : voir [Limites connues](../reference/limitations.md).

### Desktop (Chrome, Edge)

1. Ouvrez Digestor.
2. Cliquez sur l'icône d'installation dans la barre d'adresse, ou menu → **Installer**.
3. **Désinstallation** : depuis la fenêtre de l'app, menu `⋮` → **Désinstaller**.

## Premier lancement

```
Premier lancement
    ↓
Création de la base locale + chargement des 2 journées de démo
    ↓
Demande de stockage persistant (silencieuse)
    ↓
Tutoriel de bienvenue (6 écrans)
    ↓
Écran Journal, positionné sur la 1re journée de démo
    ↓
Visite guidée de l'écran Journal (bulles ancrées)
```

| Étape | Ce qui s'affiche | Ce que vous faites | Si vous passez |
|---|---|---|---|
| Base locale | « Chargement de Digestor… » | Rien | — |
| Stockage persistant | Rien (silencieux) | Rien | Le navigateur peut refuser ; voir [Données](../data/index.md) |
| Tutoriel | 6 écrans : bienvenue, saisie, tendances, IA, boîte à outils, confidentialité | **Suivant** / **Passer** | Marqué comme vu ; rejouable depuis le menu |
| Visite guidée | Bulles ancrées aux éléments de l'écran | **Suivant** / fermer | Marquée comme vue pour cet écran |

Le tutoriel et les visites guidées se rejouent depuis
**Menu `⋯` → Revoir le tutoriel & les visites guidées**.

## Configuration initiale

Rien n'est obligatoire. Dans l'ordre d'utilité :

1. **Profil santé** (Menu `⋯` → *Profil santé*) — au minimum votre nom d'affichage ;
   idéalement intolérances et allergies, qui sont transmises à l'IA quand vous
   l'utilisez. Voir [Profil santé](../features/profil-sante.md).
2. **Assistant IA** (Menu `⋯` → *Assistant IA (OpenRouter)*) — **optionnel**. Sans
   clé, toutes les fonctions non‑IA restent disponibles. Voir
   [Paramètres](../settings/index.md#assistant-ia-openrouter).
3. **Thème** (Menu `⋯` → *Apparence*) — sombre par défaut, clair au choix.

## Permissions initiales

Aucune permission n'est demandée au démarrage. Voir [Permissions](../permissions/index.md).

## Première utilisation

1. Onglet **Journal** → touchez le **crayon** en haut de la carte pour passer en édition.
2. **Ajouter un repas** → réglez l'heure, tapez un aliment puis `Entrée`.
   La couleur (🔴 pro‑candidose/SIBO, 🟢 bénéfique, ⚪ neutre) est devinée
   automatiquement et se change d'un toucher sur la chip.
3. Sous le repas, ouvrez **Symptômes après ce repas** et touchez les pastilles :
   absent → léger → modéré → sévère.
4. Plus bas : **Transit & hydratation** (échelle de Bristol, litres d'eau) et
   **Bien-être & contexte** (stress, sommeil, règles).
5. Ressortez du mode édition. Le **badge de qualité du jour** s'est mis à jour.
6. Au bout de quelques jours, les onglets **Semaine** et **Évolution** commencent à
   afficher des statistiques et des corrélations.

Tout est enregistré automatiquement (pas de bouton « Enregistrer » pour le journal).

## Mise à jour de l'application

L'application se met à jour toute seule : le service worker télécharge la nouvelle
version en arrière-plan et l'applique au prochain lancement complet
(`registerType: 'autoUpdate'`). Vos données ne sont pas touchées par une mise à jour.

Si une nouvelle fonction annoncée n'apparaît pas : fermez complètement l'app puis
rouvrez-la. Voir [Dépannage](../troubleshooting/mise-a-jour-bloquee.md).

## Désinstallation

Désinstaller l'application (ou effacer les données du site dans le navigateur)
**supprime définitivement le journal**. Exportez votre sauvegarde JSON avant :
**Menu `⋯` → Sauvegarder mes données (JSON)**.

## À suivre

→ [Guide utilisateur](../guide/index.md) · [Fonctionnalités](../features/index.md) · [FAQ](../faq/index.md)

# Guide utilisateur

## Comprendre l'application

Digestor s'organise autour d'**une fiche par jour**. La semaine, les courbes et les
corrélations ne sont jamais stockées : elles sont **recalculées** à partir des jours
saisis. Vous ne pouvez donc pas « casser » une statistique — seule la saisie compte.

### Structure de l'écran

| Zone | Contenu | Toujours visible |
|---|---|---|
| En-tête (haut, collant) | Titre « *semaine* — Patient : *nom* », indicateur d'activité IA, bouton **Aide `?`**, bouton **Menu `⋯`**, **Légende des couleurs** repliable | Oui |
| Corps | L'écran de l'onglet actif | Oui |
| Barre de navigation (bas) | Journal · Aliments · Semaine · Évolution · Repères | Oui |

### Le code couleur

Il est identique partout dans l'application.

| Couleur | Aliment | Intensité d'un symptôme |
|---|---|---|
| 🔴 Rouge `#f0606a` | Pro-candidose / pro-SIBO | Sévère |
| 🟠 Ambre `#e8a13a` | — | Modéré |
| 🟢 Vert `#5fbf6f` | Bénéfique / anti-fongique | Léger |
| ⚪ Gris `#6b6b70` | Neutre | Absent |

Le bouton **« Légende des couleurs »** de l'en-tête l'affiche à tout moment ; il est
replié par défaut et son état est mémorisé par appareil.

### Aide contextuelle

- **`?`** dans l'en-tête → l'aide de l'écran courant (intro + astuces) et le bouton
  **« Lancer la visite guidée de cet écran »**.
- **Bandeau d'astuce** en haut de chaque écran (fermable).
- **Infobulles** sur la plupart des libellés (survol sur desktop, appui long sur mobile).

## Les cinq écrans

- [Journal](journal.md) — la saisie quotidienne
- [Aliments](aliments.md) — bibliothèque et analyses d'aliments
- [Semaine](semaine.md) — récapitulatif 7 jours et corrélations
- [Évolution](evolution.md) — courbes, tableaux et synthèses dans le temps
- [Repères](reperes.md) — repères candidose / SIBO, encyclopédie, système digestif

## Le menu `⋯`

Toutes les fonctions transverses sont regroupées dans le menu de l'en-tête.

| Entrée | Ce qu'elle fait |
|---|---|
| **Sauvegarder mes données (JSON)** | Télécharge la sauvegarde complète — [détail](../features/sauvegarde-restauration.md) |
| **Rechercher dans le journal** | [Recherche](../features/recherche-journal.md) par aliment, symptôme ou note |
| **Entrer un repas (voix → JSON)** | [Import vocal des repas](../features/import-vocal-repas.md) |
| **Entrer votre satiété (voix → JSON)** | [Import vocal de la satiété](../features/import-vocal-satiete.md) |
| **Modèles de repas** | [Modèles de repas](../features/modeles-de-repas.md) |
| **Profil santé** | [Profil santé](../features/profil-sante.md) |
| **Traitements & compléments** | [Traitements](../features/traitements-complements.md) |
| **Réintroductions FODMAP** | [Réintroductions](../features/reintroductions-fodmap.md) |
| **Apparence** (Sombre / Clair) | [Thème](../features/apparence-theme.md) |
| **Restaurer (JSON)** | Remplace toutes les données par un fichier de sauvegarde |
| **Exporter PDF** | Impression de l'écran courant (`window.print()`) |
| **Données de démo** | Recharge les 2 journées d'exemple (écrase ces dates) |
| **Effacer le journal** | Supprime **toutes** les journées et les analyses associées — [détail](../features/sauvegarde-restauration.md#effacer-le-journal) |
| **Vérifier les mises à jour** | Force la recherche d'une nouvelle version ; la ligne au-dessus affiche la version installée et sa date |
| **Assistant IA (OpenRouter)** | [Paramètres IA](../settings/index.md#assistant-ia-openrouter) |
| **Revoir le tutoriel & les visites guidées** | Réinitialise tutoriel et visites guidées |
| **Dossier médical** | [Dossier médical imprimable](../features/dossier-medical.md) |
| **Aide & documentation** | Ouvre cette documentation dans un nouvel onglet |
| **À propos & avertissement médical** | Avertissement médical, confidentialité, IA |

## Navigation

Les cinq onglets du bas sont toujours accessibles. Depuis **Semaine**, toucher un jour
de l'agenda ouvre ce jour dans le **Journal**. Depuis la **recherche**, toucher un
résultat fait de même.

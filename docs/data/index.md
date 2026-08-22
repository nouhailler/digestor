# Données et confidentialité

## Principe

Digestor n'a **pas de serveur**. Il n'y a ni compte, ni synchronisation, ni analytics,
ni cookie de suivi. Toutes vos données sont écrites dans le **stockage local du
navigateur** de l'appareil sur lequel vous les saisissez.

Deux fonctions seulement émettent une requête réseau, et **uniquement sur votre action
explicite** : l'assistant IA et le scan de code-barres.

## Tableau récapitulatif

| Donnée | Origine | Stockage | Transmission | Finalité |
|---|---|---|---|---|
| Journées (repas, aliments, quantités, symptômes, satiété, transit, contexte, notes) | Vous | IndexedDB — `days` | Aucune (sauf description agrégée envoyée à OpenRouter si vous lancez une analyse de journée ou de période) | Journal, statistiques, corrélations |
| Profil santé | Vous | IndexedDB — `meta.profile` | Contexte transmis à OpenRouter lors d'une analyse (**sans le nom**) | Personnaliser les analyses, dossier médical |
| Fiches d'aliments analysées | IA / import / dictionnaire | IndexedDB — `foodInsights` | Aucune | Cache d'analyses |
| Analyses de journées | IA | IndexedDB — `dayAnalyses` | Aucune | Cache, synthèses d'Évolution |
| Rapports de période | IA | IndexedDB — `periodAnalyses` | Aucune | Cache régénérable |
| Fiches de symptômes / d'organes | IA | IndexedDB — `symptomNotes`, `organNotes` | Aucune | Encyclopédie, guide |
| Favoris | Vous / scan | IndexedDB — `favorites` | Aucune | Suggestions de saisie |
| Traitements, réintroductions, modèles de repas | Vous | IndexedDB — `treatments`, `reintroChallenges`, `mealTemplates` | Aucune | Suivi, dossier médical |
| Clé API OpenRouter | Vous | IndexedDB — `meta.aiConfig` | **Uniquement à `openrouter.ai`**, en en-tête d'autorisation | Authentifier les requêtes IA |
| Thème, légende repliée, bandeaux masqués | Vous | `localStorage` / `sessionStorage` | Aucune | Préférences d'affichage |
| Code-barres scanné | Caméra ou saisie | Non stocké | **`world.openfoodfacts.org`** | Retrouver le produit |

## Ce qui sort de l'appareil

### Vers OpenRouter (seulement si l'IA est configurée **et** que vous lancez une analyse)

| Fonction | Ce qui part |
|---|---|
| Analyse d'un aliment | Le **nom de l'aliment**, le contexte produit d'un article scanné (marque, contenance, ingrédients), le contexte de profil |
| Analyse d'une journée | Description de la journée : repas, heures, aliments, symptômes et intensités, transit, hydratation, contexte ; les fiches d'aliments connues ; le contexte de profil |
| Rapport de période | Description **agrégée** de la période |
| Idées de repas | Le contexte de profil |
| Fiche de symptôme / d'organe / enrichissement d'encyclopédie | Le nom du symptôme ou de l'organe |

Ne partent **jamais** : le nom du patient, le journal brut complet, les fichiers de
sauvegarde.

### Vers Open Food Facts (seulement lors d'un scan)

**Uniquement le code-barres.** Aucune donnée personnelle, aucune clé, aucun compte.

### Vers l'hébergeur

L'application est un site statique : l'hébergeur voit les requêtes HTTP habituelles
(fichiers de l'application). Aucune donnée de journal n'y transite.

## Stockage local — détail

| Mécanisme | Contenu | Effacé quand |
|---|---|---|
| **IndexedDB** (base `digestor`) | Toutes les données patient et les caches d'analyses | Désinstallation, effacement des données du site, éviction du navigateur |
| **localStorage** | Thème, légende repliée, invite d'installation masquée | Idem |
| **sessionStorage** | Rappel de sauvegarde masqué | Fermeture de la session de navigation |
| **Cache Storage / Service Worker** | Les fichiers de l'application (pour le fonctionnement hors ligne) | Mise à jour de l'application, effacement des données du site |

La base est versionnée (schéma **v8**) : les migrations sont automatiques à l'ouverture,
sans perte de données.

## Durée de conservation

Il n'y a **aucune expiration** : vos données restent tant que le stockage du navigateur
les conserve. Digestor ne supprime jamais de journée de lui-même.

## Suppression

| Ce que vous voulez supprimer | Comment |
|---|---|
| Une analyse d'aliment | Écran Aliments → icône **gomme** |
| Un aliment partout (analyse, favori, **et toutes ses occurrences dans les repas**) | Écran Aliments → icône **corbeille** (confirmation explicite) |
| Un repas, un traitement, une réintroduction, un modèle | Icône corbeille de la ligne |
| **Tout le journal** (journées + analyses de journées + rapports de période) | Menu `⋯` → **Effacer le journal** (confirmation, irréversible) |
| **Tout** | Effacez les données du site dans les réglages du navigateur, ou désinstallez l'application |

⚠️ La suppression est **définitive** : il n'y a pas de corbeille ni de restauration
serveur. Exportez d'abord.

## Export

**Menu `⋯` → Sauvegarder mes données (JSON)** produit un fichier complet et lisible.
La clé API n'y figure jamais. Voir
[Sauvegarde & restauration](../features/sauvegarde-restauration.md) et
[Formats de données](../reference/data-formats.md).

## Partage

Rien n'est partagé automatiquement. Vous seul déclenchez :

- le **partage d'une analyse** (feuille native de l'OS ou presse-papiers) ;
- l'**impression du dossier médical** ;
- l'**export d'un référentiel d'aliments** (qui ne contient ni journal ni profil).

## Voir aussi

- [Permissions](../permissions/index.md)
- [Hors connexion](../offline/index.md)
- [Informations légales](../legal/index.md)

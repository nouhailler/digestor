# La mise à jour ne s'applique pas

## Symptôme

Une fonction annoncée dans une nouvelle version n'apparaît pas, ou l'interface semble
figée dans une version antérieure.

## Causes possibles

- L'application n'a pas encore revérifié : la vérification automatique a lieu à
  l'ouverture, puis **toutes les heures** pour un onglet resté ouvert.
- Pas de réseau depuis la publication de la nouvelle version.
- Le service worker sert encore la version en cache.

## Diagnostic

Ouvrez **Menu `⋯`** : la ligne au-dessus du bouton de mise à jour affiche la **version
installée** et sa **date**. Comparez-la à la version attendue.

## Solution

1. **Menu `⋯` → Vérifier les mises à jour.** L'application répond :

| Message | Sens |
|---|---|
| `Nouvelle version trouvée, installation…` | La mise à jour s'installe et s'applique seule |
| `Vous avez déjà la dernière version.` | Rien à faire |
| `Vérification indisponible (app non installée hors-ligne).` | Le service worker n'est pas actif — rechargez la page |

2. Si cela ne suffit pas, fermez **complètement** l'application : toutes les fenêtres et
   tous les onglets, y compris celle installée sur l'écran d'accueil, puis rouvrez-la
   avec une connexion active.
3. Si nécessaire, rechargez en forçant le contournement du cache
   (`Ctrl`/`Cmd` + `Maj` + `R` sur desktop).
4. En dernier recours : effacez le cache du site **sans** effacer les données —
   attention, selon le navigateur, « effacer les données du site » supprime **aussi**
   IndexedDB. **Sauvegardez avant.**

## Si le problème persiste

Désinstallez puis réinstallez l'application, **après avoir exporté vos données**, et
restaurez-les ensuite.

## Informations à fournir au support

Version affichée, navigateur, application installée ou consultée dans le navigateur,
date du dernier accès en ligne.

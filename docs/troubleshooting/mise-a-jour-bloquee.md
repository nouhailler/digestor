# La mise à jour ne s'applique pas

## Symptôme

Une fonction annoncée dans une nouvelle version n'apparaît pas, ou l'interface semble
figée dans une version antérieure.

## Causes possibles

- Le service worker sert encore la version en cache : la nouvelle est téléchargée mais
  ne s'active qu'au prochain **démarrage complet**.
- L'application n'a jamais été fermée (onglet ou fenêtre maintenu ouvert).
- Pas de réseau depuis la publication de la nouvelle version.

## Diagnostic

Comparez la version attendue avec celle de l'application. Vérifiez que vous avez été
connecté au moins une fois depuis la publication.

## Solution

1. Fermez **complètement** l'application : toutes les fenêtres et tous les onglets, y
   compris l'application installée sur l'écran d'accueil.
2. Rouvrez-la avec une connexion active.
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

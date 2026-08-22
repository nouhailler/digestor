# Erreur au démarrage

## Symptôme

Un bandeau rouge s'affiche en haut de l'écran :
*« Un problème est survenu au démarrage (tes données restent en sécurité). Détail : … »*

L'application se charge quand même — c'est volontaire : elle ne reste jamais bloquée sur
l'écran « Chargement de Digestor… ».

## Causes possibles

- Migration de la base de données interrompue (application fermée pendant une mise à jour).
- Stockage du navigateur saturé.
- Navigation privée stricte, où IndexedDB est bridé.
- Base corrompue par un arrêt brutal.

## Diagnostic

1. Lisez le **détail** affiché dans le bandeau : il contient le nom et le message de
   l'erreur technique.
2. Vérifiez que vos données sont là : les onglets Journal et Semaine affichent-ils vos
   journées ?
3. Testez dans un autre navigateur sur le même appareil.

## Solution

1. **Sauvegardez immédiatement** si vos données sont visibles : Menu `⋯` →
   **Sauvegarder mes données (JSON)**.
2. Fermez complètement l'application (toutes les fenêtres/onglets) et rouvrez-la.
3. Si le bandeau persiste : effacez les données du site **après avoir sauvegardé**, puis
   restaurez votre fichier JSON.
4. Sortez de la navigation privée si vous y êtes.

## Si le problème persiste

Ne réinstallez pas sans sauvegarde. Notez le message exact du bandeau et signalez-le —
voir [Support](../support/index.md).

## Informations à fournir au support

Le texte complet du bandeau, le navigateur et sa version, le système, et si le problème
est apparu après une mise à jour.

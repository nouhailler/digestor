# L'impression est vide ou mal découpée

## Symptôme

L'impression du dossier médical (ou l'export PDF) sort blanche, tronquée, ou contient
des éléments de l'interface qui ne devraient pas y être.

## Causes possibles

- L'aperçu d'impression a été lancé avant le rendu complet des graphes.
- Le navigateur n'applique pas les styles d'impression (extensions, mode lecture).
- Le bouton **Imprimer / PDF** était désactivé : le dossier est vide (aucune donnée).
- Le découpage des pages dépend du moteur d'impression du navigateur.

## Diagnostic

1. Le dossier s'affiche-t-il correctement **à l'écran** avant impression ?
2. Le bouton **Imprimer / PDF** est-il actif ?
3. Testez avec un autre navigateur.

## Solution

1. Ouvrez **Menu `⋯` → Dossier médical**, laissez la page se rendre entièrement
   (les graphes apparaissent en dernier), puis touchez **Imprimer / PDF**.
2. Dans la boîte d'impression, choisissez **Enregistrer au format PDF**, format A4,
   marges par défaut, et activez **Graphiques d'arrière-plan** si les couleurs manquent.
3. Désactivez temporairement les extensions de navigateur qui modifient les pages.
4. Sur mobile, préférez l'impression depuis Chrome ou Safari plutôt qu'un navigateur tiers.

## Si le problème persiste

Utilisez **Menu `⋯` → Exporter PDF** depuis un écran simple pour vérifier que
l'impression fonctionne en général. Si oui, le problème est spécifique au rendu du
dossier : signalez-le.

## Informations à fournir au support

Navigateur et version, système, et une description de ce qui manque ou déborde.

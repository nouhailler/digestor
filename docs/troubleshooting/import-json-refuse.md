# Un import JSON est refusé

## Symptôme

Un message rouge apparaît sous la zone de collage : `JSON invalide.`,
`Fichier invalide : ce n'est pas un export Digestor.` ou `Échec de l'import.`

## Causes possibles

| Cause | Où |
|---|---|
| Le texte collé n'est pas du JSON (phrase d'introduction du modèle restée collée) | Imports vocaux |
| Le JSON est tronqué (copie partielle) | Imports vocaux |
| Le fichier n'est pas une sauvegarde Digestor | Restauration |
| La structure ne correspond pas au type attendu | Référentiel d'aliments, satiété |

## Diagnostic

1. Le texte commence-t-il par `{` et finit-il par `}` ?
2. Correspond-il au format attendu ?

| Import | Racine attendue |
|---|---|
| Repas | `{ "app": "digestor", "days": [ … ] }` |
| Satiété | `{ "app": "digestor", "type": "satiety", "sets": [ … ] }` |
| Référentiel d'aliments | `{ "type": "food-reference", "foods": [ … ] }` |
| Sauvegarde complète | `{ "app": "digestor", "version": 8, … }` (fichier, pas collage) |

## Solution

1. Recopiez **uniquement** le bloc JSON, sans le texte qui l'entoure.
2. Utilisez **Prévisualiser** avant d'importer : l'aperçu montre ce qui sera écrit et
   liste les avertissements.
3. Pour les imports vocaux, vérifiez que le Projet Claude Web utilise bien le **prompt
   fourni par l'application** (bouton **Copier le prompt**) : les prompts sont versionnés
   et le format a évolué.
4. Pour une restauration, choisissez le fichier `digestor-AAAA-MM-JJ.json` produit par
   **Sauvegarder mes données (JSON)**.

## Si le problème persiste

Ouvrez le fichier dans un éditeur de texte : un JSON tronqué se repère à l'absence
d'accolade fermante. Redemandez la génération à Claude Web.

## Informations à fournir au support

Le type d'import, le message exact, et les premières lignes du JSON (**sans données
personnelles**).

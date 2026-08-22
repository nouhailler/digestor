# Sauvegarde & restauration

## Description

Export complet de vos données dans un fichier JSON, et restauration depuis ce fichier.

## Objectif

**C'est la seule protection contre la perte de données.** Il n'y a aucun serveur : si le
navigateur efface son stockage ou si l'appareil est perdu, seule une sauvegarde permet
de repartir.

## Prérequis

Aucun.

## Comment l'utiliser

**Sauvegarder** — **Menu `⋯` → Sauvegarder mes données (JSON)**.
Un fichier `digestor-AAAA-MM-JJ.json` est téléchargé. Message :
*« Sauvegarde téléchargée. Conservez ce fichier en lieu sûr. »*

**Restaurer** — **Menu `⋯` → Restaurer (JSON)** → choisissez le fichier.
Message : *« Import réussi. Données remplacées. »*

> ⚠️ **La restauration remplace tout.** Les journées, aliments, favoris, traitements,
> réintroductions et modèles présents sont effacés puis remplacés par le contenu du
> fichier. Faites une sauvegarde avant de restaurer si vous avez un doute.

## Options

### Rappel de sauvegarde

Un bandeau **« Sauvegardez vos données »** apparaît en haut de l'écran si vous avez des
données significatives et que la dernière sauvegarde date de **7 jours ou plus** (ou n'a
jamais eu lieu). Il propose un bouton **Sauvegarder** et une croix pour le masquer
**pour la session**.

### Export PDF

**Menu `⋯` → Exporter PDF** lance l'impression de l'écran courant. Pour un document
structuré, préférez le [dossier médical](dossier-medical.md).

### Effacer le journal

**Menu `⋯` → Effacer le journal** supprime **toutes les journées**, ainsi que les
**analyses IA de journées** et les **rapports de période** en cache. Une confirmation
prévient que l'action est irréversible et invite à sauvegarder d'abord.

Ce qui **reste** : votre profil santé, vos fiches d'aliments analysées, vos favoris, vos
traitements, vos réintroductions, vos modèles de repas et vos réglages. Pour tout
supprimer, effacez les données du site dans le navigateur.

### Données de démo

**Menu `⋯` → Données de démo** recharge les deux journées d'exemple (9 juin 2025).
Une confirmation prévient que **les jours existants pour ces dates seront écrasés**.

## Paramètres associés

Aucun.

## Données utilisées

Le fichier de sauvegarde (version de format **8**) contient :

| Inclus | Non inclus |
|---|---|
| Profil santé | **Clé API OpenRouter** (secret, jamais exportée) |
| Toutes les journées | Cache des rapports de période (régénérable) |
| Fiches d'aliments analysées | Thème d'affichage (préférence d'appareil) |
| Analyses de journées | État de la légende repliée (préférence d'appareil) |
| Fiches de symptômes et d'organes | Visites guidées vues |
| Favoris, traitements, réintroductions, modèles de repas | |
| Idées de repas, encyclopédie enrichie | |
| Réglages non sensibles : modèle IA choisi, tutoriel vu | |

Détail : [Formats de données](../reference/data-formats.md#sauvegarde-complète).

## Résultat

Un fichier JSON lisible, portable d'un appareil à l'autre.

## Fonctionnement hors connexion

Intégral : export et import sont locaux.

## Fonctionnement en ligne

Identique. Rien n'est envoyé nulle part.

## Limites

- **Pas de sauvegarde automatique** vers un cloud : c'est à vous de conserver le fichier.
- La restauration est **destructive** (remplacement, pas fusion).
- Après restauration, la **clé API** en place n'est ni écrasée ni restaurée ; le modèle
  choisi, lui, est restauré.

## Erreurs possibles

| Message | Cause |
|---|---|
| `Fichier invalide : ce n'est pas un export Digestor.` | Le fichier n'a pas la structure attendue |
| `Échec de l'import.` | Fichier illisible ou JSON malformé |

## Dépannage

- [Mes données ont disparu](../troubleshooting/donnees-disparues.md)
- [Un import ne passe pas](../troubleshooting/import-json-refuse.md)

## FAQ

- [À quelle fréquence sauvegarder ?](../faq/index.md#à-quelle-fréquence-sauvegarder)
- [Comment changer de téléphone ?](../faq/index.md#comment-changer-de-téléphone)

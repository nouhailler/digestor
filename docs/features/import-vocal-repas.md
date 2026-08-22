# Import vocal des repas

## Description

Dicter sa journée à Claude Web, qui produit un JSON, puis coller ce JSON dans Digestor.

## Objectif

Saisir un repas sans taper, notamment après coup ou quand la journée a été chargée.

## Prérequis

Un accès à [claude.ai](https://claude.ai) (compte gratuit suffisant). **Digestor
n'appelle pas Claude** : le transfert est un copier-coller.

## Comment l'utiliser

1. **Menu `⋯` → Entrer un repas (voix → JSON)**.
2. Dépliez **« Comment générer ce JSON ? »** → **Copier le prompt**.
3. Sur claude.ai, créez un **Projet**, collez le prompt comme instructions.
   *(Facultatif : déposez aussi votre [référentiel d'aliments](referentiel-aliments.md)
   dans les fichiers du Projet.)*
4. Décrivez vos repas à voix haute ; copiez la réponse JSON.
5. Revenez dans Digestor, collez le JSON, **Prévisualisez**.
6. Choisissez **Ajouter aux repas** ou **Remplacer les repas**, puis **Importer**.

Le prompt de référence est aussi versionné :
[`docs/claude-web-repas-prompt.md`](../claude-web-repas-prompt.md).

## Options

| Mode | Effet sur la journée cible |
|---|---|
| **Ajouter aux repas** | Les repas importés s'ajoutent aux repas existants |
| **Remplacer les repas** | Les repas existants du jour sont remplacés |

L'aperçu affiche les repas, les chips d'aliments colorées, les symptômes, le transit,
l'hydratation, la qualité et les notes, plus un compte
(`N repas · N aliments · N fiche(s) FODMAP`) et la liste des **avertissements**.

## Paramètres associés

Aucun.

## Données utilisées

Le JSON peut contenir : jours, repas (heure, aliments, catégories, quantités, tags),
fiches FODMAP par aliment, symptômes, transit, hydratation, qualité et notes. Les fiches
FODMAP fournies sont mises en cache comme des analyses.

Une journée absente de la base est créée ; sinon elle est fusionnée selon le mode choisi.

## Résultat

Le Journal s'ouvre sur la première journée importée, à jour immédiatement.

## Fonctionnement hors connexion

L'import lui-même fonctionne hors ligne (c'est un collage de texte). La génération du
JSON par Claude Web nécessite évidemment le réseau, mais elle se passe hors de
l'application.

## Fonctionnement en ligne

Aucun appel réseau émis par Digestor pour cette fonction.

## Limites

- Le format doit correspondre au prompt fourni ; un JSON arbitraire est refusé.
- Le mode **Remplacer** est irréversible pour la journée concernée.
- Les avertissements de l'aperçu (aliment non reconnu, champ ignoré) doivent être lus
  avant d'importer.

## Erreurs possibles

`JSON invalide.` ou le message du parseur. Voir
[Un import ne passe pas](../troubleshooting/import-json-refuse.md).

## Dépannage

[Un import ne passe pas](../troubleshooting/import-json-refuse.md)

## FAQ

- [Digestor envoie-t-il quelque chose à Claude ?](../faq/index.md#digestor-envoie-t-il-quelque-chose-à-claude)

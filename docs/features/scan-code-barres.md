# Scan d'un produit (code-barres)

## Description

Viser le code-barres d'un produit emballé pour retrouver son nom, sa marque et ses
ingrédients dans **Open Food Facts**, puis l'analyser comme n'importe quel aliment.

## Objectif

Savoir en magasin si un produit est déconseillé, sans recopier son nom à la main.

## Prérequis

- **Permission caméra** (voir [Permissions](../permissions/index.md#caméra)) — ou saisie
  manuelle du code.
- **Réseau** pour interroger Open Food Facts.
- L'analyse qui suit nécessite l'[IA configurée](../settings/index.md#assistant-ia-openrouter).

## Comment l'utiliser

1. Écran **Aliments** → **Scanner un produit (code-barres)**.
2. Autorisez la caméra, visez le code-barres (cadre au centre).
3. Le produit trouvé s'affiche : nom, marque, contenance, ingrédients.
4. **Analyser ce produit** — le nom **et** le contexte produit (marque, contenance,
   ingrédients) sont transmis à l'analyse pour l'affiner.

## Options

| Situation | Ce que propose l'application |
|---|---|
| Caméra indisponible ou refusée | « Caméra indisponible. Saisissez le code-barres à la main. » + champ numérique |
| Produit introuvable | Champ **Nom du produit** → **Analyser ce nom** |
| Après un scan | **Scanner un autre** |

Formats lus : EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39.
Codes acceptés en saisie : **8, 12, 13 ou 14 chiffres**.

## Paramètres associés

Aucun réglage dédié.

## Données utilisées

- **Envoyé à `world.openfoodfacts.org`** : uniquement le **code-barres**.
- **Reçu** : nom (FR de préférence), marque, ingrédients, contenance.
- Le produit scanné devient **favori automatiquement**, avec sa date de scan.

## Résultat

Une fiche d'aliment complète, mise en cache localement comme les autres.

## Fonctionnement hors connexion

Le scan ne fonctionne pas hors ligne : la recherche du produit échoue avec
« Recherche du produit impossible (hors-ligne ?). ». Vous pouvez toujours saisir le nom
du produit à la main dans le Journal.

## Fonctionnement en ligne

Deux appels : Open Food Facts (sans clé, sans compte), puis OpenRouter pour l'analyse.

## Limites

- Open Food Facts est une base **collaborative** : un produit peut être absent, mal
  nommé ou sans liste d'ingrédients.
- Le moteur de lecture est le `BarcodeDetector` natif quand il existe (Android/Chrome) ;
  sinon une bibliothèque est chargée à la demande (iPhone / Safari), ce qui peut être
  plus lent.
- La caméra requiert un contexte **HTTPS**.

## Erreurs possibles

| Message | Cause |
|---|---|
| `Code-barres invalide (8 à 14 chiffres attendus).` | Saisie manuelle hors format |
| `Recherche du produit impossible (hors-ligne ?).` | Pas de réseau |
| `Recherche du produit indisponible pour le moment.` | Open Food Facts a répondu en erreur |
| `Produit introuvable dans Open Food Facts (code …).` | Code inconnu de la base |
| `Caméra indisponible. Saisissez le code-barres à la main.` | Permission refusée ou caméra absente |

## Dépannage

[La caméra ne s'ouvre pas](../troubleshooting/camera-indisponible.md)

## FAQ

- [Que reçoit Open Food Facts ?](../faq/index.md#que-reçoit-open-food-facts)

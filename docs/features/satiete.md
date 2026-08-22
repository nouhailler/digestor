# Satiété après les repas

## Description

Un suivi temporel de ce que le repas a produit : **faim**, **énergie** et **envie de
sucre**, mesurées sur une échelle 0–100, à quatre moments après le repas.

## Objectif

Distinguer les repas qui calent réellement de ceux qui donnent faim deux heures plus
tard, et relier cette différence à la composition du repas.

## Prérequis

Aucun. La saisie vocale nécessite un accès à Claude Web — voir
[Import vocal de la satiété](import-vocal-satiete.md).

## Comment l'utiliser

1. Dans le bloc d'un repas (mode édition), dépliez **Satiété**.
2. Choisissez un **checkpoint** : **Immédiat**, **+1 h**, **+2 h**, **+3 h**.
3. Réglez les trois curseurs :

| Mesure | 0 | 100 |
|---|---|---|
| **Intensité de la faim** | Aucune faim | Faim extrême |
| **Énergie** | Coup de barre / fébrile | Énergie stable et claire |
| **Envie de sucre** | Aucune envie | Envie irrépressible |

4. Aux checkpoints proches du repas (**Immédiat**, **+1 h**), précisez le **type de
   satiété** : *Légère*, *Lourde* ou *Ballonnement*.
5. Le bouton **Aide** à droite de « Type de satiété » explique le calcul des durées.

## Options

- Supprimer un relevé (croix sur la ligne du checkpoint).
- Note libre par relevé.

## Paramètres associés

Les **tags de composition** du repas (*Protéiné*, *Fibres*, *Sucré*) modifient la durée
**attendue** — voir [Journal quotidien](journal-quotidien.md#composition-du-repas).

## Données utilisées

`Meal.satiety` : liste de relevés (`checkpoint`, `hungerIntensity`, `energyLevel`,
`sugarCraving`, `satietyType`, `notes`). Aucune table dédiée.

## Résultat

Deux durées sont affichées sous le repas, par exemple
« Satiété tenue ~2 h (attendu ~4–5 h) » :

| Durée | Comment elle est obtenue |
|---|---|
| **Tenue (mesurée)** | Moment où **votre** faim repasse au-dessus de la moitié de l'échelle. Tant qu'elle n'est pas revenue : « encore rassasié à +X h ». Un seul relevé pris trop tôt ne donne pas encore de durée |
| **Attendue** | Estimée d'après la composition : tags *Protéiné* / *Fibres* → ~4–5 h (~4–6 h si les deux) ; *Sucré* → ~2–3 h. Sans tag, d'après les catégories d'aliments et le niveau FODMAP |

Une ligne automatique `⏱ Satiété (HH:MM) : …` est écrite dans les **Notes du jour**,
sans écraser votre texte libre.

L'écran [Évolution](../guide/evolution.md) trace la **courbe de satiété moyenne** et
compare faim et envie de sucre selon la catégorie dominante et le niveau FODMAP du
repas — au-delà d'un nombre minimal de repas suivis.

## Fonctionnement hors connexion

Intégral (saisie, calcul des durées, courbes).

## Fonctionnement en ligne

Identique. La dictée passe par Claude Web, mais l'import lui-même est un copier-coller.

## Limites

- La durée mesurée est une **interpolation** entre vos relevés : plus ils sont
  nombreux, plus elle est fine.
- La durée attendue est une **approximation** de composition, pas une mesure.
- Les tags n'influencent **que** la durée attendue.

## Erreurs possibles

Import : `JSON invalide.` — voir [Import vocal de la satiété](import-vocal-satiete.md).

## Dépannage

[Un import ne passe pas](../troubleshooting/import-json-refuse.md)

## FAQ

- [Pourquoi aucune durée de satiété ne s'affiche ?](../faq/index.md#pourquoi-aucune-durée-de-satiété-ne-saffiche)

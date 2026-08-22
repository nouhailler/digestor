# Corrélations personnalisées

## Description

Digestor cherche, dans **vos** données, des associations entre ce que vous mangez (ou
votre contexte) et vos symptômes. Il n'applique aucune règle nutritionnelle
pré-écrite : tout est calculé sur votre journal.

## Objectif

Faire émerger des pistes fiables, sans en inventer. **Sous les seuils, l'application
dit qu'elle ne sait pas** plutôt que d'afficher un motif.

## Prérequis

Un minimum de jours renseignés — voir les seuils ci-dessous.

## Comment l'utiliser

Écran **Semaine**, bloc **Corrélations personnalisées** (calculé sur *tout* le journal,
pas seulement la semaine affichée). Repris dans le
[dossier médical](dossier-medical.md) et l'écran [Évolution](../guide/evolution.md)
(« Aliment suspect par symptôme »).

## Options

Quatre familles sont calculées séparément, avec chacune ses garde-fous.

### 1. Déclencheurs suspectés (aliment → symptôme)

| Condition | Seuil |
|---|---|
| Jours renseignés | ≥ 5 |
| Jours où l'aliment apparaît | ≥ 3 |
| Taux de symptôme les jours **avec** | ≥ 50 % |
| Écart avec / sans | ≥ 30 points |
| Résultats affichés | 12 au maximum |

Un symptôme n'est compté que s'il est **modéré ou sévère**.
Affichage : `aliment → symptôme : X % des jours avec vs Y % sans`.

### 2. Aliments fréquents bien tolérés

Aliments consommés souvent dont les jours de consommation sont peu associés aux
symptômes. Affichés en chips vertes.

### 3. Facteurs contextuels

| Condition | Seuil |
|---|---|
| Jours renseignés | ≥ 5 |
| Jours où le facteur est présent | ≥ 3 |
| Taux de jours à symptômes **avec** | ≥ 50 % |
| Écart avec / sans | ≥ 20 points |

Facteurs : **stress**, **sommeil**, **règles**.

### 4. Amines biogènes

Calculé indépendamment des corrélations alimentaires (seuils propres : ≥ 5 jours
renseignés, ≥ 3 jours à charge élevée, ≥ 50 % avec, écart ≥ 20 points).
Voir [Amines biogènes](amines-biogenes.md).

### Corrélations au niveau du repas

L'écran Évolution ajoute un tableau **« Aliment suspect par symptôme (après repas) »**
qui raisonne repas par repas et non jour par jour : les aliments **habituels** sont
disculpés, le **nouvel** aliment d'un repas suivi d'un symptôme est mis en avant. La
cohérence **amine ↔ symptôme** (histamine / tyramine) y est signalée.

## Paramètres associés

Aucun réglage exposé. Les seuils sont fixés dans le code.

## Données utilisées

Tous les jours renseignés : repas, aliments, symptômes (repas + journée), facteurs
contextuels. Aucun envoi réseau.

## Résultat

Des lignes chiffrées, toujours accompagnées du dénominateur, et de la mention :
*« Détection conservatrice (association le même jour). Indications à confirmer, pas un
diagnostic. »*

## Fonctionnement hors connexion

Intégral : tout est calculé localement.

## Fonctionnement en ligne

Identique. Les corrélations n'appellent jamais l'IA.

## Limites

- **Association, pas causalité.** Un aliment fréquemment présent les jours à symptômes
  n'en est pas nécessairement la cause.
- **Même jour seulement** : les effets retardés ne sont pas détectés.
- Un aliment mangé tous les jours ne peut pas être discriminé (il n'y a pas de jours
  « sans » pour comparer).

## Erreurs possibles

Aucun message d'erreur. Message informatif : *« Pas encore assez de données pour les
corrélations alimentaires — continuez à remplir le journal. »*

## Dépannage

[Les corrélations ne s'affichent pas](../troubleshooting/pas-de-correlations.md)

## FAQ

- [Pourquoi Digestor ne me dit-il rien alors que je saisis depuis une semaine ?](../faq/index.md#pourquoi-digestor-ne-me-dit-il-rien-alors-que-je-saisis-depuis-une-semaine)

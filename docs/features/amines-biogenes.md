# Amines biogènes

## Description

Suivi de la charge en **amines biogènes** (histamine, tyramine, putrescine,
cadavérine) apportée par vos repas, et de son lien avec les symptômes évocateurs.

## Objectif

L'intolérance à l'histamine fonctionne par **accumulation** et par **combinaisons** :
chaque aliment passe « à peu près » seul, mais leur somme sur la journée déclenche.
Digestor calcule cette somme.

## Prérequis

Aucun pour le calcul (un dictionnaire d'amines est embarqué). L'enrichissement des
aliments hors dictionnaire nécessite l'[IA](analyse-aliment-ia.md).

## Comment l'utiliser

- **Journal** : la carte du jour affiche la **charge en amines**. Un toucher détaille
  les aliments concernés, les **freineurs de DAO** et les **histamino-libérateurs**.
- **Semaine** : la carte **Amines (note /10)** et, dans les corrélations, le bloc
  **Amines biogènes (histamine)**.
- **Évolution** : la courbe **Tendance amines biogènes**.
- **Repères** : le dossier de fond (mécanisme de la DAO, listes d'aliments, tableau des
  amines les plus problématiques, fiche par amine).
- **Aliments** : boutons **Compléter les amines (hors-ligne)** et
  **Enrichir N amines avec l'IA**.

## Options

### Calcul de la charge journalière

| Élément | Poids |
|---|---|
| Aliment à niveau **modéré** | +1 |
| Aliment à niveau **élevé** | +3 |
| Mécanisme (libérateur, freineur de DAO, inhibiteur de MAO) | +1 |

| Bande | Score |
|---|---|
| **Faible** | < 2 |
| **Modérée** | ≥ 2 |
| **Élevée** | ≥ 5 |

**Escalade par combinaison** : la présence d'**alcool** avec un **fromage affiné**, une
**charcuterie** ou un **aliment fermenté** force la bande à **élevée**, quel que soit le
score.

### Profil d'un aliment

Chaque fiche d'aliment peut porter : niveau global, détail par amine (histamine,
tyramine, putrescine/cadavérine), et des mécanismes — **histamino-libérateur**,
**freineur de DAO**, **inhibiteur de MAO**, **fermenté**, **dépendant de la fraîcheur** —
plus une **portion tolérable** indicative.

### Corrélation amine ↔ symptôme

Deux niveaux : la charge **globale** face aux symptômes histaminiques, et la charge
**par amine** face aux symptômes dont l'amine typique correspond (pattern histaminique
ou tyraminique). Seuils : ≥ 5 jours renseignés, ≥ 3 jours à charge élevée, ≥ 50 % de
jours à symptômes « avec », écart ≥ 20 points.

## Paramètres associés

Déclarer **Histamine** dans les intolérances du [profil santé](profil-sante.md) rend
l'application plus attentive à cet axe dans les analyses IA.

## Données utilisées

Le dictionnaire d'amines embarqué, plus le champ `amines` des fiches d'aliments en
cache (`foodInsights`). Aucun envoi réseau pour le calcul.

## Résultat

Une charge quotidienne, une note hebdomadaire /10, une courbe de tendance et, si les
seuils sont atteints, une ligne de corrélation.

## Fonctionnement hors connexion

Intégral, y compris **Compléter les amines (hors-ligne)** qui remplit les profils
manquants depuis le dictionnaire embarqué.

## Fonctionnement en ligne

**Enrichir N amines avec l'IA** complète les aliments absents du dictionnaire
(teneur, histamino-libération, inhibition de la DAO, portion tolérée).

## Limites

- La teneur réelle en histamine **varie fortement** avec la fraîcheur et l'affinage :
  les valeurs sont des repères, pas des mesures.
- Le classement des amines par risque est indicatif et **non médical**.
- Les aliments inconnus du dictionnaire et non analysés ne comptent pas dans la charge.

## Erreurs possibles

| Message | Sens |
|---|---|
| « Aucun complément hors-ligne : les aliments connus du dictionnaire ont déjà leur profil amines. » | Rien à faire hors ligne |
| « Aucun aliment à enrichir : les autres ont déjà un profil ou sont à amines négligeables. » | Rien à faire via l'IA |

## Dépannage

[Les corrélations ne s'affichent pas](../troubleshooting/pas-de-correlations.md)

## FAQ

- [Qu'est-ce que la DAO ?](../faq/index.md#quest-ce-que-la-dao)

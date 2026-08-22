# Analyse d'un aliment (IA)

## Description

Une fiche par aliment : niveau FODMAP global et par groupe, verdicts SIBO et candidose,
profil d'amines biogènes, portion tolérée, synthèse et conseils.

## Objectif

Savoir si un aliment est adapté à votre situation, sans chercher dans plusieurs tables
FODMAP.

## Prérequis

- Une **clé API OpenRouter** et un **modèle gratuit** sélectionnés
  ([Paramètres IA](../settings/index.md#assistant-ia-openrouter)).
- Une connexion réseau **au moment de l'analyse**.

Sans cela, la fiche propose un bouton **Paramètres IA** et rien n'est envoyé.

## Comment l'utiliser

Trois entrées possibles :

- **Journal**, en lecture : touchez une chip d'aliment.
- **Aliments** : touchez une ligne, ou tapez un nom puis **Analyser « … »**.
- **Aliments** : **Analyser les N aliments non analysés** (traitement en série).

L'analyse tourne en arrière-plan : vous pouvez changer d'écran, un indicateur
(sablier + secondes, puis ✓ vert) reste visible dans l'en-tête.

## Options

| Option | Effet |
|---|---|
| **Partager le texte** | Feuille de partage native de l'OS, avec repli sur le presse-papiers (« Texte copié ») |
| **Partager l'image** | Carte PNG téléchargée (`digestor-aliment-<nom>.png`) |
| Gomme (écran Aliments) | Efface l'analyse en cache ; l'aliment reste ré-analysable |
| Corbeille (écran Aliments) | Supprime définitivement l'aliment, son favori et ses occurrences dans les repas |

## Paramètres associés

- [Assistant IA](../settings/index.md#assistant-ia-openrouter) — clé et modèle.
- [Profil santé](profil-sante.md) — les allergies, intolérances, conditions et la phase
  FODMAP sont injectées dans la demande ; les **allergies** sont signalées en priorité.

## Données utilisées

**Envoyé à OpenRouter** : le nom de l'aliment, éventuellement le contexte produit
(marque, contenance, ingrédients) d'un article scanné, et le contexte de profil s'il
est renseigné. **Jamais** : votre journal, vos symptômes, votre nom.

Le résultat est mis en cache dans la table `foodInsights`, avec le nom normalisé comme
clé, l'identifiant du modèle et la date.

## Résultat

| Bloc | Contenu |
|---|---|
| Niveau FODMAP | Bas / Modéré / Élevé / Inconnu |
| Groupes FODMAP | Fructose, lactose, fructanes, GOS, polyols |
| SIBO / Candidose | Verdict (favorable / attention / éviter / inconnu) + note |
| Amines | Niveau, mécanismes, portion tolérable |
| Portion sûre | Ex. « 1/2 tasse, 75 g » |
| Synthèse & conseils | 1–2 phrases + liste de conseils |

La chip de l'aliment dans le Journal prend ensuite la couleur de sa sévérité FODMAP.

## Fonctionnement hors connexion

La **consultation** d'une fiche déjà en cache fonctionne hors ligne. Une **nouvelle**
analyse échoue tant qu'il n'y a pas de réseau.

## Fonctionnement en ligne

Un appel `POST` vers `https://openrouter.ai/api/v1/chat/completions`, uniquement sur
action explicite.

## Limites

- Les modèles gratuits sont **variables** : un modèle peut renvoyer un JSON inexploitable
  (message : « Le modèle n'a pas renvoyé de JSON exploitable. Essayez un autre modèle. »).
- L'analyse est un **repère indicatif, non médical**.
- Les analyses ne sont pas ré-évaluées automatiquement : pour rafraîchir, effacez la
  fiche (gomme) et relancez.

## Erreurs possibles

Voir [Codes et erreurs](../reference/errors.md#openrouter-ia).

## Dépannage

- [L'IA ne répond pas](../troubleshooting/ia-ne-repond-pas.md)
- [Aucun modèle gratuit trouvé](../troubleshooting/aucun-modele-gratuit.md)

## FAQ

- [L'IA est-elle obligatoire ?](../faq/index.md#lia-est-elle-obligatoire)
- [Mes données sont-elles envoyées à l'IA ?](../faq/index.md#mes-données-sont-elles-envoyées-à-lia)

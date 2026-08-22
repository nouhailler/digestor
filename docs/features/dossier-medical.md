# Dossier médical imprimable

## Description

Une synthèse complète de votre journal, mise en page pour être imprimée ou exportée en
PDF et remise à un professionnel de santé.

## Objectif

Arriver en consultation avec un document lisible plutôt qu'un téléphone à faire défiler.

## Prérequis

Des données dans le journal. Le bouton d'impression est désactivé si le dossier est vide.

## Comment l'utiliser

1. **Menu `⋯` → Dossier médical**.
2. Parcourez le document à l'écran.
3. **Imprimer / PDF** → utilisez la boîte d'impression du système (« Enregistrer au
   format PDF » sur la plupart des plateformes).

## Options

Le dossier reprend, dans l'ordre :

| Section | Contenu |
|---|---|
| **Profil santé** | Nom, âge, sexe, conditions, phase FODMAP, intolérances, allergies, antécédents, médicaments |
| **Traitements & compléments** | Cures en cours et passées |
| **Réintroductions FODMAP** | Tests, verdicts, doses |
| **Synthèse des symptômes** | Fréquence et sévérité sur la période |
| **Évolution sur la période** | Graphes imprimables (sévérité, Bristol) |
| **Transit & hydratation** | Bristol, nombre de selles, hydratation moyenne (L/j) |
| **Aliments les plus fréquents** | Classement |
| **Corrélations personnalisées** | Vos données uniquement |
| **Amines biogènes (histamine)** | Charge et corrélation |
| **Journal détaillé** | Jour par jour |

## Paramètres associés

[Profil santé](profil-sante.md), [Traitements](traitements-complements.md),
[Réintroductions](reintroductions-fodmap.md).

## Données utilisées

Toutes les tables locales, en lecture. **Aucun envoi réseau** : la mise en forme et
l'impression sont entièrement locales.

## Résultat

Un document imprimable. Seul le dossier est imprimé : le reste de l'interface est masqué
pendant l'impression.

## Fonctionnement hors connexion

Intégral.

## Fonctionnement en ligne

Identique.

## Limites

- Le rendu dépend du moteur d'impression du navigateur ; les sauts de page peuvent
  varier.
- Le document reprend les corrélations telles quelles, avec leurs réserves : ce n'est
  pas un compte rendu médical.
- Le dossier n'est pas paramétrable (pas de sélection de période ni de sections).

## Erreurs possibles

Aucune.

## Dépannage

[L'impression est vide ou mal découpée](../troubleshooting/impression-pdf.md)

## FAQ

- [Comment obtenir un PDF ?](../faq/index.md#comment-obtenir-un-pdf)

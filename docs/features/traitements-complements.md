# Traitements & compléments

## Description

Un registre des cures : antifongiques, antibiotiques, probiotiques, prébiotiques,
compléments, phytothérapie, médicaments.

## Objectif

Situer les variations de symptômes par rapport aux traitements en cours, et fournir
cette chronologie au médecin.

## Prérequis

Aucun.

## Comment l'utiliser

1. **Menu `⋯` → Traitements & compléments**.
2. Renseignez : **Nom** (ex. Nystatine, Berbérine, *L. rhamnosus*), **type**,
   **dose** (ex. 500 mg), **fréquence** (ex. 2× / jour), **date de début**,
   **date de fin** (vide = en cours), **notes**.
3. Enregistrez.

## Options

| Type | |
|---|---|
| Antifongique · Antibiotique · Probiotique · Prébiotique | |
| Complément · Phytothérapie · Médicament · Autre | |

| Action sur une ligne | Effet |
|---|---|
| **Marquer terminé aujourd'hui** | Pose la date de fin à aujourd'hui |
| **Modifier** | Réouvre le formulaire |
| **Supprimer** | Retire l'entrée |

Les traitements **en cours** sont affichés en premier, puis les autres du plus récent
au plus ancien.

## Paramètres associés

Aucun.

## Données utilisées

Table `treatments` : `id`, `name`, `kind`, `dose?`, `frequency?`, `startDate`,
`endDate?`, `notes?`. Incluse dans la [sauvegarde](sauvegarde-restauration.md).

## Résultat

Une liste chronologique, reprise dans le [dossier médical](dossier-medical.md).

## Fonctionnement hors connexion

Intégral.

## Fonctionnement en ligne

Identique.

## Limites

- Aucun rappel de prise, aucune notification.
- Les traitements ne sont **pas** croisés automatiquement avec les symptômes : ils
  n'entrent pas dans le calcul des corrélations.

## Erreurs possibles

Aucune.

## Dépannage

Aucune procédure spécifique.

## FAQ

- [Digestor peut-il me rappeler de prendre mon traitement ?](../faq/index.md#digestor-peut-il-menvoyer-des-rappels)

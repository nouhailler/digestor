# Journal quotidien

## Description

La fiche du jour : ce que vous avez mangé, à quelle heure, en quelle quantité, et
comment la journée s'est passée dans l'ensemble.

## Objectif

Constituer, jour après jour, le matériau brut à partir duquel Digestor calcule les
statistiques, les courbes et les corrélations. Sans saisie, rien n'est déduit.

## Prérequis

Aucun. Ni compte, ni réseau, ni clé IA.

## Comment l'utiliser

1. Onglet **Journal**, choisissez la date.
2. Touchez le **crayon** pour passer en édition.
3. **Ajouter un repas** → réglez l'heure (`HH:MM`).
4. Tapez un aliment dans **« ajouter un aliment… »** puis `Entrée`.
   L'autocomplétion propose d'abord vos **favoris ★**, puis les aliments **récents**
   (aujourd'hui / hier / avant-hier), puis le dictionnaire.
5. La couleur est devinée ; touchez la chip pour la corriger (🔴 → 🟢 → ⚪).
6. Facultatif : **quantité**, **composition**, **symptômes après ce repas**, **satiété**.
7. Ressortez du mode édition. La sauvegarde a déjà eu lieu.

### Quantités

L'icône **balance** d'une chip ouvre le réglage de quantité : un nombre et une unité.

| Unité | Affichage | Pas | Valeur initiale |
|---|---|---|---|
| nombre seul | `2` | 1 | 1 |
| càc | cuillère à café | 0,5 | 1 |
| càs | cuillère à soupe | 0,5 | 1 |
| pincée | pincée(s) | 1 | 1 |
| portion | portion(s) | 0,5 | 1 |
| poignée | poignée(s) | 0,5 | 1 |
| tranche | tranche(s) | 0,5 | 1 |
| verre | verre(s) | 0,5 | 1 |
| bol | bol(s) | 0,5 | 1 |
| g | grammes | 10 | 50 |
| ml | millilitres | 10 | 100 |

La quantité est **facultative** ; sans elle, l'aliment reste « non précisé ». Elle ne
peut pas descendre sous un pas (jamais nulle ni négative).

### Composition du repas

Chips **Protéiné** / **Fibres** / **Sucré**, multi-sélection. Elles n'affectent que la
**durée de satiété attendue** — voir [Satiété](satiete.md).

### Badge de qualité du jour

Proposé automatiquement d'après le cumul des symptômes effectifs de la journée :

| Badge | Règle |
|---|---|
| 🟢 **bonne** | Aucun symptôme, ou au plus 1 symptôme léger |
| 🔴 **difficile** | ≥ 4 symptômes actifs **ou** ≥ 2 symptômes sévères |
| 🟠 **correcte** | Entre les deux |

Un toucher sur le badge force la valeur ; la valeur forcée l'emporte partout
(agenda de la semaine, statistiques, dossier médical).

## Options

- Suppression d'un aliment (croix sur la chip) ou d'un repas (corbeille).
- Enregistrement d'un repas comme [modèle](modeles-de-repas.md) (icône signet).
- Ajout d'un repas **depuis un modèle**.
- **Notes** libres du jour.

## Paramètres associés

Aucun réglage global. Voir [Profil santé](profil-sante.md) pour le nom affiché en
en-tête.

## Données utilisées

Un enregistrement `DayEntry` par date (clé primaire = date ISO), table `days`.
Détail des champs : [Formats de données](../reference/data-formats.md#dayentry).

## Résultat

La journée alimente : le badge de qualité, l'agenda et les indicateurs de la
[Semaine](../guide/semaine.md), les graphes de l'[Évolution](../guide/evolution.md),
les [corrélations](correlations.md) et le [dossier médical](dossier-medical.md).

## Fonctionnement hors connexion

Intégral. Aucune requête réseau n'est émise pour la saisie.

## Fonctionnement en ligne

Identique. Le réseau n'apporte rien de plus à cette fonction.

## Limites

- Une seule fiche par date : deux « versions » d'un même jour ne coexistent pas.
- L'heure d'un repas est stockée en `HH:MM` sans fuseau horaire.
- La classification automatique d'un aliment repose sur un dictionnaire embarqué : un
  aliment inconnu est classé **neutre** par défaut, à corriger d'un toucher.

## Erreurs possibles

Aucun message d'erreur propre à la saisie. En cas de problème d'écriture, voir
[Mes données ont disparu](../troubleshooting/donnees-disparues.md).

## Dépannage

- [Erreur au démarrage](../troubleshooting/erreur-au-demarrage.md)
- [Mes données ont disparu](../troubleshooting/donnees-disparues.md)

## FAQ

- [Faut-il enregistrer manuellement ?](../faq/index.md#faut-il-enregistrer-manuellement)
- [Comment corriger la couleur d'un aliment ?](../faq/index.md#comment-corriger-la-couleur-dun-aliment)

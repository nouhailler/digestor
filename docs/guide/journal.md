# Écran — Journal

## Objectif

Saisir une journée : repas, aliments, symptômes, satiété, transit, hydratation,
contexte et notes. C'est le seul écran où l'on écrit des données de journal ; tous
les autres écrans en dérivent.

## Accès

Onglet **Journal** (premier onglet de la barre du bas). C'est l'écran ouvert au
démarrage.

## Éléments de l'interface

### Navigation de date

| Élément | Rôle |
|---|---|
| **Jour précédent** / **Jour suivant** | Décale d'un jour |
| Champ **date** | Saisie directe (sélecteur natif du système) |
| **Aller à aujourd'hui** | Affiché seulement si la date affichée n'est pas aujourd'hui |
| Boutons ronds flottants (▲ / ▼) | Jour précédent / suivant, accessibles au pouce |

### Carte du jour

| Élément | Rôle |
|---|---|
| **Badge de qualité** (à gauche du titre) | 🟢 bonne / 🟠 correcte / 🔴 difficile. Proposé automatiquement d'après le cumul des symptômes, **modifiable d'un toucher** |
| **Crayon** (à droite) | Bascule lecture ⇄ édition |
| **Charge en amines** | Résumé du jour (faible / modérée / élevée), avec le détail des aliments concernés au toucher |
| **Repas du jour** | Un bloc par repas |
| **Symptômes** | Symptômes de niveau *journée* (indépendants des repas) + champ « Moment » |
| **Notes** | Texte libre du jour |
| **Transit & hydratation** | Bristol, nombre de selles, eau (L), délai de digestion (h) |
| **Bien-être & contexte** | Stress, sommeil (h), règles |
| **Analyser ma journée avec l'IA** | Sous la carte, si la journée contient des données |

### Bloc « repas » (en édition)

| Élément | Rôle |
|---|---|
| **Heure** | `HH:MM`, affichée « 7 h 30 » |
| **Chips d'aliments** | Un toucher fait tourner la catégorie 🔴 → 🟢 → ⚪ |
| Icône **balance** sur une chip | Ouvre le réglage de [quantité](../features/journal-quotidien.md#quantités) |
| **ajouter un aliment…** | Champ avec autocomplétion : favoris ★ d'abord, puis récents, puis dictionnaire |
| **Composition** | Chips *Protéiné* / *Fibres* / *Sucré* (multi-sélection) |
| **Symptômes après ce repas** | Grille repliable de pastilles d'intensité |
| **Satiété** | Relevés faim / énergie / envie de sucre, aux 4 checkpoints |
| Icône **signet** | Enregistre ce repas comme [modèle](../features/modeles-de-repas.md) |
| Icône **corbeille** | Supprime le repas |
| **Ajouter un repas** / **Depuis un modèle** | En bas de la section Repas |

## Actions et résultats

| Action | Résultat |
|---|---|
| Toucher le crayon | La carte passe en édition ; les champs deviennent modifiables |
| Ajouter/modifier n'importe quoi | **Sauvegarde automatique** (écriture différée dans IndexedDB), pas de bouton *Enregistrer* |
| Toucher une chip d'aliment **en lecture** | Ouvre la [fiche d'analyse de l'aliment](../features/analyse-aliment-ia.md) |
| Toucher une chip d'aliment **en édition** | Change sa catégorie de couleur |
| Toucher une pastille de symptôme | Fait varier l'intensité : absent → léger → modéré → sévère → absent |
| Toucher le libellé d'un symptôme | Ouvre sa [fiche détaillée](../features/encyclopedie-symptomes.md) |
| Toucher le badge de qualité | Force la qualité du jour (surcharge la suggestion automatique) |
| **Analyser ma journée avec l'IA** | Ouvre l'[analyse de journée](../features/analyse-journee-ia.md) |

## Cas particuliers

- **Journée vide** : le bouton d'analyse IA n'apparaît pas tant que le jour ne contient
  ni repas ni symptôme.
- **Symptômes du jour vs par repas** : si tous vos symptômes sont notés par repas, la
  section « Symptômes » de la journée affiche « Renseignés par repas ci-dessus ».
  Les statistiques utilisent toujours le **maximum** entre les deux niveaux.
- **Durée de satiété** : une ligne automatique `⏱ Satiété (HH:MM) : …` est ajoutée dans
  les **Notes du jour**. Elle est réécrite à chaque mise à jour et **ne touche pas** votre
  texte libre.
- **Premier lancement** : l'écran s'ouvre sur la première journée de démonstration,
  pas sur aujourd'hui.

## Erreurs possibles

| Situation | Ce que vous voyez | Que faire |
|---|---|---|
| Erreur au démarrage | Bandeau rouge « Un problème est survenu au démarrage… » avec le détail | [Dépannage](../troubleshooting/erreur-au-demarrage.md) |
| Écran en erreur | Message de repli de la barrière d'erreur | Changez d'onglet et revenez ; sinon rechargez |
| IA non configurée | La feuille d'analyse propose **Paramètres IA** | [Configurer l'IA](../settings/index.md#assistant-ia-openrouter) |

## Où aller ensuite

→ [Semaine](semaine.md) pour le récapitulatif · [Évolution](evolution.md) pour les
courbes · [Fonctionnalités du journal](../features/journal-quotidien.md)

# Écran — Aliments

## Objectif

Consulter et enrichir la **bibliothèque d'aliments** : ceux de vos repas, le
dictionnaire embarqué (~260 aliments) et vos favoris, avec pour chacun une analyse
FODMAP / SIBO / candidose / amines mise en cache localement.

## Accès

Onglet **Aliments** (2ᵉ onglet).

## Éléments de l'interface

### Sélecteur de portée

| Portée | Contenu |
|---|---|
| **De mes repas** | Uniquement les aliments réellement saisis dans le journal (plus les fiches analysées) |
| **Catalogue** | Le précédent + le dictionnaire embarqué |
| **Favoris ★** | Vos aliments marqués d'une étoile (dont les produits scannés) |

Chaque bouton affiche le nombre d'entrées.

### Recherche

Champ **« Rechercher un aliment (3 lettres min.) ou en analyser un nouveau… »**.
Le filtre est un **préfixe** : à partir de 3 lettres, jusqu'à 10 propositions du
catalogue. Si le terme n'existe pas, une entrée **« Analyser « … » »** apparaît.

### Actions

| Bouton | Effet | Réseau / IA |
|---|---|---|
| **Scanner un produit (code-barres)** | Ouvre le [scanner](../features/scan-code-barres.md) | Réseau (Open Food Facts), puis IA |
| **Idées de repas adaptées** | [Suggestions de repas](../features/idees-repas-ia.md) | IA |
| **Analyser les N aliments non analysés** | Analyse en série tous les aliments sans fiche de la portée courante | IA |
| **Trouver les doublons (N)** | Regroupe les variantes proches (pluriel, accents) | Local |
| **Enrichir N amines avec l'IA** | Complète les profils d'amines hors dictionnaire | IA |
| **Compléter les amines (hors-ligne)** | Complète depuis le dictionnaire embarqué | Local |
| **Exporter le référentiel d'aliments (N)** | Télécharge tout le catalogue en JSON | Local |
| **Importer un référentiel** | Fusionne un référentiel JSON complété | Local |

### Liste des aliments

Chaque ligne affiche : pastille de catégorie, nom, badge d'amines, résumé de l'analyse
(ou « Non analysé — touchez pour analyser »), badge de niveau FODMAP, et les actions
★ (favori), gomme (effacer l'analyse), corbeille (suppression définitive).

Un aliment **en cours de génération** remonte en tête de liste avec un badge
« Génération… » et une bordure verte.

## Actions et résultats

| Action | Résultat |
|---|---|
| Toucher une ligne | Ouvre la [fiche de l'aliment](../features/analyse-aliment-ia.md) |
| Toucher ★ | Ajoute / retire des favoris (les favoris remontent dans l'autocomplétion du Journal) |
| Toucher la **gomme** | Efface l'analyse en cache ; l'aliment reste et peut être ré-analysé |
| Toucher la **corbeille** | **Suppression définitive** : analyse + favori + **toutes les occurrences dans vos repas**. Une confirmation précise si l'historique sera modifié |
| **Analyse en masse** > 20 aliments | Demande une confirmation avant d'enchaîner les requêtes |
| Bouton **stop** pendant un lot | Interrompt la série ; les aliments déjà traités sont conservés |

## Cas particuliers

- Une entrée issue **uniquement du dictionnaire embarqué** n'est pas supprimable :
  elle est marquée « intégré ».
- **Amines** : l'enrichissement hors-ligne est toujours tenté avant l'enrichissement IA
  (le dictionnaire est gratuit et instantané).
- Sans clé IA, la bannière **« Assistant IA non configuré »** s'affiche en haut et les
  boutons IA renvoient vers les paramètres.

## Erreurs possibles

| Situation | Message |
|---|---|
| Échec d'un lot | `« <aliment> » : <message de l'erreur>` en rouge ; le lot s'arrête |
| Aucun aliment à compléter | « Aucun complément hors-ligne : les aliments connus du dictionnaire ont déjà leur profil amines. » |
| Lot interrompu | « Interrompu — N aliment(s) enrichi(s) ; les autres restent à faire (reprise possible). » |

Voir aussi [Codes et erreurs](../reference/errors.md).

## Où aller ensuite

→ [Analyse d'un aliment](../features/analyse-aliment-ia.md) ·
[Scan de code-barres](../features/scan-code-barres.md) ·
[Référentiel d'aliments](../features/referentiel-aliments.md)

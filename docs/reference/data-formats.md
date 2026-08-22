# Formats de données

Formats des fichiers manipulés par l'application. Tous sont du **JSON**.

## Sauvegarde complète

Produit par **Menu `⋯` → Sauvegarder mes données (JSON)**, nommé
`digestor-AAAA-MM-JJ.json`. Accepté par **Restaurer (JSON)**.

```
{
  "app": "digestor",
  "version": 8,
  "exportedAt": "2026-08-22T09:12:00.000Z",
  "profile": { … },
  "days": [ … ],
  "foodInsights": [ … ],
  "dayAnalyses": [ … ],
  "symptomNotes": [ … ],
  "organNotes": [ … ],
  "favorites": [ … ],
  "treatments": [ … ],
  "reintroChallenges": [ … ],
  "mealTemplates": [ … ],
  "mealSuggestions": { … },
  "encyclopediaExtra": { … },
  "settings": { "modelId": "…", "onboardingDone": true }
}
```

| Champ | Depuis la version | Contenu |
|---|---|---|
| `profile`, `days` | 1 | Profil santé et journal |
| `foodInsights` | 2 | Fiches d'aliments analysées |
| `dayAnalyses` | 3 | Analyses IA de journées |
| `symptomNotes`, `mealSuggestions`, `encyclopediaExtra`, `settings` | 4 | Fiches de symptômes, idées de repas, encyclopédie enrichie, réglages |
| `organNotes` | 5 | Approfondissements d'organes |
| `favorites` | 6 | Aliments favoris |
| `treatments`, `reintroChallenges` | 7 | Traitements et réintroductions |
| `mealTemplates` | 8 | Modèles de repas |

> La **clé API** n'est jamais présente. Le cache des rapports de période n'est pas
> exporté (il est régénérable) et il est **vidé** à l'import.

Un fichier est refusé si `app` ne vaut pas `"digestor"` ou si `days` n'est pas un tableau.

## DayEntry

Une journée. Clé primaire : `date`.

| Champ | Type | Description |
|---|---|---|
| `date` | `"AAAA-MM-JJ"` | Clé primaire |
| `quality` | `"difficile" \| "correcte" \| "bonne" \| null` | Badge (forcé ou `null` si automatique) |
| `meals` | `Meal[]` | Repas de la journée |
| `symptoms` | `{ <symptôme>: "absent" \| "leger" \| "modere" \| "severe" }` | Symptômes de niveau journée |
| `symptomTiming` | texte | Ex. « 2 h après repas du soir » |
| `notes` | texte | Notes libres (peut contenir la ligne auto `⏱ Satiété (HH:MM) : …`) |
| `hydrationL` | nombre | Litres d'eau |
| `stool` | `{ bristol?: 1..7, count?: nombre, label?: texte }` | Transit |
| `digestionDelayH` | nombre | Délai de digestion ressenti, en heures |
| `stress` | intensité | Aucun · Léger · Modéré · Élevé |
| `sleepH` | nombre | Heures de sommeil |
| `menstrual` | booléen | Règles ce jour |

### Meal

| Champ | Type | Description |
|---|---|---|
| `id` | texte | Identifiant |
| `time` | `"HH:MM"` | Heure du repas |
| `foods` | `FoodItem[]` | Aliments |
| `tags` | `("proteine" \| "fibres" \| "sucre")[]` | Composition dominante |
| `symptoms` | map symptôme → intensité | Symptômes après ce repas |
| `satiety` | `SatietyCheck[]` | Relevés de satiété |

### FoodItem

| Champ | Type | Description |
|---|---|---|
| `id` | texte | Identifiant |
| `name` | texte | Nom affiché |
| `category` | `"pro" \| "beneficial" \| "neutral"` | Catégorie (couleur) |
| `quantity` | `{ amount: nombre, unit: … }` | Facultatif |

Unités possibles : `unite`, `cac`, `cas`, `pincee`, `portion`, `poignee`, `tranche`,
`verre`, `bol`, `g`, `ml`.

### SatietyCheck

| Champ | Type | Description |
|---|---|---|
| `checkpoint` | `"immediate" \| "1h" \| "2h" \| "3h"` | Moment du relevé |
| `hungerIntensity` | 0–100 | Faim |
| `energyLevel` | 0–100 | Énergie |
| `sugarCraving` | 0–100 | Envie de sucre |
| `satietyType` | `"legere" \| "lourde" \| "ballonnement"` | Pertinent surtout à *immediate* et *+1 h* |
| `timestamp`, `notes` | ISO, texte | Facultatifs |

## Import de repas

Collé dans **Entrer un repas (voix → JSON)**. Racine attendue :

```
{ "app": "digestor", "days": [ { "date": "…", "meals": [ … ], … } ] }
```

Peut porter, par jour : `meals` (avec `time`, `foods`, `tags`, fiches FODMAP par
aliment), `symptoms`, `symptomTiming`, `hydrationL`, `stool`, `digestionDelayH`,
`quality`, `notes`. Le prompt de référence est fourni dans l'application
(**Copier le prompt**) et versionné dans
[`docs/claude-web-repas-prompt.md`](../claude-web-repas-prompt.md).

## Import de satiété

Collé dans **Entrer votre satiété (voix → JSON)**. Racine attendue :

```
{ "app": "digestor", "type": "satiety", "sets": [ { "mealTime": "12:30", "checks": [ … ] } ] }
```

Le rattachement au repas se fait par **date + `mealTime`**. Prompt versionné :
[`docs/claude-web-satiete-prompt.md`](../claude-web-satiete-prompt.md).

## Référentiel d'aliments

Produit par **Exporter le référentiel d'aliments**, accepté par
**Importer un référentiel**. Racine attendue :

```
{ "type": "food-reference", "foods": [ … ] }
```

Contient le catalogue d'aliments et leurs profils (FODMAP, SIBO, candidose, amines).
**Ne contient ni journal, ni symptômes, ni profil santé.** L'import **fusionne** sans
écraser les analyses en place. Prompt de complétion des amines :
[`docs/claude-web-amines-prompt.md`](../claude-web-amines-prompt.md).

## Exports texte et image

| Fichier | Produit par | Contenu |
|---|---|---|
| `digestor-analyse-AAAA-MM-JJ.txt` | Analyse de journée → **Télécharger** | Verdict, résumé, déclencheurs, pistes |
| `digestor-aliment-<nom>.txt` | Fiche d'aliment → **Partager le texte** | Fiche mise en forme |
| `digestor-aliment-<nom>.png` | Fiche d'aliment → **Partager l'image** | Carte visuelle |

## Tables IndexedDB

Base `digestor`, schéma **v8**.

| Table | Clé primaire | Contenu |
|---|---|---|
| `days` | `date` | Journées |
| `meta` | `key` | Profil, config IA, réglages, idées de repas, encyclopédie enrichie |
| `foodInsights` | `key` (nom normalisé) | Fiches d'aliments |
| `dayAnalyses` | `date` | Analyses IA de journées |
| `symptomNotes` | `key` | Fiches de symptômes |
| `organNotes` | `key` | Approfondissements d'organes |
| `favorites` | `key` | Favoris |
| `treatments` | `id` | Traitements |
| `reintroChallenges` | `id` | Réintroductions |
| `mealTemplates` | `id` | Modèles de repas |
| `periodAnalyses` | `key` | Rapports de période (non exportés) |

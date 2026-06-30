# Saisie vocale satiété → Digestor (via un Projet Claude Web)

Ce guide explique comment dicter votre **ressenti après un repas** (faim, énergie, envie de sucre)
à **Claude (claude.ai)** et obtenir un **JSON** à coller dans Digestor
(menu **⋯ → « Entrer votre satiété (voix → JSON) »**).

La satiété est rattachée au bon repas grâce à sa **date** et à son **heure** (`mealTime`). Renseignez-la
de préférence juste après le repas, ou plus tard en précisant l'heure du repas concerné. Tant qu'aucun
relevé n'est saisi, la zone « Satiété » du repas reste vide — c'est normal.

> **Astuce** : utilisez un **Projet distinct** de celui des repas (ex. « Digestor — satiété »).
> La corrélation satiété ↔ composition du repas se calcule **localement dans Digestor** (onglet
> Évolution) : Claude Web sert uniquement à transcrire votre ressenti, il n'a pas besoin de connaître
> le repas précédent.

## 1. Créer le Projet Claude Web

1. Sur [claude.ai](https://claude.ai), créez un **nouveau Projet** (ex. « Digestor — satiété »).
2. Collez le prompt de la section 3 dans les **instructions du projet**.
   *(Il est aussi copiable depuis Digestor, panneau « Comment générer ce JSON ? ».)*

## 2. Utilisation au quotidien

1. Ouvrez une conversation dans ce projet et **parlez** (dictée vocale), ex. :
   > « Après mon déjeuner de midi et demi j'étais bien calé, un peu lourd. Deux heures après,
   > grosse fringale de sucre et un coup de barre. »
2. Claude répond **uniquement** par un bloc JSON.
3. **Copiez**-le, ouvrez Digestor → **⋯ → Entrer votre satiété**, **collez**, **Prévisualisez**,
   puis **Importez**. Les relevés sont rattachés au repas correspondant.

## 3. Le prompt (à coller dans le Projet)

> Copiable aussi depuis Digestor (bouton « Copier le prompt »).

~~~
Tu es l'assistant de saisie de satiété de Digestor, un journal alimentaire et de symptômes
(candidose intestinale, SIBO, SII). Tu transformes la description orale du ressenti APRÈS un repas
en un objet JSON strictement conforme au format ci-dessous. La satiété sera rattachée au repas du
journal correspondant grâce à sa DATE et son HEURE.

RÈGLES GÉNÉRALES
- Réponds UNIQUEMENT par un bloc de code JSON. Aucun texte avant ou après.
- N'invente pas de relevé non mentionné. En cas de doute sérieux, pose UNE question.
- Date : "date" au format "AAAA-MM-JJ" (défaut = aujourd'hui ; "hier" = jour précédent).
- "mealTime" : heure du repas concerné au format "HH:MM" (ex. le déjeuner de 12h30 → "12:30").
  C'est la clé qui relie la satiété au bon repas : demande-la si elle manque.

CHECKPOINTS — pour chaque moment renseigné, un objet dans "checks" :
- "checkpoint" ∈ "immediate" (juste après le repas), "1h", "2h", "3h".
- Trois mesures VAS, entiers de 0 à 100 :
  - "hungerIntensity" : 0 = aucune faim → 100 = faim extrême.
  - "energyLevel" : 0 = coup de barre / fébrile → 100 = énergie stable et claire.
  - "sugarCraving" : 0 = aucune envie → 100 = envie de sucre irrépressible.
  Convertis le langage courant en nombre (ex. « plus du tout faim » ≈ 5, « grosse fringale » ≈ 85,
  « un petit creux » ≈ 40). Si une mesure n'est pas évoquée, mets 50 (neutre).
- "satietyType" (optionnel, surtout pour "immediate" et "1h") ∈ "legere" | "lourde" | "ballonnement".
- "notes" : remarque libre (optionnel).

Plusieurs repas dans la même réponse → mets plusieurs objets dans "sets".

FORMAT DE SORTIE
```json
{
  "app": "digestor",
  "type": "satiety",
  "version": 1,
  "sets": [
    {
      "date": "AAAA-MM-JJ",
      "mealTime": "12:30",
      "checks": [
        {
          "checkpoint": "immediate",
          "hungerIntensity": 10,
          "energyLevel": 70,
          "sugarCraving": 5,
          "satietyType": "lourde"
        },
        {
          "checkpoint": "2h",
          "hungerIntensity": 60,
          "energyLevel": 40,
          "sugarCraving": 80
        }
      ]
    }
  ]
}
```
~~~

## 4. Notes sur le format accepté par Digestor

- **Rattachement** : Digestor cherche le repas du jour à l'heure `mealTime`. À défaut d'heure exacte,
  il prend le **repas le plus proche** ; sans `mealTime`, le **dernier repas** du jour (signalé).
  S'il n'y a aucun repas ce jour-là, le relevé n'est pas rattaché (signalé).
- **Un relevé par checkpoint** : réimporter le même checkpoint **remplace** la valeur précédente.
- **VAS** : entiers 0-100 (les valeurs hors bornes sont ramenées dans l'intervalle ; une mesure
  absente vaut 50).
- **Tolérant** : Digestor extrait le JSON même entouré de texte/```` ```json ````, accepte un relevé
  unique sans `sets`, et reconnaît des synonymes de checkpoint (`immédiat`, `+1h`, `2 h`…) et de type
  (`légère`, `lourd`, `ballonnements`…).
- **Date absente** → la journée actuellement ouverte dans le Journal.

## 5. Confidentialité

La génération se fait dans Claude Web ; l'import dans Digestor est un simple copier-coller, **100 % local**.
Aucune clé API n'est requise pour cette fonction.

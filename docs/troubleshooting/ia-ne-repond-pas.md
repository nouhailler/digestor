# L'IA ne répond pas

## Symptôme

Une analyse reste en chargement, échoue, ou affiche un message en rouge.

## Causes possibles

| Cause | Message typique |
|---|---|
| Clé ou modèle absent | La feuille propose **Paramètres IA** au lieu d'analyser |
| Clé invalide ou expirée | `OpenRouter (401) : …` |
| Quota du modèle gratuit atteint | `OpenRouter (429) : …` |
| Modèle indisponible | `OpenRouter (404) : …` |
| Modèle bavard ou non conforme | `Le modèle n'a pas renvoyé de JSON exploitable. Essayez un autre modèle.` |
| Réponse vide | `Réponse vide du modèle.` |
| Pas de réseau | Erreur réseau du navigateur |

## Diagnostic

1. Menu `⋯` → **Assistant IA (OpenRouter)** : la clé est-elle renseignée ? Un **modèle
   actif** est-il rappelé en bas de la feuille ?
2. Touchez **Rechercher les modèles gratuits (:free)** : si la liste revient, la clé est
   valide et le réseau fonctionne.
3. Vérifiez votre connexion.

## Solution

1. Ressaisissez la clé (elle commence par `sk-or-v1-`) et validez avec **OK**.
2. Relancez la recherche de modèles et **sélectionnez-en un autre** : les modèles
   gratuits sont inégaux, certains ne respectent pas le format JSON demandé.
3. En cas de quota (`429`), attendez ou changez de modèle.
4. Réessayez : les fonctions non-IA restent disponibles entre-temps.

## Si le problème persiste

Vérifiez l'état de votre clé sur <https://openrouter.ai/keys>. Si plusieurs modèles
échouent de la même façon, le problème vient du service, pas de Digestor.

## Informations à fournir au support

Le message d'erreur exact (avec son code), l'identifiant du modèle sélectionné, et la
fonction utilisée (aliment / journée / période / idées de repas).

# Aucun modèle gratuit trouvé

## Symptôme

Après **Rechercher les modèles gratuits (:free)**, le message
*« Aucun modèle gratuit trouvé. »* s'affiche, ou une erreur `OpenRouter (…) : …`.

## Causes possibles

- La clé saisie est invalide, incomplète ou comporte des espaces.
- L'offre de modèles gratuits d'OpenRouter a changé (le catalogue évolue).
- Le réseau est coupé ou filtré (proxy, pare-feu d'entreprise).

## Diagnostic

1. Vérifiez que la clé commence par `sk-or-v1-` et qu'elle a été collée entièrement.
2. Testez le réseau en ouvrant une autre page.
3. Regardez le message : une erreur `401` désigne la clé, une erreur réseau désigne la
   connexion.

## Solution

1. Recopiez la clé depuis <https://openrouter.ai/keys> (sans espace avant/après) et
   validez avec **OK**.
2. Relancez **Rechercher les modèles gratuits (:free)**.
3. Sur un réseau restreint, essayez depuis une connexion mobile.

## Si le problème persiste

Un modèle est considéré comme gratuit s'il porte le suffixe `:free` **ou** si son tarif
est nul. Si OpenRouter n'en propose plus aucun sur votre compte, les fonctions IA
resteront indisponibles ; **toutes les autres fonctions continuent de marcher**.

## Informations à fournir au support

Le message affiché, et si la recherche fonctionne depuis un autre réseau.

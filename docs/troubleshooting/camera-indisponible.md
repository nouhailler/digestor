# La caméra ne s'ouvre pas

## Symptôme

À l'ouverture du scanner de produit :
*« Caméra indisponible. Saisissez le code-barres à la main. »*

## Causes possibles

- Permission caméra refusée (une fois ou définitivement).
- Page servie en **HTTP** et non en HTTPS : les navigateurs refusent l'accès caméra.
- Caméra occupée par une autre application.
- Appareil sans caméra (ordinateur de bureau).

## Diagnostic

1. L'adresse commence-t-elle par `https://` ?
2. Une autre application utilise-t-elle la caméra en ce moment ?
3. Testez la caméra sur un autre site pour isoler le problème.

## Solution

1. Réautorisez la caméra — voir [Permissions](../permissions/index.md#comment-réactiver).
2. Fermez les applications qui utilisent la caméra, puis rouvrez le scanner.
3. Rechargez la page après avoir changé l'autorisation (certains navigateurs l'exigent).
4. **Contournement immédiat** : saisissez le code-barres à la main dans le champ prévu
   (8 à 14 chiffres), ou entrez simplement le nom du produit.

## Si le problème persiste

Sur iPhone, la lecture passe par une bibliothèque chargée à la demande : la première
ouverture peut être lente sur une connexion faible. Patientez quelques secondes avant de
conclure à un échec.

## Informations à fournir au support

Appareil, système, navigateur, adresse en HTTPS ou non, et si la permission a été
accordée.

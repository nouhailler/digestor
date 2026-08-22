# Un graphe ne s'affiche pas

## Symptôme

L'écran Évolution affiche *« Pas encore assez de données sur cette période. »*, ou
certaines cartes sont absentes.

## Causes possibles

Chaque bloc n'apparaît **que si les données correspondantes existent**.

| Bloc absent | Il manque |
|---|---|
| Évolution des selles | Aucun relevé de Bristol sur la période |
| Tendance amines | Aucun repas exploitable |
| Symptômes après les repas | Aucun symptôme noté **au niveau d'un repas** |
| Satiété | Trop peu de repas avec relevés de satiété |
| Déclencheurs / Pistes récurrents | Aucune analyse IA de journée en cache |
| Récurrence des aliments | Aucun repas dans les 30 derniers jours renseignés |

## Diagnostic

1. Élargissez la plage : **Semaine** → **4 semaines** → **Tout**.
2. Vérifiez dans le Journal qu'une journée de la période contient bien la donnée
   attendue.
3. Pour la récurrence : la fenêtre de 30 jours se termine au **dernier jour renseigné**,
   pas forcément aujourd'hui.

## Solution

Saisissez la donnée manquante, ou changez de plage. Les graphes se recalculent en direct.

## Si le problème persiste

Si l'écran reste sur « Chargement des graphes… », c'est le chargement différé de la
librairie de graphes : vérifiez le réseau au premier accès, puis l'écran fonctionne hors
ligne.

## Informations à fournir au support

Plage choisie, période réellement saisie, et le bloc attendu.

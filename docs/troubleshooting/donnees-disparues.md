# Mes données ont disparu

## Symptôme

Le journal est vide, ou seules les deux journées de démonstration apparaissent, alors
que vous aviez saisi des données.

## Causes possibles

| Cause | Indice |
|---|---|
| Le navigateur a **évincé** le stockage local (manque d'espace, inactivité prolongée — fréquent sur iOS) | Aucun message, tout est vide d'un coup |
| Les **données du site** ont été effacées (nettoyage du navigateur, « effacer l'historique et les données ») | Autres sites également réinitialisés |
| Vous êtes sur un **autre navigateur ou un autre appareil** | Le titre indique « Patient : exemple » |
| Vous êtes en **navigation privée** | Les données disparaissent à la fermeture |
| L'application a été **désinstallée puis réinstallée** | — |

## Diagnostic

1. Vérifiez que vous ouvrez bien Digestor **depuis l'icône d'écran d'accueil** habituelle,
   pas depuis un autre navigateur.
2. Regardez le nom affiché en en-tête : `exemple` signale un profil neuf.
3. Cherchez un fichier `digestor-AAAA-MM-JJ.json` dans vos téléchargements.

## Solution

- **Si vous avez une sauvegarde** : Menu `⋯` → **Restaurer (JSON)** → choisissez le
  fichier le plus récent.
- **Si vous n'en avez pas** : les données ne sont pas récupérables. Il n'existe aucune
  copie serveur.

## Prévention (le point important)

1. Exportez régulièrement (le bandeau vous le rappelle tous les **7 jours**).
2. **Installez** l'application sur l'écran d'accueil : le stockage persistant est plus
   facilement accordé aux applications installées.
3. Ouvrez l'application régulièrement (iOS évince après plusieurs semaines d'inactivité).
4. Ne l'utilisez pas en navigation privée.

## Si le problème persiste

Si l'éviction se répète malgré l'installation, sauvegardez après chaque session de saisie.

## Informations à fournir au support

Système et version (surtout pour iOS), navigateur, application installée ou non, date de
la dernière ouverture avant la disparition.

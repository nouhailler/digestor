# Aide, tutoriel & visites guidées

## Description

Quatre niveaux d'aide intégrée : le tutoriel de bienvenue, les visites guidées ancrées,
l'aide contextuelle `?` et les infobulles.

## Objectif

Rendre l'application compréhensible sans documentation externe — celle-ci venant en
complément.

## Prérequis

Aucun.

## Comment l'utiliser

| Aide | Déclenchement | Contenu |
|---|---|---|
| **Tutoriel de bienvenue** | Au tout premier lancement | 6 écrans : bienvenue, saisie, tendances, IA, boîte à outils, confidentialité & santé |
| **Visite guidée** | À la **première arrivée sur chaque écran** | Bulles ancrées aux vrais éléments, avec halo de mise en évidence |
| **Aide `?`** | Bouton dans l'en-tête | Intro + astuces de l'écran courant, et **« Lancer la visite guidée de cet écran »** |
| **Bandeau d'astuce** | En haut de chaque écran | Une astuce, fermable |
| **Infobulles** | Survol / appui long | Explication d'un libellé, d'une couleur, d'un champ |
| **Documentation complète** | Menu `⋯` → **Aide & documentation** | Cette documentation, ouverte dans un nouvel onglet ; disponible hors connexion |

## Options

**Menu `⋯` → Revoir le tutoriel & les visites guidées** réinitialise **tout** : le
tutoriel se relance, et chaque écran rejouera sa visite à la prochaine arrivée.

Les visites guidées existent pour les cinq écrans : Journal (8 étapes), Aliments
(7 étapes), Semaine (4 étapes), Évolution (5 étapes), Repères (2 étapes).

## Paramètres associés

Aucun.

## Données utilisées

Table `meta` : clé `onboardingDone` (tutoriel vu) et `toursSeen` (liste des écrans dont
la visite a été vue). Ces informations ne sont **pas** exportées, sauf `onboardingDone`
qui figure dans les réglages de la sauvegarde.

## Résultat

Une prise en main progressive, sans répétition une fois les écrans visités.

## Fonctionnement hors connexion

Intégral : tous les textes d'aide sont embarqués.

## Fonctionnement en ligne

Identique.

## Limites

- Une étape de visite dont la cible n'est pas affichée (rendu conditionnel) se replie en
  bulle centrée au lieu d'être ancrée.

## Erreurs possibles

Aucune.

## Dépannage

Aucune procédure spécifique.

## FAQ

- [Comment revoir le tutoriel ?](../faq/index.md#comment-revoir-le-tutoriel)

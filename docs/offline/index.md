# Fonctionnement hors connexion

Digestor est conçu **hors ligne d'abord** : le cœur de l'application ne dépend d'aucun
service. Une fois la page chargée une première fois, le service worker met en cache
l'application entière et elle démarre sans réseau.

## Tableau des fonctions

| Fonction | Hors ligne | En ligne | Synchronisation |
|---|---:|---:|---:|
| Saisie du journal (repas, aliments, quantités) | ✅ | ✅ | — |
| Symptômes, satiété, transit, contexte, notes | ✅ | ✅ | — |
| Badge de qualité, score de sévérité | ✅ | ✅ | — |
| Statistiques de la semaine | ✅ | ✅ | — |
| Graphes de l'écran Évolution | ✅ | ✅ | — |
| Corrélations (aliments, contexte, amines) | ✅ | ✅ | — |
| Récurrence des aliments | ✅ | ✅ | — |
| Charge en amines et dictionnaire d'amines | ✅ | ✅ | — |
| Favoris, modèles de repas, traitements, réintroductions | ✅ | ✅ | — |
| Recherche dans le journal | ✅ | ✅ | — |
| Repères, encyclopédie (socle statique), guide digestif | ✅ | ✅ | — |
| Fiches d'aliments / de symptômes **déjà en cache** | ✅ | ✅ | — |
| Dossier médical et impression | ✅ | ✅ | — |
| Sauvegarde et restauration JSON | ✅ | ✅ | — |
| Import vocal (collage du JSON) | ✅ | ✅ | — |
| Import / export du référentiel d'aliments | ✅ | ✅ | — |
| Complément d'amines **hors ligne** | ✅ | ✅ | — |
| Thème, aide, visites guidées | ✅ | ✅ | — |
| **Nouvelle** analyse d'aliment / de journée / de période | ❌ | ✅ | — |
| **Idées de repas**, fiches IA, enrichissement d'encyclopédie | ❌ | ✅ | — |
| **Enrichir les amines avec l'IA** | ❌ | ✅ | — |
| **Scan de produit** (Open Food Facts) | ❌ | ✅ | — |
| **Vérifier les mises à jour** | ❌ | ✅ | — |
| Recherche des modèles gratuits OpenRouter | ❌ | ✅ | — |

## Ce qui est mis en cache

Le service worker précache les fichiers de l'application : JavaScript, CSS, HTML, images
(SVG, PNG, JPEG), polices. Le mode de mise à jour est **automatique** : une nouvelle
version est téléchargée en arrière-plan et appliquée au prochain démarrage complet.

Vos **données** ne sont pas dans ce cache : elles vivent dans IndexedDB, indépendamment.

## Perte de réseau en cours d'usage

- Une analyse IA en cours échoue avec un message d'erreur ; **rien n'est corrompu**.
- Toutes les autres actions continuent normalement.
- Il n'y a **pas de file d'attente** : une analyse échouée n'est pas rejouée plus tard.
  Relancez-la manuellement quand le réseau revient.

## Retour du réseau

Aucune action particulière : il n'y a rien à synchroniser. Les fonctions IA et le
scanner redeviennent simplement disponibles.

## Voir aussi

- [Synchronisation](../sync/index.md)
- [Données et confidentialité](../data/index.md)
- [Limites connues](../reference/limitations.md)

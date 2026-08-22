# Codes et erreurs

Digestor n'utilise **pas de codes d'erreur numériques propres** : les messages sont
rédigés en français et affichés directement à l'endroit concerné. Cette page les
recense tous, tels qu'ils apparaissent dans l'application.

Les seuls codes numériques rencontrés sont ceux renvoyés par **OpenRouter** (codes HTTP),
repris tels quels dans le message.

## Assistant IA — configuration

| Message | Signification | Solution |
|---|---|---|
| `Configurez d'abord la clé OpenRouter et un modèle dans les paramètres IA.` | Une analyse a été demandée sans clé ou sans modèle | Menu `⋯` → [Assistant IA](../settings/index.md#assistant-ia-openrouter) |
| `Aucun modèle gratuit trouvé.` | La recherche n'a renvoyé aucun modèle gratuit | [Aucun modèle gratuit trouvé](../troubleshooting/aucun-modele-gratuit.md) |
| `Échec de la récupération des modèles.` | La requête de liste des modèles a échoué | Vérifiez la clé et le réseau |

## OpenRouter (IA)

| Message | Signification | Solution |
|---|---|---|
| `OpenRouter (401) : …` | Clé invalide ou révoquée | Recopiez la clé depuis openrouter.ai |
| `OpenRouter (403) : …` | Accès refusé au modèle | Choisissez un autre modèle |
| `OpenRouter (404) : …` | Modèle introuvable | Relancez la recherche de modèles |
| `OpenRouter (429) : …` | Quota / limite de débit atteinte | Attendez, ou changez de modèle |
| `OpenRouter a répondu <code> <statut>` | Erreur sans corps JSON exploitable | Réessayez plus tard |
| `Réponse vide du modèle.` | Le modèle n'a rien renvoyé | Changez de modèle |
| `Le modèle n'a pas renvoyé de JSON exploitable. Essayez un autre modèle.` | Réponse non conforme au format demandé | Changez de modèle (les modèles gratuits sont inégaux) |
| `Nom d'aliment vide.` | Analyse lancée sans nom | Saisissez un aliment |
| `Aucune suggestion exploitable. Réessayez.` | Idées de repas : réponse vide après coercition | Relancez ou changez de modèle |
| `Aucun symptôme exploitable. Réessayez.` | Enrichissement d'encyclopédie : réponse vide | Relancez ou changez de modèle |

Voir [L'IA ne répond pas](../troubleshooting/ia-ne-repond-pas.md).

## Scan de produit

| Message | Signification | Solution |
|---|---|---|
| `Code-barres invalide (8 à 14 chiffres attendus).` | Format hors EAN/UPC | Saisissez 8, 12, 13 ou 14 chiffres |
| `Code-barres invalide (8 à 14 chiffres).` | Idem, à la validation manuelle | Idem |
| `Recherche du produit impossible (hors-ligne ?).` | La requête réseau a échoué | Vérifiez la connexion |
| `Recherche du produit indisponible pour le moment.` | Open Food Facts a répondu en erreur | Réessayez plus tard |
| `Produit introuvable dans Open Food Facts (code …).` | Code inconnu de la base | Saisissez le nom du produit |
| `Caméra indisponible. Saisissez le code-barres à la main.` | Permission refusée, caméra absente ou contexte non sécurisé | [La caméra ne s'ouvre pas](../troubleshooting/camera-indisponible.md) |

## Imports (repas, satiété, référentiel)

| Message | Signification | Solution |
|---|---|---|
| `Collez d'abord le JSON généré.` | La zone de texte est vide | Collez le JSON |
| `JSON invalide : vérifiez le copier-coller.` | Le texte n'est pas du JSON exploitable | Recopiez uniquement le bloc JSON |
| `JSON invalide.` | Message générique de repli | Idem |
| `Ce JSON n'est pas au format Digestor.` | Racine inattendue | Utilisez le prompt fourni par l'application |
| `Aucun contenu trouvé. Attendu : { "days": [ { "meals": [...] } ] }.` | Import de repas mal structuré | Vérifiez le format |
| `Aucun repas ni symptôme exploitable dans ce JSON.` | Structure correcte mais contenu vide | Redemandez la génération |
| `Aucun relevé trouvé. Attendu : { "sets": [ { "mealTime": "12:30", "checks": [...] } ] }.` | Import de satiété mal structuré | Vérifiez le format |
| `Aucun relevé de satiété exploitable dans ce JSON.` | Contenu vide | Redemandez la génération |
| `JSON invalide : impossible de lire le fichier.` | Référentiel d'aliments illisible | Vérifiez le fichier |
| `Ce n'est pas un référentiel d'aliments Digestor (attendu : "type": "food-reference" et une liste "foods").` | Mauvais type de fichier | Utilisez un référentiel exporté depuis Digestor |

Voir [Un import JSON est refusé](../troubleshooting/import-json-refuse.md).

## Sauvegarde et restauration

| Message | Signification | Solution |
|---|---|---|
| `Fichier invalide : ce n'est pas un export Digestor.` | Le fichier n'a ni `app: "digestor"` ni liste `days` | Choisissez un fichier `digestor-AAAA-MM-JJ.json` |
| `Échec de l'import.` | Fichier illisible ou erreur d'écriture | Vérifiez le fichier ; voir [Dépannage](../troubleshooting/import-json-refuse.md) |

## Partage d'une fiche d'aliment en image

| Message | Signification | Solution |
|---|---|---|
| `Canvas non disponible.` | Le navigateur ne fournit pas de contexte de dessin | Utilisez **Partager le texte** à la place |
| `Rendu de l'image impossible.` | La conversion en PNG a échoué | Idem |

## Démarrage

| Message | Signification | Solution |
|---|---|---|
| `Un problème est survenu au démarrage (tes données restent en sécurité). Détail : <nom> : <message>` | Erreur pendant l'initialisation de la base | [Erreur au démarrage](../troubleshooting/erreur-au-demarrage.md) |

## Messages informatifs (pas des erreurs)

| Message | Contexte |
|---|---|
| `Pas encore assez de données pour les corrélations alimentaires — continuez à remplir le journal.` | Écran Semaine |
| `Pas encore assez de données sur cette période.` | Écran Évolution |
| `Pas assez de jours renseignés sur cette période pour dégager des tendances.` | Rapport de période |
| `Aucun complément hors-ligne : les aliments connus du dictionnaire ont déjà leur profil amines.` | Écran Aliments |
| `Aucun aliment à enrichir : les autres ont déjà un profil ou sont à amines négligeables.` | Écran Aliments |
| `Interrompu — N aliment(s) enrichi(s) ; les autres restent à faire (reprise possible).` | Lot d'amines arrêté |
| `Sauvegarde téléchargée. Conservez ce fichier en lieu sûr.` | Menu |
| `Import réussi. Données remplacées.` | Menu |
| `Données de démo réinitialisées.` | Menu |

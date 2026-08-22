# Limites connues

Cette page est délibérément franche : ce que Digestor **ne fait pas**, et ce qui peut mal
se passer.

## Limites de conception

| Limite | Conséquence |
|---|---|
| **Aucune synchronisation** | Les données ne suivent pas d'un appareil à l'autre ; transfert manuel par fichier JSON |
| **Aucun compte, aucun serveur** | Aucune récupération possible après une perte de stockage |
| **Aucune notification** | Pas de rappel de prise de traitement ni de relevé de satiété |
| **Aucune sauvegarde automatique** | Seul un bandeau vous rappelle d'exporter, tous les 7 jours |
| **Une fiche par date** | Pas de versions ni d'historique de modification d'une journée |
| **Restauration destructive** | L'import JSON remplace tout ; il ne fusionne pas |

## Limites de stockage

| Limite | Détail |
|---|---|
| **Éviction du navigateur** | Le stockage local peut être effacé par le navigateur (manque d'espace, inactivité). Fréquent sur **iOS** après plusieurs semaines sans ouvrir l'application |
| **Stockage persistant non garanti** | La demande peut être refusée sans notification |
| **Navigation privée** | Données perdues à la fermeture de la session |
| **Effacement des données du site** | Supprime tout, sans confirmation propre à Digestor |

## Limites d'analyse

| Limite | Détail |
|---|---|
| **Association, pas causalité** | Les corrélations signalent une coïncidence statistique, rien de plus |
| **Même jour uniquement** | Les effets retardés (au-delà de la journée) ne sont pas détectés |
| **Aliments quotidiens indétectables** | Sans jours « sans », aucune comparaison n'est possible |
| **Seuils fixes** | Non paramétrables ; sous les seuils, aucune conclusion n'est affichée |
| **Symptômes légers ignorés** | Seuls les symptômes **modérés ou sévères** définissent un « jour à symptômes » |
| **Amines variables** | La teneur réelle dépend de la fraîcheur et de l'affinage : les valeurs sont indicatives |
| **Traitements non croisés** | Les cures ne sont pas intégrées au calcul des corrélations |

## Limites de l'assistant IA

| Limite | Détail |
|---|---|
| **Modèles gratuits inégaux** | Certains ne respectent pas le format JSON demandé ; changer de modèle est souvent la solution |
| **Quotas** | Les modèles gratuits ont des limites de débit (erreur `429`) |
| **Pas de file d'attente** | Une analyse échouée n'est pas rejouée automatiquement |
| **Analyses figées** | Une analyse n'est pas recalculée si la journée est modifiée ensuite |
| **Contenu non médical** | Les réponses sont des repères indicatifs |

## Limites PWA

| Limite | Détail |
|---|---|
| **iOS** | Installation possible uniquement depuis Safari ; éviction du stockage plus agressive |
| **Firefox** | Pas d'installation PWA native |
| **HTTPS requis** | Hors ligne et caméra indisponibles sur une connexion non sécurisée |
| **Mise à jour différée** | Une nouvelle version s'applique au prochain démarrage complet |

## Incohérences connues

Écarts entre ce que l'interface laisse attendre et ce qu'elle fait réellement :

| Écart | Détail | Statut |
|---|---|---|
| **« Jours difficiles » ne compte que les badges forcés** | La carte de l'écran Semaine ne compte que les journées dont vous avez **vous-même** forcé le badge sur « difficile ». Une journée classée difficile **automatiquement** d'après ses symptômes apparaît en rouge dans l'agenda et sur sa fiche, mais **pas** dans ce compteur — qui peut donc afficher `0 / 7` en face de plusieurs pastilles rouges | Comportement conservé et **explicité dans la carte** : touchez-la pour lire ce qu'elle mesure |

## Ce que Digestor ne prétend pas être

- **Pas un dispositif médical** ni un outil de diagnostic.
- **Pas un calculateur nutritionnel** : il ne compte ni calories ni macronutriments.
- **Pas un substitut** à un test respiratoire (SIBO), à un examen clinique (SII) ou à
  l'avis d'un professionnel de santé.

Voir [Informations légales](../legal/index.md).

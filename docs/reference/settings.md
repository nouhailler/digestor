# Référence des paramètres

Tableau de tous les paramètres exposés à l'utilisateur. Détail et procédures :
[Paramètres](../settings/index.md).

## Paramètres persistants

| Paramètre | Identifiant interne | Type | Défaut | Valeurs | Stockage | Exporté ? | Description |
|---|---|---|---|---|---|---|---|
| Clé API OpenRouter | `aiConfig.apiKey` | Texte masqué | *(vide)* | `sk-or-v1-…` | IndexedDB `meta` | **Non** | Active les fonctions IA |
| Modèle IA | `aiConfig.modelId` | Sélection | `null` | Modèles gratuits d'OpenRouter | IndexedDB `meta` | Oui | Modèle utilisé pour les analyses |
| Nom du patient | `profile.patientName` | Texte | `exemple` | Libre | IndexedDB `meta` | Oui | Affiché dans l'en-tête et le dossier médical |
| Âge | `profile.age` | Nombre | *(vide)* | 0–120 | IndexedDB `meta` | Oui | Contexte pour l'IA |
| Sexe | `profile.sex` | Sélection | *(vide)* | Femme · Homme · Autre | IndexedDB `meta` | Oui | Contexte pour l'IA |
| Conditions / diagnostics | `profile.conditions` | Liste | `[]` | Suggestions + saisie libre | IndexedDB `meta` | Oui | Contexte pour l'IA, dossier médical |
| Phase FODMAP | `profile.fodmapPhase` | Sélection | `aucune` | Aucune · Élimination · Réintroduction · Personnalisée | IndexedDB `meta` | Oui | Contexte pour l'IA |
| Intolérances | `profile.intolerances` | Liste | `[]` | Suggestions + saisie libre | IndexedDB `meta` | Oui | Contexte pour l'IA ; « Histamine » active la vigilance amines |
| Allergies | `profile.allergies` | Liste | `[]` | Suggestions + saisie libre | IndexedDB `meta` | Oui | Signalées en priorité à l'IA |
| Aliments à éviter | `profile.avoidedFoods` | Liste | `[]` | Saisie libre | IndexedDB `meta` | Oui | Contexte pour l'IA |
| Antécédents médicaux | `profile.medicalHistory` | Texte long | *(vide)* | Libre | IndexedDB `meta` | Oui | Contexte pour l'IA, dossier médical |
| Médicaments | `profile.medications` | Texte long | *(vide)* | Libre | IndexedDB `meta` | Oui | Contexte pour l'IA, dossier médical |
| Notes santé | `profile.notes` | Texte long | *(vide)* | Libre | IndexedDB `meta` | Oui | Contexte pour l'IA |
| Thème | `digestor-theme` | Sélection | `dark` | `dark` · `light` | `localStorage` | Non | Apparence de l'interface |
| Légende dépliée | `digestor-legend-open` | Booléen | `false` | `0` · `1` | `localStorage` | Non | État du bandeau de légende |
| Invite d'installation masquée | `digestor-a2hs-dismissed` | Booléen | *(absent)* | `1` | `localStorage` | Non | Masque définitivement la bannière d'installation |
| Rappel de sauvegarde masqué | `digestor-backup-reminder-dismissed` | Booléen | *(absent)* | `1` | `sessionStorage` | Non | Masque le bandeau pour la session |
| Tutoriel vu | `onboardingDone` | Booléen | `false` | `true` · `false` | IndexedDB `meta` | Oui *(réglages)* | Empêche la relance du tutoriel |
| Visites guidées vues | `toursSeen` | Liste d'écrans | `[]` | `journal`, `aliments`, `semaine`, `evolution`, `reperes` | IndexedDB `meta` | Non | Empêche la relance des visites |
| Date du dernier export | `lastExportAt` | Date ISO | *(absent)* | — | IndexedDB `meta` | Non | Déclenche le rappel de sauvegarde à 7 jours |

## Réglages d'écran (non persistés)

| Écran | Réglage | Valeurs | Défaut |
|---|---|---|---|
| Évolution | Plage | `week` · `4weeks` · `all` | `4weeks` |
| Évolution | Récurrence dépliée | Aperçu (12 lignes) · Tout | Aperçu |
| Aliments | Portée | `repas` · `catalogue` · `favoris` | `catalogue` |
| Aliments | Panneau des doublons | Ouvert · Fermé | Fermé |
| Repères | Sous-onglet | `reperes` · `encyclopedie` · `systeme` | `reperes` |
| Import de repas | Mode de fusion | `append` · `replace` | `append` |

## Constantes non paramétrables

| Constante | Valeur | Où |
|---|---|---|
| Délai du rappel de sauvegarde | 7 jours | Bandeau de sauvegarde |
| Fenêtre de récurrence des aliments | 30 jours | Écran Évolution |
| Checkpoints de satiété | Immédiat · +1 h · +2 h · +3 h | Journal |
| Seuil « charge d'amines modérée » | Score ≥ 2 | Amines |
| Seuil « charge d'amines élevée » | Score ≥ 5 | Amines |
| Corrélations — jours renseignés minimum | 5 | Corrélations |
| Corrélations — jours minimum par aliment / facteur | 3 | Corrélations |
| Corrélations — taux minimal « avec » | 50 % | Corrélations |
| Corrélations — écart minimal (aliments) | 30 points | Corrélations |
| Corrélations — écart minimal (contexte, amines) | 20 points | Corrélations |
| Corrélations — résultats affichés au maximum | 12 | Écran Semaine |
| Recherche d'aliment — longueur minimale | 3 lettres | Écran Aliments |
| Recherche dans le journal — longueur minimale | 2 lettres | Recherche |
| Confirmation d'analyse en masse | Au-delà de 20 aliments | Écran Aliments |
| Version du schéma de base | 8 | IndexedDB |
| Version du format de sauvegarde | 8 | Export JSON |

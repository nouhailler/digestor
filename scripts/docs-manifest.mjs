/**
 * Plan de la documentation : l'ordre des chapitres et des pages du site généré.
 * Chaque page pointe un fichier Markdown de `docs/` ; son identifiant est le
 * chemin sans extension (`index` étant remplacé par le dossier).
 *
 * Toute nouvelle page de doc doit être ajoutée ici, sinon le contrôle de liens
 * du build la signale comme cible manquante.
 */
export const REPO_URL = 'https://github.com/nouhailler/digestor';

export const CHAPTERS = [
  {
    icon: '🏠',
    title: 'Accueil',
    pages: [{ file: 'index.md', title: 'Documentation Digestor' }],
  },
  {
    icon: '🚀',
    title: 'Bien démarrer',
    pages: [{ file: 'getting-started/index.md', title: 'Bien démarrer' }],
  },
  {
    icon: '📖',
    title: 'Guide utilisateur',
    pages: [
      { file: 'guide/index.md', title: "Comprendre l'application" },
      { file: 'guide/journal.md', title: 'Écran Journal' },
      { file: 'guide/aliments.md', title: 'Écran Aliments' },
      { file: 'guide/semaine.md', title: 'Écran Semaine' },
      { file: 'guide/evolution.md', title: 'Écran Évolution' },
      { file: 'guide/reperes.md', title: 'Écran Repères' },
    ],
  },
  {
    icon: '🧩',
    title: 'Fonctionnalités',
    pages: [
      { file: 'features/index.md', title: 'Toutes les fonctionnalités' },
      { file: 'features/journal-quotidien.md', title: 'Journal quotidien' },
      { file: 'features/symptomes.md', title: 'Symptômes' },
      { file: 'features/satiete.md', title: 'Satiété' },
      { file: 'features/transit-hydratation.md', title: 'Transit & hydratation' },
      { file: 'features/contexte-bien-etre.md', title: 'Bien-être & contexte' },
      { file: 'features/modeles-de-repas.md', title: 'Modèles de repas' },
      { file: 'features/favoris-aliments.md', title: 'Favoris' },
      { file: 'features/correlations.md', title: 'Corrélations' },
      { file: 'features/recurrence-aliments.md', title: 'Récurrence des aliments' },
      { file: 'features/amines-biogenes.md', title: 'Amines biogènes' },
      { file: 'features/analyse-aliment-ia.md', title: "Analyse d'un aliment (IA)" },
      { file: 'features/analyse-journee-ia.md', title: "Analyse d'une journée (IA)" },
      { file: 'features/rapport-periode-ia.md', title: 'Rapport de période' },
      { file: 'features/idees-repas-ia.md', title: 'Idées de repas' },
      { file: 'features/scan-code-barres.md', title: 'Scan de produit' },
      { file: 'features/referentiel-aliments.md', title: "Référentiel d'aliments" },
      { file: 'features/import-vocal-repas.md', title: 'Import vocal des repas' },
      { file: 'features/import-vocal-satiete.md', title: 'Import vocal de la satiété' },
      { file: 'features/dossier-medical.md', title: 'Dossier médical' },
      { file: 'features/traitements-complements.md', title: 'Traitements & compléments' },
      { file: 'features/reintroductions-fodmap.md', title: 'Réintroductions FODMAP' },
      { file: 'features/encyclopedie-symptomes.md', title: 'Encyclopédie des symptômes' },
      { file: 'features/guide-systeme-digestif.md', title: 'Guide du système digestif' },
      { file: 'features/profil-sante.md', title: 'Profil santé' },
      { file: 'features/recherche-journal.md', title: 'Recherche dans le journal' },
      { file: 'features/sauvegarde-restauration.md', title: 'Sauvegarde & restauration' },
      { file: 'features/apparence-theme.md', title: 'Apparence (thème)' },
      { file: 'features/aide-visites-guidees.md', title: 'Aide & visites guidées' },
    ],
  },
  {
    icon: '⚙️',
    title: 'Paramètres',
    pages: [{ file: 'settings/index.md', title: 'Paramètres' }],
  },
  {
    icon: '🔐',
    title: 'Permissions',
    pages: [{ file: 'permissions/index.md', title: 'Permissions' }],
  },
  {
    icon: '🗄️',
    title: 'Données et confidentialité',
    pages: [{ file: 'data/index.md', title: 'Données et confidentialité' }],
  },
  {
    icon: '📴',
    title: 'Hors connexion',
    pages: [
      { file: 'offline/index.md', title: 'Fonctionnement hors connexion' },
      { file: 'sync/index.md', title: 'Synchronisation' },
    ],
  },
  {
    icon: '🛠️',
    title: 'Dépannage',
    pages: [
      { file: 'troubleshooting/index.md', title: 'Tous les problèmes' },
      { file: 'troubleshooting/erreur-au-demarrage.md', title: 'Erreur au démarrage' },
      { file: 'troubleshooting/donnees-disparues.md', title: 'Mes données ont disparu' },
      { file: 'troubleshooting/mise-a-jour-bloquee.md', title: "La mise à jour ne s'applique pas" },
      { file: 'troubleshooting/ia-ne-repond-pas.md', title: "L'IA ne répond pas" },
      { file: 'troubleshooting/aucun-modele-gratuit.md', title: 'Aucun modèle gratuit trouvé' },
      { file: 'troubleshooting/camera-indisponible.md', title: "La caméra ne s'ouvre pas" },
      { file: 'troubleshooting/import-json-refuse.md', title: 'Un import JSON est refusé' },
      { file: 'troubleshooting/pas-de-correlations.md', title: "Les corrélations ne s'affichent pas" },
      { file: 'troubleshooting/graphe-absent.md', title: "Un graphe ne s'affiche pas" },
      { file: 'troubleshooting/impression-pdf.md', title: 'Impression vide ou mal découpée' },
    ],
  },
  {
    icon: '❓',
    title: 'FAQ',
    pages: [{ file: 'faq/index.md', title: 'Questions fréquentes' }],
  },
  {
    icon: '📘',
    title: 'Référence',
    pages: [
      { file: 'reference/index.md', title: 'Référence' },
      { file: 'reference/settings.md', title: 'Référence des paramètres' },
      { file: 'reference/errors.md', title: 'Codes et erreurs' },
      { file: 'reference/data-formats.md', title: 'Formats de données' },
      { file: 'reference/glossary.md', title: 'Glossaire' },
      { file: 'reference/compatibility.md', title: 'Compatibilité' },
      { file: 'reference/limitations.md', title: 'Limites connues' },
      { file: 'claude-web-repas-prompt.md', title: 'Prompt — import des repas' },
      { file: 'claude-web-satiete-prompt.md', title: 'Prompt — import de la satiété' },
      { file: 'claude-web-amines-prompt.md', title: 'Prompt — amines biogènes' },
    ],
  },
  {
    icon: '🔄',
    title: 'Versions',
    pages: [{ file: 'versions/index.md', title: 'Historique des versions' }],
  },
  {
    icon: '⚖️',
    title: 'Informations légales',
    pages: [{ file: 'legal/index.md', title: 'Informations légales' }],
  },
  {
    icon: '📩',
    title: 'Support',
    pages: [{ file: 'support/index.md', title: 'Support' }],
  },
];

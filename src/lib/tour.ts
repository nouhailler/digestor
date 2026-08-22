import type { Tab } from '../components/BottomNav';

/**
 * Visites guidées (« coach-marks ») par écran : des bulles explicatives ancrées
 * aux vrais éléments de l'UI. Chaque étape vise un élément par son attribut
 * `data-tour="<target>"` ; une étape sans `target` s'affiche centrée (intro/synthèse).
 *
 * Pour ajouter une étape ancrée : poser `data-tour="x"` sur l'élément concerné
 * puis référencer `x` ici. Si la cible est absente au moment de l'affichage
 * (rendu conditionnel), l'étape se replie automatiquement en bulle centrée.
 */
export interface TourStep {
  /** Valeur de l'attribut `data-tour` de l'élément à mettre en avant (sinon bulle centrée). */
  target?: string;
  title: string;
  body: string;
}

export const TOURS: Record<Tab, TourStep[]> = {
  journal: [
    {
      title: 'Le Journal, votre quotidien',
      body: "C'est ici que vous notez vos repas, vos symptômes, votre transit et votre hydratation. Tout est enregistré automatiquement, hors-ligne. Suivez le guide : quelques bulles pour prendre l'écran en main.",
    },
    {
      target: 'header-legend',
      title: 'La légende des couleurs',
      body: 'Chaque aliment est classé par couleur : rouge = pro-candidose / SIBO, vert = bénéfique, gris = neutre. On retrouve ces couleurs partout dans le journal.',
    },
    {
      target: 'journal-date',
      title: 'Choisissez le jour',
      body: "Naviguez d'un jour à l'autre avec les flèches ou le calendrier. Chaque jour a sa propre fiche, sauvegardée toute seule.",
    },
    {
      target: 'journal-edit',
      title: 'Saisissez repas & symptômes',
      body: "Le bouton vert « Modifier » passe la fiche en édition : ajoutez des aliments à chaque repas (chips colorées), notez l'heure, les symptômes ressentis après chaque repas et votre satiété. Plus bas : transit (échelle de Bristol), hydratation et contexte du jour (stress, sommeil, règles). Le badge à gauche résume la qualité du jour. En lecture, touchez une chip d'aliment pour son analyse FODMAP / SIBO / candidose.",
    },
    {
      target: 'journal-analyze',
      title: 'Le bilan IA de la journée',
      body: "Dès qu'un jour contient des données, ce bouton demande à l'IA un bilan : verdict global, déclencheurs probables et pistes d'amélioration. Le résultat se partage ou se télécharge, et alimente la synthèse de l'écran Évolution.",
    },
    {
      target: 'header-help',
      title: 'Besoin de détails ?',
      body: "Cette icône ouvre l'aide complète de l'écran courant, avec tous les conseils. Vous pourrez aussi y relancer cette visite guidée.",
    },
    {
      target: 'header-menu',
      title: 'Votre boîte à outils',
      body: "Le menu ⋯ regroupe : recherche dans le journal, saisie vocale d'un repas ou de la satiété (via un projet Claude Web), modèles de repas, profil santé, traitements & compléments, réintroductions FODMAP, sauvegarde / restauration et le dossier médical imprimable (avec graphes d'évolution).",
    },
    {
      target: 'nav',
      title: 'Naviguez entre les écrans',
      body: 'En bas : Journal, Aliments (bibliothèque + analyse IA), Semaine (stats & corrélations), Évolution (courbes, amines, selles, satiété) et Repères. Chaque écran vous expliquera ses fonctions à votre première visite.',
    },
  ],
  aliments: [
    {
      title: 'Analyser vos aliments',
      body: "Cet écran évalue un aliment (FODMAP, SIBO, candidose, amines biogènes) et garde la bibliothèque de vos analyses. C'est la partie « IA » de Digestor — optionnelle, mais pratique.",
    },
    {
      target: 'aliments-scope',
      title: 'Trois portées',
      body: '« De mes repas » liste les aliments réellement consommés, « Catalogue » ajoute le dictionnaire embarqué (~260 aliments), « Favoris » vos valeurs sûres (★) — elles remontent en tête quand vous composez un repas dans le Journal.',
    },
    {
      target: 'aliments-search',
      title: 'Cherchez ou analysez',
      body: "Tapez un aliment : la liste se filtre sur vos analyses existantes. S'il est nouveau, lancez son analyse pour obtenir son profil FODMAP et son adéquation SIBO / candidose. Les résultats sont mis en cache.",
    },
    {
      target: 'aliments-scan',
      title: 'Scannez un produit',
      body: "Le code-barres d'un produit emballé est recherché sur Open Food Facts, puis analysé comme n'importe quel aliment : pratique au supermarché pour savoir si un produit est déconseillé.",
    },
    {
      target: 'aliments-actions',
      title: 'Actions groupées',
      body: "Idées de repas adaptées à votre profil (IA), analyse en masse des aliments non analysés, complément hors-ligne des profils d'amines, et export / import du référentiel d'aliments (utile pour la saisie vocale via Claude Web).",
    },
    {
      title: 'Votre bibliothèque',
      body: "Vos analyses s'accumulent ici. Ouvrez une fiche pour la relire, la partager en texte ou en carte image (PNG). « Trouver les doublons » fait le ménage des variantes proches.",
    },
    {
      target: 'header-menu',
      title: 'Configurer l\'IA',
      body: "L'analyse nécessite une clé OpenRouter et un modèle gratuit, à renseigner dans les paramètres IA (menu ⋯). Pensez aussi à remplir votre profil santé pour des analyses personnalisées.",
    },
  ],
  semaine: [
    {
      title: 'Votre semaine en un coup d\'œil',
      body: "Une synthèse des 7 derniers jours (lundi → dimanche) et les corrélations repérées entre vos aliments et vos symptômes.",
    },
    {
      target: 'week-nav',
      title: 'Changez de semaine',
      body: 'Les flèches font défiler les semaines. Les statistiques et l\'agenda coloré se recalculent à chaque fois.',
    },
    {
      target: 'week-stats',
      title: 'Le récapitulatif chiffré',
      body: "Jours difficiles, ballonnements, diarrhée, jours sans sucre, note amines /10, score énergie… Touchez une carte pour comprendre comment elle est calculée.",
    },
    {
      target: 'week-correlations',
      title: 'Des corrélations honnêtes',
      body: "Calculées sur tout votre journal : aliments déclencheurs probables, aliments sûrs, facteurs contextuels (stress, sommeil, règles) et charge en amines. Digestor ne conclut que s'il y a assez de données — sinon il le dit clairement plutôt que d'inventer un motif.",
    },
  ],
  evolution: [
    {
      title: 'Vos tendances dans le temps',
      body: "Des graphes pour voir évoluer vos symptômes, vos aliments « rouges », la charge en amines biogènes, vos selles (échelle de Bristol) et votre satiété.",
    },
    {
      target: 'evo-range',
      title: 'Choisissez la plage',
      body: "Semaine, 4 semaines ou tout l'historique : tous les graphes de l'écran se recalculent sur la plage choisie.",
    },
    {
      target: 'evo-report',
      title: 'Le rapport de période',
      body: "Un bilan de la plage affichée : tendances calculées (1re vs 2de moitié) et, si l'IA est configurée, une synthèse avec verdict, déclencheurs récurrents et pistes.",
    },
    {
      target: 'evo-recurrence',
      title: 'La récurrence de vos aliments',
      body: "Sur les 30 derniers jours : combien de fois chaque aliment revient, sur combien de jours différents, à quel rythme et de quelle date à quelle date. Utile pour repérer ce que vous mangez le plus souvent.",
    },
    {
      title: 'Des graphes qui apparaissent avec vos données',
      body: "Au fil de vos saisies s'ajoutent : symptômes après les repas (jour × heure), aliments suspects par symptôme (avec cohérence amines), tendance des amines, évolution des selles, courbes de satiété, et la synthèse de vos analyses IA de journées (déclencheurs et pistes regroupés).",
    },
  ],
  reperes: [
    {
      title: 'Repères candidose vs SIBO / SII',
      body: 'Un tableau pour distinguer les profils, l\'encyclopédie des symptômes digestifs et un guide. Cet écran aide au repérage : il ne pose aucun diagnostic — consultez un médecin pour toute interprétation.',
    },
    {
      target: 'reperes-tabs',
      title: 'Trois sous-onglets',
      body: "« Repères » : le tableau comparatif et la fiche des amines biogènes (histamine) avec les aliments à risque. « Encyclopédie » : les symptômes digestifs classés par catégorie. « Système digestif » : le guide illustré (anatomie, transit, microbiote).",
    },
  ],
};

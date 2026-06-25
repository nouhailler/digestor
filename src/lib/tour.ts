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
      body: "Le crayon passe la fiche en édition : ajoutez des aliments à chaque repas (chips colorées) et faites varier l'intensité des symptômes d'un simple toucher. Le badge à gauche résume la qualité du jour. En lecture, touchez une chip d'aliment pour son analyse FODMAP / SIBO / candidose.",
    },
    {
      target: 'header-help',
      title: 'Besoin de détails ?',
      body: "Cette icône ouvre l'aide complète de l'écran courant, avec tous les conseils. Vous pourrez aussi y relancer cette visite guidée.",
    },
    {
      target: 'header-menu',
      title: 'Votre boîte à outils',
      body: 'Le menu ⋯ donne accès à votre profil santé, vos traitements & compléments, les tests de réintroduction FODMAP, les modèles de repas, le rapport de période et le dossier médical imprimable.',
    },
    {
      target: 'nav',
      title: 'Naviguez entre les écrans',
      body: 'En bas : Journal, Aliments (analyse IA), Semaine (corrélations), Évolution (courbes) et Repères. Chaque écran vous expliquera ses fonctions à votre première visite.',
    },
  ],
  aliments: [
    {
      title: 'Analyser vos aliments',
      body: "Cet écran évalue un aliment et garde la bibliothèque de vos analyses. C'est la partie « IA » de Digestor — optionnelle, mais pratique.",
    },
    {
      target: 'aliments-search',
      title: 'Cherchez ou analysez',
      body: "Tapez un aliment : la liste se filtre sur vos analyses existantes. S'il est nouveau, lancez son analyse pour obtenir son profil FODMAP et son adéquation SIBO / candidose. Les résultats sont mis en cache.",
    },
    {
      title: 'Votre bibliothèque',
      body: "Vos analyses s'accumulent ici. Mettez en favori (★) vos aliments sûrs : ils remonteront en tête quand vous composerez un repas dans le Journal. « Trouver les doublons » fait le ménage.",
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
      title: 'Des corrélations honnêtes',
      body: "Digestor ne signale un lien aliment → symptôme que lorsqu'il y a assez de données (≥ 3 jours saisis). Pas assez ? Il le dit clairement plutôt que d'inventer un motif.",
    },
  ],
  evolution: [
    {
      title: 'Vos tendances dans le temps',
      body: 'Des courbes pour voir évoluer vos symptômes, vos aliments « rouges » et votre hydratation.',
    },
    {
      target: 'evo-range',
      title: 'Choisissez la plage',
      body: 'Semaine, 4 semaines ou tout l\'historique. La sévérité des symptômes et la part d\'aliments pro se lisent en parallèle ; l\'hydratation se compare à la cible de 1,5 L.',
    },
  ],
  reperes: [
    {
      title: 'Repères candidose vs SIBO / SII',
      body: 'Un tableau pour distinguer les profils, l\'encyclopédie des symptômes digestifs et un guide. Cet écran aide au repérage : il ne pose aucun diagnostic — consultez un médecin pour toute interprétation.',
    },
  ],
};

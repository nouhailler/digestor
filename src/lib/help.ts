import type { Tab } from '../components/BottomNav';

export interface HelpEntry {
  title: string;
  intro: string;
  tips: string[];
}

/**
 * Explication du suivi de satiété, partagée entre l'aide « ? » du Journal et le
 * bouton « Aide » de la zone Satiété (édition d'un repas). Source unique.
 */
export const SATIETY_HELP = {
  title: 'Comprendre la satiété',
  intro:
    "Après un repas, notez à plusieurs moments (immédiat, +1 h, +2 h, +3 h) votre faim, votre énergie et votre envie de sucre, chacune sur une échelle de 0 à 100. À partir de ces relevés, Digestor estime deux durées de satiété.",
  points: [
    {
      label: 'Durée tenue (mesurée)',
      text: "Calculée à partir de VOS relevés : Digestor repère le moment où la faim repasse au-dessus de la moitié de l'échelle. Tant qu'elle n'est pas revenue, il affiche « encore rassasié à +X h ». Un seul relevé pris trop tôt ne donne donc pas encore de durée — il faut au moins un relevé où la faim est remontée.",
    },
    {
      label: 'Durée attendue',
      text: "Estimée d'après la composition du repas. Les tags « Protéiné » et « Fibres » → satiété longue (~4–5 h, ~4–6 h si les deux) ; « Sucré » → courte (~2–3 h). Sans tag, Digestor s'appuie sur les catégories d'aliments et le niveau FODMAP. C'est une approximation, pas une mesure.",
    },
    {
      label: 'Pourquoi les deux',
      text: "« Satiété tenue ~2 h (attendu ~4–5 h) » met en évidence un repas qui rassasie moins longtemps que prévu — pratique pour repérer ce qui vous cale réellement. Les tags n'influencent que la durée ATTENDUE ; la durée tenue ne dépend que de vos relevés de faim.",
    },
  ],
} as const;

/** Aide contextuelle + tips, par onglet. */
export const HELP: Record<Tab, HelpEntry> = {
  journal: {
    title: 'Journal',
    intro: 'Saisissez votre journée : repas, symptômes, transit et notes. Tout est enregistré automatiquement.',
    tips: [
      'Touchez le bouton vert « Modifier » en haut de la carte pour passer en mode édition.',
      'Chaque repas a sa zone « Symptômes après ce repas » : touchez une pastille pour faire varier son intensité (absent → léger → modéré → sévère).',
      'Chaque repas a aussi une zone « Satiété » (faim, énergie, envie de sucre à plusieurs moments). Le détail « durée tenue vs attendue » est expliqué juste en dessous.',
      "En lecture, touchez une chip d'aliment pour lancer son analyse FODMAP / SIBO / candidose.",
      'En édition, touchez une chip pour changer sa catégorie (rouge → vert → gris).',
      'Le badge passe du vert (bonne) à l’orange (correcte) puis au rouge (difficile) selon le cumul des symptômes du jour ; modifiable d’un toucher.',
      'Survolez un libellé (symptôme, couleur, champ) : une infobulle l’explique.',
    ],
  },
  aliments: {
    title: 'Aliments',
    intro: "Analysez un aliment et retrouvez la bibliothèque de vos analyses, propulsée par l'IA.",
    tips: [
      'Saisissez un aliment puis « Analyser » pour obtenir son profil FODMAP et son adéquation SIBO / candidose.',
      'Les analyses sont mises en cache : inutile de les relancer.',
      'Configurez une clé OpenRouter et un modèle gratuit dans les paramètres IA (menu ⋯).',
      'Renseignez votre profil santé pour des analyses personnalisées (allergies signalées).',
    ],
  },
  semaine: {
    title: 'Semaine',
    intro: "Vue d'ensemble de la semaine en cours et corrélations repérées.",
    tips: [
      'Les statistiques portent sur 7 jours (lundi → dimanche).',
      "Naviguez d'une semaine à l'autre avec les flèches.",
      'Les corrélations apparaissent seulement avec assez de données (≥ 3 jours saisis).',
    ],
  },
  evolution: {
    title: 'Évolution',
    intro: 'Suivez vos tendances dans le temps.',
    tips: [
      'Changez la plage : semaine, 4 semaines ou tout.',
      '« Plus de rouge » (aliments pro) et sévérité des symptômes se lisent en parallèle.',
      'Le tableau « Récurrence des aliments » couvre toujours les 30 derniers jours : mentions, jours distincts, rythme et plage de dates.',
    ],
  },
  reperes: {
    title: 'Repères',
    intro: 'Repères pour distinguer candidose et SIBO / SII.',
    tips: [
      'Ce tableau aide au repérage : il ne pose pas de diagnostic.',
      "Consultez « À propos » pour l'avertissement médical complet.",
    ],
  },
};

import type { Tab } from '../components/BottomNav';

export interface HelpEntry {
  title: string;
  intro: string;
  tips: string[];
}

/** Aide contextuelle + tips, par onglet. */
export const HELP: Record<Tab, HelpEntry> = {
  journal: {
    title: 'Journal',
    intro: 'Saisissez votre journée : repas, symptômes, transit et notes. Tout est enregistré automatiquement.',
    tips: [
      'Touchez le crayon en haut de la carte pour passer en mode édition.',
      'Chaque repas a sa zone « Symptômes après ce repas » : touchez une pastille pour faire varier son intensité (absent → léger → modéré → sévère).',
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
      "La ligne d'hydratation se compare à la cible de 1,5 L.",
      '« Plus de rouge » (aliments pro) et sévérité des symptômes se lisent en parallèle.',
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

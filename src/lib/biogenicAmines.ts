import type { AmineGroup, AmineInfo, AmineLevel } from '../types';
import { normalize } from './foodClassifier';

/**
 * Amines biogènes (histamine, tyramine, putrescine, cadavérine) — dimension
 * parallèle à FODMAP/SIBO/candidose, pour l'intolérance à l'histamine.
 *
 * Le corps dégrade ces molécules via la DAO. En cas de production alimentaire
 * trop élevée OU de dégradation insuffisante, elles s'accumulent et peuvent
 * provoquer : démangeaisons/urticaire, rougeurs, maux de tête, troubles
 * digestifs, fatigue après repas.
 *
 * IMPORTANT — honnêteté : la teneur en histamine est TRÈS variable (fraîcheur,
 * conservation, durée d'affinage/fermentation). Ce module donne un *repère* de
 * risque, pas une mesure. Les aliments non listés sont `unknown`, pas supposés sûrs.
 *
 * Au-delà de la teneur, deux mécanismes comptent :
 *  - `liberator` : l'aliment libère l'histamine endogène (même peu histaminé) ;
 *  - `daoBlocker` : il gêne la DAO / entre en compétition (ex. alcool, putrescine).
 * Et surtout l'effet dépend de l'ACCUMULATION sur la journée et des COMBINAISONS
 * (alcool + charcuterie + fromage affiné + fermenté).
 */

export type { AmineGroup, AmineInfo, AmineLevel } from '../types';

export const AMINE_LEVEL_LABEL: Record<AmineLevel, string> = {
  low: 'Faible',
  moderate: 'Modéré',
  high: 'Élevé',
  unknown: 'Inconnu',
};

export const AMINE_LEVEL_COLOR: Record<AmineLevel, string> = {
  low: 'var(--color-leger)',
  moderate: 'var(--color-modere)',
  high: 'var(--color-severe)',
  unknown: 'var(--color-absent)',
};

const H = (level: AmineLevel, extra: Omit<AmineInfo, 'level'> = {}): AmineInfo => ({ level, ...extra });

/**
 * Dictionnaire amines biogènes (clés normalisées). Match partiel comme
 * `foodClassifier` : le terme du dico contenu dans la saisie (le plus long gagne).
 */
const DICTIONARY: Record<string, AmineInfo> = {
  // ---- ÉLEVÉ (rouge) ----
  // Fromages affinés / fermentés
  'fromage affine': H('high', { group: 'fromage' }),
  parmesan: H('high', { group: 'fromage' }),
  comte: H('high', { group: 'fromage' }),
  roquefort: H('high', { group: 'fromage' }),
  'fromage bleu': H('high', { group: 'fromage' }),
  bleu: H('high', { group: 'fromage' }),
  cheddar: H('high', { group: 'fromage' }),
  gruyere: H('high', { group: 'fromage' }),
  emmental: H('high', { group: 'fromage' }),
  gouda: H('high', { group: 'fromage' }),
  'vieux fromage': H('high', { group: 'fromage' }),
  // Charcuteries
  charcuterie: H('high', { group: 'charcuterie' }),
  saucisson: H('high', { group: 'charcuterie' }),
  'jambon sec': H('high', { group: 'charcuterie' }),
  'jambon cru': H('high', { group: 'charcuterie' }),
  salami: H('high', { group: 'charcuterie' }),
  chorizo: H('high', { group: 'charcuterie' }),
  pate: H('high', { group: 'charcuterie', note: 'Pâté/terrine industriels.' }),
  // Boissons fermentées
  vin: H('high', { group: 'alcool', daoBlocker: true }),
  'vin rouge': H('high', { group: 'alcool', daoBlocker: true, note: 'Le plus riche.' }),
  'vin blanc': H('high', { group: 'alcool', daoBlocker: true }),
  champagne: H('high', { group: 'alcool', daoBlocker: true }),
  biere: H('high', { group: 'alcool', daoBlocker: true }),
  cidre: H('high', { group: 'alcool', daoBlocker: true }),
  kombucha: H('high', { group: 'fermente' }),
  alcool: H('high', { group: 'alcool', daoBlocker: true }),
  // Poissons à risque (surtout mal conservés / en boîte)
  thon: H('high', { group: 'poisson', note: 'Risque ↑ si chaîne du froid rompue / en boîte.' }),
  maquereau: H('high', { group: 'poisson', note: 'Histamine monte vite hors froid.' }),
  sardine: H('high', { group: 'poisson' }),
  anchois: H('high', { group: 'poisson' }),
  // Aliments fermentés
  choucroute: H('high', { group: 'fermente' }),
  kimchi: H('high', { group: 'fermente' }),
  miso: H('high', { group: 'fermente' }),
  'sauce soja': H('high', { group: 'fermente' }),
  // Levures
  'levure alimentaire': H('high', { group: 'fermente' }),
  'levure de biere': H('high', { group: 'fermente' }),
  // Vinaigres (fermentés) — explicites pour primer sur « cidre »/« vin »
  vinaigre: H('high', { group: 'fermente', note: 'Fermenté : riche en amines.' }),
  'vinaigre de cidre': H('high', { group: 'fermente', note: 'Fermenté : riche en amines.' }),
  'vinaigre balsamique': H('high', { group: 'fermente' }),

  // ---- MODÉRÉ (ambre) ----
  'pain au levain': H('moderate', { group: 'fermente', note: 'Variable selon la fermentation.' }),
  'pain industriel': H('moderate'),
  chocolat: H('moderate', { liberator: true, daoBlocker: true, note: 'Cacao : libérateur + freine la DAO.' }),
  cacao: H('moderate', { liberator: true, daoBlocker: true }),
  cafe: H('moderate', { daoBlocker: true }),
  'the noir': H('moderate', { daoBlocker: true }),
  the: H('moderate', { daoBlocker: true }),
  epinard: H('moderate', { note: 'Riche en histamine/putrescine.' }),
  tomate: H('moderate', { liberator: true, note: 'Surtout très mûre ; aussi libératrice.' }),
  aubergine: H('moderate'),
  avocat: H('moderate', { note: 'Très mûr = élevé.' }),
  banane: H('moderate', { liberator: true, note: 'Très mûre = élevé ; libératrice.' }),
  'jus de fruits': H('moderate', { note: 'Industriels / stockés longtemps.' }),
  'conserve de poisson': H('moderate', { group: 'poisson' }),
  'poisson en boite': H('moderate', { group: 'poisson' }),
  // Histamino-libérateurs notoires (teneur faible mais déclenchent)
  fraise: H('moderate', { liberator: true, note: 'Histamino-libératrice.' }),
  agrumes: H('moderate', { liberator: true }),
  citron: H('moderate', { liberator: true }),
  orange: H('moderate', { liberator: true }),
  ananas: H('moderate', { liberator: true }),
  'fruits de mer': H('moderate', { group: 'poisson', liberator: true }),
  crustaces: H('moderate', { group: 'poisson', liberator: true }),
  crevette: H('moderate', { group: 'poisson', liberator: true }),
  noix: H('moderate', { liberator: true }),
  cacahuete: H('moderate', { liberator: true }),
  additifs: H('moderate', { liberator: true }),

  // ---- FAIBLE (vert) — bien tolérés s'ils sont frais ----
  'viande fraiche': H('low', { note: 'Très récemment cuite.' }),
  boeuf: H('low', { note: 'Frais ; éviter mijoté/réchauffé longuement.' }),
  poulet: H('low', { note: 'Frais.' }),
  dinde: H('low'),
  'poisson frais': H('low', { group: 'poisson', note: 'Très frais ou congelé dès la pêche.' }),
  oeuf: H('low', { note: 'Le blanc cru peut être libérateur.' }),
  courgette: H('low'),
  carotte: H('low'),
  brocoli: H('low'),
  'haricots verts': H('low'),
  salade: H('low'),
  concombre: H('low'),
  pomme: H('low'),
  poire: H('low'),
  raisin: H('low'),
  melon: H('low'),
  pasteque: H('low'),
  riz: H('low'),
  quinoa: H('low'),
  'pomme de terre': H('low'),
  'lait frais': H('low', { note: 'Si toléré par ailleurs.' }),
};

export function dictionaryAmineSize(): number {
  return Object.keys(DICTIONARY).length;
}

/**
 * Profil amines biogènes d'un aliment. Stratégie de match comme `classifyFood` :
 * exact → terme du dico le plus long contenu dans la saisie → mot connu.
 * Défaut : `unknown` (on n'invente pas un « faible »).
 */
export function classifyAmines(rawName: string): AmineInfo {
  const name = normalize(rawName);
  if (!name) return { level: 'unknown' };
  if (DICTIONARY[name]) return DICTIONARY[name];

  // Match par frontières de mots (le terme du dico est un mot/groupe de mots de
  // la saisie), le plus long gagne. Évite « the » ⊂ « menthe », « vin » ⊂ « vinaigre ».
  const padded = ` ${name} `;
  let best: { info: AmineInfo; len: number } | null = null;
  for (const key in DICTIONARY) {
    if (padded.includes(` ${key} `) && (!best || key.length > best.len)) {
      best = { info: DICTIONARY[key], len: key.length };
    }
  }
  return best ? best.info : { level: 'unknown' };
}

// ---- Charge journalière & combinaisons ----

const LEVEL_WEIGHT: Record<AmineLevel, number> = { low: 0, moderate: 1, high: 3, unknown: 0 };

/** Bande de charge globale sur la journée. */
export type AmineLoadBand = 'faible' | 'modere' | 'eleve';

export interface AmineLoad {
  score: number;
  band: AmineLoadBand;
  highCount: number;
  liberators: number;
  daoBlockers: number;
  /** Familles déclencheuses présentes parmi les aliments « élevés ». */
  groups: AmineGroup[];
  /** Combinaison à risque détectée (alcool + fromage/charcuterie/fermenté). */
  combo: boolean;
}

const COMBO_PARTNERS: AmineGroup[] = ['fromage', 'charcuterie', 'fermente'];

/**
 * Évalue la charge en amines biogènes d'un ensemble d'aliments (un repas, ou
 * toute une journée). Le score cumule les niveaux (modéré +1, élevé +3) plus un
 * bonus pour les libérateurs et les bloqueurs de DAO. La présence d'alcool AVEC
 * un fromage affiné / une charcuterie / un fermenté escalade en « élevé », même
 * si chaque aliment passe « à peu près » seul.
 */
export function dayAmineLoad(names: string[]): AmineLoad {
  let score = 0;
  let highCount = 0;
  let liberators = 0;
  let daoBlockers = 0;
  const groups = new Set<AmineGroup>();

  for (const n of names) {
    const info = classifyAmines(n);
    score += LEVEL_WEIGHT[info.level];
    if (info.level === 'high') {
      highCount++;
      if (info.group && info.group !== 'autre') groups.add(info.group);
    }
    if (info.liberator) {
      liberators++;
      score += 1;
    }
    if (info.daoBlocker) {
      daoBlockers++;
      score += 1;
    }
  }

  const combo = groups.has('alcool') && COMBO_PARTNERS.some((g) => groups.has(g));

  let band: AmineLoadBand = score >= 5 ? 'eleve' : score >= 2 ? 'modere' : 'faible';
  if (combo) band = 'eleve';

  return { score, band, highCount, liberators, daoBlockers, groups: [...groups], combo };
}

/** Un aliment du jour qui contribue à la charge (avec son profil amines). */
export interface AmineContributor {
  name: string; // nom affiché (1re occurrence)
  info: AmineInfo;
}

export interface AmineBreakdown {
  load: AmineLoad;
  /** Aliments à niveau modéré/élevé, les plus chargés d'abord. */
  contributors: AmineContributor[];
  /** Aliments qui freinent la DAO. */
  daoBlockers: AmineContributor[];
  /** Aliments histamino-libérateurs. */
  liberators: AmineContributor[];
}

const LEVEL_RANK: Record<AmineLevel, number> = { high: 3, moderate: 2, low: 1, unknown: 0 };

/**
 * Décompose la charge d'une journée : pourquoi elle est élevée (aliments
 * contributeurs) et quels aliments freinent la DAO / libèrent l'histamine.
 * Dédoublonne par nom normalisé (1re occurrence conservée pour l'affichage).
 */
export function amineBreakdown(names: string[]): AmineBreakdown {
  const seen = new Set<string>();
  const contributors: AmineContributor[] = [];
  const daoBlockers: AmineContributor[] = [];
  const liberators: AmineContributor[] = [];

  for (const name of names) {
    const key = normalize(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const info = classifyAmines(name);
    const entry: AmineContributor = { name, info };
    if (info.level === 'high' || info.level === 'moderate') contributors.push(entry);
    if (info.daoBlocker) daoBlockers.push(entry);
    if (info.liberator) liberators.push(entry);
  }

  contributors.sort((a, b) => LEVEL_RANK[b.info.level] - LEVEL_RANK[a.info.level]);
  return { load: dayAmineLoad(names), contributors, daoBlockers, liberators };
}

export const AMINE_LOAD_LABEL: Record<AmineLoadBand, string> = {
  faible: 'Charge faible',
  modere: 'Charge modérée',
  eleve: 'Charge élevée',
};

export const AMINE_LOAD_COLOR: Record<AmineLoadBand, string> = {
  faible: 'var(--color-leger)',
  modere: 'var(--color-modere)',
  eleve: 'var(--color-severe)',
};

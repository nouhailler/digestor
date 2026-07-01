import type { AmineInfo, FodmapGroups, FodmapLevel, FoodCategory, FoodInsight, Verdict } from '../types';
import { classifyFood } from './foodClassifier';
import { classifyAmines } from './biogenicAmines';

/**
 * Référentiel d'aliments exportable, au même format que
 * `docs/digestor-aliments-reference.json` : à déposer dans la zone Fichiers d'un
 * Projet Claude Web pour qu'il reprenne des données fiables au lieu d'en inventer.
 */

export interface FoodReferenceEntry {
  name: string;
  /** true tant que la fiche n'a pas d'analyse (FODMAP/verdicts à compléter). */
  needsReview?: boolean;
  category: FoodCategory;
  fodmapLevel: FodmapLevel;
  fodmaps: FodmapGroups;
  sibo: { verdict: Verdict; note: string };
  candida: { verdict: Verdict; note: string };
  amines?: AmineInfo;
  safePortion?: string;
  summary?: string;
  tips?: string[];
}

export interface FoodReference {
  app: 'digestor';
  type: 'food-reference';
  version: 1;
  exportedAt: string;
  about: string;
  legend: Record<string, string>;
  foods: FoodReferenceEntry[];
}

const ABOUT =
  "Référentiel des aliments connus de Digestor, avec leurs caractéristiques FODMAP / SIBO / candidose. " +
  'À déposer dans la zone Fichiers d\'un Projet Claude Web. Lors de la saisie vocale d\'un repas, chercher ' +
  "d'abord l'aliment ici (par 'name', insensible aux accents/majuscules/pluriels) et reprendre tel quel " +
  'category/fodmapLevel/fodmaps/sibo/candida/amines/safePortion. Une entrée "needsReview": true n\'a pas encore ' +
  "d'analyse : compléter selon ta connaissance. N'inventer une fiche que si l'aliment est absent.";

const LEGEND: Record<string, string> = {
  category: 'pro = défavorable (pro-candidose/SIBO) · beneficial = favorable/anti-fongique · neutral',
  fodmapLevel: 'low | moderate | high | unknown (niveau global)',
  fodmaps: 'niveau par groupe : fructose, lactose, fructans, gos, polyols',
  verdict: 'favorable | attention | eviter | inconnu (selon SIBO / candidose)',
  amines: 'amines biogènes (histamine…) : level low|moderate|high, liberator, daoBlocker, group, note',
};

/** Aliment du catalogue : nom affiché + éventuelle fiche analysée en cache. */
export interface CatalogueFood {
  name: string;
  insight?: FoodInsight;
}

/** Amines de la fiche, sinon repère du dictionnaire (si niveau connu). */
function amineFor(name: string, fromInsight?: AmineInfo): AmineInfo | undefined {
  if (fromInsight) return fromInsight;
  const guess = classifyAmines(name);
  return guess.level !== 'unknown' ? guess : undefined;
}

function entryFromInsight(name: string, ins: FoodInsight): FoodReferenceEntry {
  const amines = amineFor(name, ins.amines);
  return {
    name,
    category: ins.category,
    fodmapLevel: ins.fodmapLevel,
    fodmaps: { ...ins.fodmaps },
    sibo: { verdict: ins.sibo.verdict, note: ins.sibo.note },
    candida: { verdict: ins.candida.verdict, note: ins.candida.note },
    ...(amines ? { amines } : {}),
    ...(ins.safePortion ? { safePortion: ins.safePortion } : {}),
    ...(ins.summary ? { summary: ins.summary } : {}),
    ...(ins.tips.length ? { tips: [...ins.tips] } : {}),
  };
}

const UNKNOWN_GROUPS: FodmapGroups = {
  fructose: 'unknown',
  lactose: 'unknown',
  fructans: 'unknown',
  gos: 'unknown',
  polyols: 'unknown',
};

/** Entrée « stub » pour un aliment sans analyse : catégorie estimée, reste à compléter. */
function stubEntry(name: string): FoodReferenceEntry {
  const amines = amineFor(name);
  return {
    name,
    needsReview: true,
    category: classifyFood(name),
    fodmapLevel: 'unknown',
    fodmaps: { ...UNKNOWN_GROUPS },
    sibo: { verdict: 'inconnu', note: '' },
    candida: { verdict: 'inconnu', note: '' },
    ...(amines ? { amines } : {}),
  };
}

/**
 * Construit le référentiel exportable à partir du catalogue (dictionnaire +
 * repas + analyses). Les aliments analysés reprennent leur fiche ; les autres
 * deviennent un stub à compléter (`needsReview`). Triés par nom (fr).
 */
export function buildFoodReference(foods: CatalogueFood[], now: Date = new Date()): FoodReference {
  const entries = foods.map((f) => (f.insight ? entryFromInsight(f.name, f.insight) : stubEntry(f.name)));
  entries.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  return {
    app: 'digestor',
    type: 'food-reference',
    version: 1,
    exportedAt: now.toISOString(),
    about: ABOUT,
    legend: LEGEND,
    foods: entries,
  };
}

/** Déclenche le téléchargement du référentiel au format JSON. */
export function downloadFoodReference(foods: CatalogueFood[]): void {
  const ref = buildFoodReference(foods);
  const blob = new Blob([JSON.stringify(ref, null, 2) + '\n'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `digestor-aliments-reference-${ref.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

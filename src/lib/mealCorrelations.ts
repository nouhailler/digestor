import type { AmineInfo, DayEntry, SymptomKey } from '../types';
import { SYMPTOM_LABELS, SYMPTOM_ORDER } from './constants';
import { normalize } from './foodClassifier';
import { classifyAmines } from './biogenicAmines';
import { SYMPTOM_AMINE_META } from './symptomCatalog';

/**
 * Corrélations aliment → symptôme au niveau du REPAS (`Meal.symptoms`), plus
 * fines que `personalCorrelations` (niveau jour). Deux signaux :
 *
 * - « récurrent » : l'aliment apparaît dans assez de repas, avec un taux de
 *   symptôme « après ce repas » élevé ET nettement supérieur aux repas sans
 *   (mêmes garde-fous conservateurs que personalCorrelations).
 * - « ponctuel » (différentiel) : dans un repas symptomatique, les aliments
 *   HABITUELS — vus dans ≥ 2 autres repas jamais suivis de ce symptôme — sont
 *   disculpés ; s'il ne reste qu'un ou deux suspects (l'aliment « nouveau »),
 *   on les signale « à confirmer ». C'est le cas « œufs + jambon d'habitude
 *   sans symptôme, + une figue → diarrhée » : la figue est suspectée, pas les
 *   œufs. Un repas trop ambigu (3+ aliments inconnus) n'attribue rien.
 *
 * Chaque lien est annoté du profil d'amines biogènes de l'aliment et d'un
 * drapeau « cohérent » quand ce profil correspond à l'amine typique du
 * symptôme (`SYMPTOM_AMINE_META`). Fonctions pures, honnêteté : sous les
 * seuils, liste vide.
 */

export interface MealFoodLink {
  food: string; // nom affiché (1re orthographe vue)
  symptom: SymptomKey;
  symptomLabel: string;
  kind: 'recurrent' | 'ponctuel';
  mealsWithFood: number; // nb de repas contenant l'aliment
  symptomMealsWithFood: number; // dont suivis de ce symptôme
  rateWith: number; // P(symptôme | repas avec l'aliment)
  rateWithout: number; // P(symptôme | repas sans l'aliment)
  dates: string[]; // jours des repas symptomatiques concernés
  amine: AmineInfo; // profil amines de l'aliment (dictionnaire)
  amineMatch: boolean; // profil cohérent avec l'amine typique du symptôme
}

export interface MealCorrelations {
  enoughData: boolean;
  analyzedMeals: number; // repas avec au moins un aliment
  symptomMeals: number; // dont avec au moins un symptôme actif
  links: MealFoodLink[];
}

export interface MealCorrelationsOptions {
  minTotalMeals?: number; // minimum de repas pour conclure quoi que ce soit
  minFoodMeals?: number; // minimum de repas avec l'aliment (signal récurrent)
  minRateWith?: number; // taux minimal « avec » (signal récurrent)
  minLift?: number; // écart minimal avec/sans (signal récurrent)
  minSafeMeals?: number; // nb d'autres repas sans symptôme pour disculper un aliment
  maxSuspects?: number; // au-delà, repas trop ambigu pour attribuer
  maxResults?: number;
}

const DEFAULTS: Required<MealCorrelationsOptions> = {
  minTotalMeals: 6,
  minFoodMeals: 3,
  minRateWith: 0.5,
  minLift: 0.3,
  minSafeMeals: 2,
  maxSuspects: 2,
  maxResults: 15,
};

const AMINE_RANK: Record<string, number> = { high: 3, moderate: 2, low: 1, unknown: 0 };

/** Le profil amines de l'aliment peut-il expliquer ce symptôme ? */
export function amineMatchesSymptom(info: AmineInfo, symptom: SymptomKey): boolean {
  const typical = SYMPTOM_AMINE_META[symptom]?.amine;
  if (!typical || typical === 'unknown') return false;
  const hist =
    (AMINE_RANK[info.histamine ?? info.level] ?? 0) >= 2 || !!info.liberator || !!info.daoBlocker;
  const tyr = (AMINE_RANK[info.tyramine ?? 'unknown'] ?? 0) >= 2 || !!info.maoInhibitor;
  if (typical === 'histamine') return hist;
  if (typical === 'tyramine') return tyr;
  return hist || tyr; // 'both'
}

interface MealRow {
  date: string;
  foods: Set<string>; // clés normalisées
  active: Set<SymptomKey>;
}

export function mealCorrelations(
  days: DayEntry[],
  options: MealCorrelationsOptions = {},
): MealCorrelations {
  const opt = { ...DEFAULTS, ...options };

  // Un enregistrement par repas contenant au moins un aliment.
  const rows: MealRow[] = [];
  const foodNames = new Map<string, string>(); // clé → nom affiché
  for (const day of days) {
    for (const meal of day.meals) {
      if (meal.foods.length === 0) continue;
      const foods = new Set<string>();
      for (const f of meal.foods) {
        const key = normalize(f.name);
        if (!key) continue;
        foods.add(key);
        if (!foodNames.has(key)) foodNames.set(key, f.name.trim());
      }
      const active = new Set<SymptomKey>();
      if (meal.symptoms) {
        for (const k of SYMPTOM_ORDER) {
          if ((meal.symptoms[k] ?? 'absent') !== 'absent') active.add(k);
        }
      }
      rows.push({ date: day.date, foods, active });
    }
  }

  const analyzedMeals = rows.length;
  const symptomMeals = rows.filter((r) => r.active.size > 0).length;
  if (analyzedMeals < opt.minTotalMeals || symptomMeals === 0) {
    return { enoughData: analyzedMeals >= opt.minTotalMeals, analyzedMeals, symptomMeals, links: [] };
  }

  // Index aliment → indices de repas.
  const foodMeals = new Map<string, number[]>();
  rows.forEach((r, i) => {
    for (const key of r.foods) {
      const list = foodMeals.get(key) ?? [];
      list.push(i);
      foodMeals.set(key, list);
    }
  });

  // Symptômes réellement observés après au moins un repas.
  const observed = SYMPTOM_ORDER.filter((k) => rows.some((r) => r.active.has(k)));

  const links = new Map<string, MealFoodLink>();
  const mkLink = (key: string, k: SymptomKey, kind: MealFoodLink['kind']): MealFoodLink => {
    const idx = foodMeals.get(key) ?? [];
    const withActive = idx.filter((i) => rows[i].active.has(k));
    const without = rows.length - idx.length;
    const withoutActive = rows.filter((r, i) => !idx.includes(i) && r.active.has(k)).length;
    const amine = classifyAmines(foodNames.get(key) ?? key);
    return {
      food: foodNames.get(key) ?? key,
      symptom: k,
      symptomLabel: SYMPTOM_LABELS[k],
      kind,
      mealsWithFood: idx.length,
      symptomMealsWithFood: withActive.length,
      rateWith: idx.length ? withActive.length / idx.length : 0,
      rateWithout: without ? withoutActive / without : 0,
      dates: [...new Set(withActive.map((i) => rows[i].date))].sort(),
      amine,
      amineMatch: amineMatchesSymptom(amine, k),
    };
  };

  // ---- Signal « récurrent » (seuils conservateurs, niveau repas) ----
  for (const [key, idx] of foodMeals) {
    if (idx.length < opt.minFoodMeals || idx.length === rows.length) continue;
    for (const k of observed) {
      const link = mkLink(key, k, 'recurrent');
      if (link.rateWith >= opt.minRateWith && link.rateWith - link.rateWithout >= opt.minLift) {
        links.set(`${key}|${k}`, link);
      }
    }
  }

  // ---- Signal « ponctuel » (différentiel) ----
  // Un aliment est « nouveau » s'il n'apparaît pas assez ailleurs pour être jugé.
  const novel = (key: string, mealIdx: number): boolean =>
    (foodMeals.get(key) ?? []).filter((i) => i !== mealIdx).length < opt.minSafeMeals;

  // Un repas symptomatique est « expliqué » (vis-à-vis de l'aliment habituel
  // `exceptKey`) s'il contient un autre aliment nouveau qui peut porter le
  // chapeau. Ex. : « œufs + jambon + jus d'orange → diarrhée » n'incrimine pas
  // les œufs, le jus d'orange (jamais vu ailleurs) suffit à l'expliquer.
  const explained = (mealIdx: number, exceptKey: string): boolean =>
    [...rows[mealIdx].foods].some((g) => g !== exceptKey && novel(g, mealIdx));

  // Un aliment est disculpé pour un symptôme s'il apparaît dans assez d'AUTRES
  // repas et que chacun de ces repas est soit sans ce symptôme, soit expliqué
  // par un aliment nouveau.
  const exonerated = (key: string, k: SymptomKey, mealIdx: number): boolean => {
    const others = (foodMeals.get(key) ?? []).filter((i) => i !== mealIdx);
    if (others.length < opt.minSafeMeals) return false;
    return others.every((i) => !rows[i].active.has(k) || explained(i, key));
  };

  rows.forEach((r, i) => {
    for (const k of r.active) {
      // Repas déjà expliqué par un déclencheur récurrent (ex. le parmesan des
      // maux de tête) : inutile de suspecter en plus ses accompagnements rares.
      if ([...r.foods].some((key) => links.get(`${key}|${k}`)?.kind === 'recurrent')) continue;
      const suspects = [...r.foods].filter((key) => !exonerated(key, k, i));
      if (suspects.length === 0 || suspects.length > opt.maxSuspects) continue; // rien ou trop ambigu
      for (const key of suspects) {
        const id = `${key}|${k}`;
        if (!links.has(id)) links.set(id, mkLink(key, k, 'ponctuel'));
      }
    }
  });

  const out = [...links.values()].sort(
    (a, b) =>
      (a.kind === 'recurrent' ? 0 : 1) - (b.kind === 'recurrent' ? 0 : 1) ||
      b.symptomMealsWithFood - a.symptomMealsWithFood ||
      b.rateWith - b.rateWithout - (a.rateWith - a.rateWithout) ||
      a.food.localeCompare(b.food, 'fr'),
  );

  return { enoughData: true, analyzedMeals, symptomMeals, links: out.slice(0, opt.maxResults) };
}

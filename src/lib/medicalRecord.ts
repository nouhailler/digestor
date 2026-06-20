import { differenceInCalendarDays } from 'date-fns';
import type {
  DayEntry,
  DayQuality,
  FoodCategory,
  FoodInsight,
  Intensity,
  Profile,
  ReintroChallenge,
  Stool,
  SymptomKey,
  Treatment,
} from '../types';
import { INTENSITY_WEIGHT, STOOL_OPTIONS, SYMPTOM_LABELS, SYMPTOM_ORDER } from './constants';
import { dayHasContent, effectiveDaySymptoms } from './aggregates';
import { detectCorrelations, type Correlation } from './correlations';
import { personalCorrelations, type PersonalCorrelations } from './personalCorrelations';
import { sortTreatments } from './treatments';
import { sortReintro } from './reintro';
import { normalize } from './foodClassifier';
import { formatQuantity } from './quantity';
import { fromISODate, todayISO } from './dates';

export interface SymptomStat {
  key: SymptomKey;
  label: string;
  daysPresent: number; // nb de jours où le symptôme est ≥ léger
  daysSevere: number; // nb de jours où il est sévère
  maxIntensity: Intensity; // pire intensité observée sur la période
  weight: number; // cumul pondéré (fréquence × intensité)
}

export interface FoodCount {
  name: string;
  count: number;
  category: FoodCategory;
}

export interface BristolStat {
  type: number; // 1..7
  label: string;
  count: number;
}

export interface RecordSymptom {
  key: SymptomKey;
  label: string;
  intensity: Intensity;
}

export interface RecordFood {
  name: string;
  quantity?: string; // ex. « 1 càc »
  category: FoodCategory;
}

export interface RecordMeal {
  time: string;
  foods: RecordFood[];
  symptoms: RecordSymptom[]; // symptômes ressentis après ce repas
}

export interface RecordDay {
  date: string;
  quality: DayQuality;
  meals: RecordMeal[];
  generalSymptoms: RecordSymptom[]; // symptômes « jour » (hors repas)
  symptomTiming?: string;
  notes?: string;
  hydrationL?: number;
  stool?: Stool;
  digestionDelayH?: number;
}

export interface MedicalRecord {
  generatedAt: string; // ISO
  profile: Profile;
  period: {
    from?: string; // 1er jour renseigné (ISO)
    to?: string; // dernier jour renseigné (ISO)
    recordedDays: number; // jours avec au moins un aliment / symptôme
    daysWithMeals: number;
    spanDays: number; // amplitude calendaire (from→to inclus)
  };
  symptomStats: SymptomStat[]; // symptômes présents, triés par poids décroissant
  topFoods: FoodCount[]; // aliments les plus fréquents
  proFoods: FoodCount[]; // aliments défavorables (pro-candidose / pro-SIBO) fréquents
  bristol: BristolStat[]; // répartition des selles (échelle de Bristol)
  avgHydrationL: number | null;
  stoolDays: number; // jours avec une selle renseignée
  correlations: Correlation[]; // heuristiques (motifs connus)
  personal: PersonalCorrelations; // corrélations calculées sur les données réelles
  treatments: Treatment[]; // traitements & compléments (en cours d'abord)
  reintro: ReintroChallenge[]; // tests de réintroduction FODMAP
  days: RecordDay[]; // détail chronologique des jours renseignés
}

const MAX_TOP_FOODS = 20;

function bristolLabel(type: number): string {
  return STOOL_OPTIONS.find((o) => o.bristol === type)?.label ?? `Type ${type}`;
}

function activeSymptoms(sym: Record<SymptomKey, Intensity>): RecordSymptom[] {
  return SYMPTOM_ORDER.filter((k) => sym[k] !== 'absent').map((k) => ({
    key: k,
    label: SYMPTOM_LABELS[k],
    intensity: sym[k],
  }));
}

/**
 * Compile l'ensemble des données du journal en un dossier médical structuré,
 * destiné à être imprimé / partagé avec un médecin. Fonction pure (testable) :
 * statistiques honnêtes (uniquement les jours renseignés) + détail chronologique.
 */
export function buildMedicalRecord(
  allDays: DayEntry[],
  profile: Profile | undefined,
  insights?: Map<string, FoodInsight>,
  treatments: Treatment[] = [],
  reintro: ReintroChallenge[] = [],
): MedicalRecord {
  const recorded = allDays.filter(dayHasContent).sort((a, b) => a.date.localeCompare(b.date));
  const from = recorded[0]?.date;
  const to = recorded[recorded.length - 1]?.date;

  // --- Synthèse des symptômes ---
  const stats = new Map<SymptomKey, SymptomStat>();
  for (const k of SYMPTOM_ORDER) {
    stats.set(k, { key: k, label: SYMPTOM_LABELS[k], daysPresent: 0, daysSevere: 0, maxIntensity: 'absent', weight: 0 });
  }
  // --- Aliments ---
  const foodAcc = new Map<string, FoodCount>();
  // --- Transit / hydratation ---
  const bristolAcc = new Map<number, number>();
  let hydrationSum = 0;
  let hydrationN = 0;
  let stoolDays = 0;
  let daysWithMeals = 0;

  for (const day of recorded) {
    const sym = effectiveDaySymptoms(day);
    for (const k of SYMPTOM_ORDER) {
      const v = sym[k];
      const s = stats.get(k)!;
      s.weight += INTENSITY_WEIGHT[v];
      if (v !== 'absent') s.daysPresent++;
      if (v === 'severe') s.daysSevere++;
      if (INTENSITY_WEIGHT[v] > INTENSITY_WEIGHT[s.maxIntensity]) s.maxIntensity = v;
    }

    if (day.meals.some((m) => m.foods.length > 0)) daysWithMeals++;
    for (const meal of day.meals) {
      for (const f of meal.foods) {
        const key = normalize(f.name);
        if (!key) continue;
        const existing = foodAcc.get(key);
        if (existing) existing.count++;
        else
          foodAcc.set(key, {
            name: f.name.trim(),
            count: 1,
            category: insights?.get(key)?.category ?? f.category,
          });
      }
    }

    if (typeof day.hydrationL === 'number') {
      hydrationSum += day.hydrationL;
      hydrationN++;
    }
    if (day.stool && (typeof day.stool.bristol === 'number' || typeof day.stool.count === 'number')) {
      stoolDays++;
      if (typeof day.stool.bristol === 'number') {
        bristolAcc.set(day.stool.bristol, (bristolAcc.get(day.stool.bristol) ?? 0) + 1);
      }
    }
  }

  const symptomStats = [...stats.values()].filter((s) => s.weight > 0).sort((a, b) => b.weight - a.weight);

  const topFoods = [...foodAcc.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'fr'))
    .slice(0, MAX_TOP_FOODS);
  const proFoods = topFoods.filter((f) => f.category === 'pro');

  const bristol = [...bristolAcc.entries()]
    .map(([type, count]) => ({ type, label: bristolLabel(type), count }))
    .sort((a, b) => a.type - b.type);

  // --- Détail chronologique ---
  const days: RecordDay[] = recorded.map((day) => ({
    date: day.date,
    quality: day.quality,
    meals: [...day.meals]
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((meal) => ({
        time: meal.time,
        foods: meal.foods.map((f) => ({
          name: f.name.trim(),
          quantity: f.quantity ? formatQuantity(f.quantity) : undefined,
          category: insights?.get(normalize(f.name))?.category ?? f.category,
        })),
        symptoms: meal.symptoms ? activeSymptoms(meal.symptoms) : [],
      })),
    generalSymptoms: activeSymptoms(day.symptoms),
    symptomTiming: day.symptomTiming,
    notes: day.notes,
    hydrationL: day.hydrationL,
    stool: day.stool,
    digestionDelayH: day.digestionDelayH,
  }));

  return {
    generatedAt: new Date().toISOString(),
    profile: profile ?? { patientName: 'exemple' },
    period: {
      from,
      to,
      recordedDays: recorded.length,
      daysWithMeals,
      spanDays: from && to ? differenceInCalendarDays(fromISODate(to), fromISODate(from)) + 1 : 0,
    },
    symptomStats,
    topFoods,
    proFoods,
    bristol,
    avgHydrationL: hydrationN > 0 ? hydrationSum / hydrationN : null,
    stoolDays,
    correlations: detectCorrelations(recorded),
    personal: personalCorrelations(recorded),
    treatments: sortTreatments(treatments, todayISO()),
    reintro: sortReintro(reintro),
    days,
  };
}

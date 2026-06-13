import type { DayEntry, FoodCategory, FoodItem, Intensity, Meal, SymptomKey } from '../types';
import { db, isEmpty, setProfile } from './db';
import { emptySymptoms, uid } from './factory';

function f(name: string, category: FoodCategory): FoodItem {
  return { id: uid(), name, category };
}

function meal(time: string, foods: FoodItem[]): Meal {
  return { id: uid(), time, foods };
}

function symptoms(overrides: Partial<Record<SymptomKey, Intensity>>): Record<SymptomKey, Intensity> {
  return { ...emptySymptoms(), ...overrides };
}

/** Lundi 9 juin 2025 — journée difficile (conforme maquette 1). */
const LUNDI: DayEntry = {
  date: '2025-06-09',
  quality: 'difficile',
  meals: [
    meal('07:30', [
      f('pain blanc (2 tranches)', 'pro'),
      f('confiture', 'pro'),
      f('café', 'neutral'),
      f("jus d'orange", 'pro'),
    ]),
    meal('12:30', [
      f('poulet rôti', 'neutral'),
      f('pâtes blanches', 'pro'),
      f('salade verte', 'neutral'),
      f('yaourt aux fruits', 'pro'),
    ]),
    meal('16:00', [f('biscuits sucrés', 'pro'), f('thé noir', 'neutral')]),
    meal('19:30', [
      f('saumon grillé', 'neutral'),
      f('riz blanc', 'pro'),
      f('brocoli vapeur', 'beneficial'),
      f('vin blanc (1 verre)', 'pro'),
    ]),
  ],
  symptoms: symptoms({
    ballonnements: 'severe',
    gaz: 'severe',
    douleurs_abdo: 'modere',
    reflux: 'modere',
    fatigue_apres_repas: 'severe',
    envie_sucre: 'modere',
    diarrhee: 'leger',
    brouillard_mental: 'modere',
    demangeaisons: 'leger',
  }),
  symptomTiming: '2 h après repas du soir',
  notes:
    "Ballonnements très importants dès 21 h, ventre gonflé comme un ballon. Très fatigué en soirée malgré 7 h de sommeil. Envie intense de sucre en fin d'après-midi — a craqué pour les biscuits.",
  hydrationL: 1.2,
  stool: { label: 'Selles molles', count: 2, bristol: 6 },
  digestionDelayH: 3,
};

/** Mardi 10 juin 2025 — journée correcte (conforme maquette 2). */
const MARDI: DayEntry = {
  date: '2025-06-10',
  quality: 'correcte',
  meals: [
    meal('08:00', [
      f('œufs brouillés (2)', 'beneficial'),
      f('avocat', 'beneficial'),
      f('thé vert', 'neutral'),
    ]),
    meal('13:00', [
      f('salade verte', 'beneficial'),
      f('thon en boîte', 'beneficial'),
      f("huile d'olive", 'beneficial'),
      f('ail (½ gousse)', 'beneficial'),
      f('quinoa (petite portion)', 'neutral'),
    ]),
    meal('16:30', [
      f('amandes (petite poignée)', 'beneficial'),
      f('tisane de gingembre', 'beneficial'),
    ]),
    meal('19:00', [
      f('poulet rôti', 'beneficial'),
      f('courgettes sautées', 'beneficial'),
      f('huile de coco', 'beneficial'),
      f('patate douce (½)', 'neutral'),
    ]),
  ],
  symptoms: symptoms({
    ballonnements: 'leger',
    gaz: 'leger',
    fatigue_apres_repas: 'leger',
  }),
  notes:
    'Beaucoup mieux qu’hier. Léger ballonnement après le quinoa du midi — à surveiller. Pas de fringale sucrée, énergie stable toute la journée. Transit normal le matin.',
  hydrationL: 1.8,
  stool: { label: 'Selles normales', count: 1, bristol: 4 },
  digestionDelayH: 2,
};

export const SEED_DAYS: DayEntry[] = [LUNDI, MARDI];

/** Insère les données de démo (écrase Lundi/Mardi + profil). */
export async function loadSeed(): Promise<void> {
  await db.days.bulkPut(SEED_DAYS);
  await setProfile({ patientName: 'exemple' });
}

/** Au tout premier lancement (base vide), pré-remplit la démo. */
export async function seedIfEmpty(): Promise<void> {
  if (await isEmpty()) await loadSeed();
}

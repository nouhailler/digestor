import { describe, expect, it } from 'vitest';
import type { DayEntry, Intensity, SymptomKey } from '../types';
import { emptyDay, emptySymptoms, makeMeal } from './factory';
import { amineMatchesSymptom, mealCorrelations } from './mealCorrelations';
import { classifyAmines } from './biogenicAmines';

function sym(overrides: Partial<Record<SymptomKey, Intensity>>): Record<SymptomKey, Intensity> {
  return { ...emptySymptoms(), ...overrides };
}

function day(date: string, meals: DayEntry['meals']): DayEntry {
  return { ...emptyDay(date), meals };
}

function meal(time: string, foods: string[], symptoms?: Partial<Record<SymptomKey, Intensity>>) {
  const m = makeMeal(time, foods);
  return symptoms ? { ...m, symptoms: sym(symptoms) } : m;
}

describe('mealCorrelations — signal différentiel (« ponctuel »)', () => {
  // L'exemple canonique : œufs + jambon d'habitude sans symptôme ; on ajoute
  // une figue → diarrhée ; le lendemain un jus d'orange → diarrhée.
  const days = [
    day('2025-06-09', [meal('07:30', ['oeufs', 'jambon'])]),
    day('2025-06-10', [meal('07:30', ['oeufs', 'jambon'])]),
    day('2025-06-11', [meal('07:30', ['oeufs', 'jambon'])]),
    day('2025-06-12', [meal('07:30', ['oeufs', 'jambon', 'figue'], { diarrhee: 'modere' })]),
    day('2025-06-13', [meal('07:30', ['oeufs', 'jambon', "jus d'orange"], { diarrhee: 'modere' })]),
    day('2025-06-14', [meal('12:30', ['riz', 'poulet rôti'])]),
  ];

  const res = mealCorrelations(days);

  it('suspecte l’aliment ajouté, pas les aliments habituels disculpés', () => {
    expect(res.enoughData).toBe(true);
    const foods = res.links.map((l) => l.food);
    expect(foods).toContain('figue');
    expect(foods).toContain("jus d'orange");
    expect(foods).not.toContain('oeufs');
    expect(foods).not.toContain('jambon');
  });

  it('qualifie le lien : ponctuel, 1 repas, avec dates et taux', () => {
    const figue = res.links.find((l) => l.food === 'figue')!;
    expect(figue.kind).toBe('ponctuel');
    expect(figue.symptom).toBe('diarrhee');
    expect(figue.symptomMealsWithFood).toBe(1);
    expect(figue.mealsWithFood).toBe(1);
    expect(figue.rateWith).toBe(1);
    expect(figue.dates).toEqual(['2025-06-12']);
  });

  it('n’attribue rien si le repas est trop ambigu (3+ aliments inconnus)', () => {
    const ambiguous = [
      day('2025-06-09', [meal('12:30', ['riz'])]),
      day('2025-06-10', [meal('12:30', ['riz'])]),
      day('2025-06-11', [meal('12:30', ['riz'])]),
      day('2025-06-12', [meal('12:30', ['riz'])]),
      day('2025-06-13', [meal('12:30', ['riz'])]),
      day('2025-06-14', [
        meal('19:30', ['plat nouveau a', 'plat nouveau b', 'plat nouveau c'], { nausees: 'severe' }),
      ]),
    ];
    expect(mealCorrelations(ambiguous).links).toEqual([]);
  });

  it('un aliment habituel déjà suivi du symptôme ailleurs n’est pas disculpé', () => {
    const tricky = [
      day('2025-06-09', [meal('07:30', ['oeufs', 'jambon'], { diarrhee: 'leger' })]),
      day('2025-06-10', [meal('07:30', ['oeufs', 'jambon'])]),
      day('2025-06-11', [meal('07:30', ['oeufs', 'jambon'])]),
      day('2025-06-12', [meal('07:30', ['oeufs', 'jambon', 'figue'], { diarrhee: 'modere' })]),
      day('2025-06-13', [meal('12:30', ['riz'])]),
      day('2025-06-14', [meal('12:30', ['riz'])]),
    ];
    const links = mealCorrelations(tricky).links;
    // La diarrhée du 09 (sans figue) rend œufs/jambon réellement suspects : le
    // signal RÉCURRENT les attrape (2 repas sur 4, 0 sans) ; le différentiel ne
    // conclut rien (repas du 12 ambigu : 3 suspects). La figue reste hors de cause.
    const foods = links.map((l) => l.food);
    expect(foods).toContain('oeufs');
    expect(foods).toContain('jambon');
    expect(foods).not.toContain('figue');
    expect(links.find((l) => l.food === 'oeufs')!.kind).toBe('recurrent');
  });
});

describe('mealCorrelations — signal récurrent', () => {
  it('détecte un aliment souvent suivi du même symptôme', () => {
    const days = [
      day('2025-06-09', [meal('19:30', ['parmesan', 'riz'], { maux_de_tete: 'modere' })]),
      day('2025-06-10', [meal('19:30', ['parmesan', 'courgette'], { maux_de_tete: 'severe' })]),
      day('2025-06-11', [meal('19:30', ['parmesan', 'poulet rôti'], { maux_de_tete: 'modere' })]),
      day('2025-06-12', [meal('19:30', ['riz', 'courgette'])]),
      day('2025-06-13', [meal('19:30', ['poulet rôti', 'riz'])]),
      day('2025-06-14', [meal('19:30', ['courgette', 'poulet rôti'])]),
    ];
    const res = mealCorrelations(days);
    const parm = res.links.find((l) => l.food === 'parmesan' && l.symptom === 'maux_de_tete')!;
    expect(parm.kind).toBe('recurrent');
    expect(parm.symptomMealsWithFood).toBe(3);
    expect(parm.rateWith).toBe(1);
    expect(parm.rateWithout).toBe(0);
    // Le parmesan est riche en histamine/tyramine → cohérent avec les maux de tête.
    expect(parm.amineMatch).toBe(true);
  });

  it('un repas expliqué par un récurrent ne suspecte pas ses accompagnements rares', () => {
    const days = [
      day('2025-06-09', [meal('19:30', ['parmesan', 'salade nouvelle'], { maux_de_tete: 'modere' })]),
      day('2025-06-10', [meal('19:30', ['parmesan', 'courgette'], { maux_de_tete: 'severe' })]),
      day('2025-06-11', [meal('19:30', ['parmesan', 'poulet rôti'], { maux_de_tete: 'modere' })]),
      day('2025-06-12', [meal('19:30', ['riz', 'courgette'])]),
      day('2025-06-13', [meal('19:30', ['poulet rôti', 'riz'])]),
      day('2025-06-14', [meal('19:30', ['courgette', 'poulet rôti'])]),
    ];
    const foods = mealCorrelations(days).links.map((l) => l.food);
    expect(foods).toContain('parmesan');
    // « salade nouvelle » (vue une seule fois, avec le parmesan) n'est pas accusée.
    expect(foods).not.toContain('salade nouvelle');
  });
});

describe('mealCorrelations — garde-fous', () => {
  it('pas assez de repas → enoughData false, aucune conclusion', () => {
    const days = [
      day('2025-06-09', [meal('07:30', ['oeufs', 'figue'], { diarrhee: 'severe' })]),
      day('2025-06-10', [meal('07:30', ['oeufs'])]),
    ];
    const res = mealCorrelations(days);
    expect(res.enoughData).toBe(false);
    expect(res.links).toEqual([]);
  });

  it('aucun symptôme par repas → aucune conclusion (mais enoughData)', () => {
    const days = Array.from({ length: 6 }, (_, i) =>
      day(`2025-06-0${i + 1}`, [meal('12:30', ['riz', 'poulet rôti'])]),
    );
    const res = mealCorrelations(days);
    expect(res.enoughData).toBe(true);
    expect(res.symptomMeals).toBe(0);
    expect(res.links).toEqual([]);
  });
});

describe('amineMatchesSymptom', () => {
  it('cohérent : aliment histaminique ↔ symptôme histaminique', () => {
    expect(amineMatchesSymptom(classifyAmines('vin rouge'), 'diarrhee')).toBe(true);
    expect(amineMatchesSymptom(classifyAmines('parmesan'), 'urticaire')).toBe(true);
  });
  it('non cohérent : aliment neutre en amines, ou symptôme hors amines', () => {
    expect(amineMatchesSymptom(classifyAmines('riz'), 'diarrhee')).toBe(false);
    expect(amineMatchesSymptom(classifyAmines('vin rouge'), 'constipation')).toBe(false);
  });
});

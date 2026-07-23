import { describe, expect, it } from 'vitest';
import type { DayEntry, Intensity, SymptomKey } from '../types';
import { emptyDay, emptySymptoms, makeMeal } from './factory';
import {
  amineLoadByDay,
  categoryCountsByDay,
  computeWeekStats,
  dayHasContent,
  effectiveDaySymptoms,
  fillDayRange,
  hydrationByDay,
  latestActiveDate,
  mealSymptomPoints,
  severityByDay,
  stoolBand,
  stoolByDay,
  topSymptoms,
} from './aggregates';
import { weekDays, fromISODate } from './dates';

function sym(overrides: Partial<Record<SymptomKey, Intensity>>): Record<SymptomKey, Intensity> {
  return { ...emptySymptoms(), ...overrides };
}

/** Construit une semaine de 7 jours dont 2 renseignés. */
function buildWeek(): DayEntry[] {
  const dates = weekDays(fromISODate('2025-06-09'));
  const days = dates.map(emptyDay);

  // Lundi : difficile, ballonnements + diarrhée sévères, repas sucré.
  days[0] = {
    ...days[0],
    quality: 'difficile',
    symptoms: sym({ ballonnements: 'severe', gaz: 'modere', diarrhee: 'severe' }),
    hydrationL: 1.2,
    meals: [makeMeal('12:30', ['biscuits sucrés', 'pâtes blanches', 'brocoli vapeur'])],
  };

  // Mardi : correcte, repas 100 % bénéfique (sans sucre ajouté).
  days[1] = {
    ...days[1],
    quality: 'correcte',
    symptoms: sym({ ballonnements: 'leger' }),
    hydrationL: 1.8,
    meals: [makeMeal('13:00', ['brocoli vapeur', 'poulet rôti', 'ail'])],
  };

  return days;
}

describe('computeWeekStats', () => {
  const stats = computeWeekStats(buildWeek());

  it('compte les jours difficiles', () => {
    expect(stats.hardDays).toBe(1);
    expect(stats.totalDays).toBe(7);
  });

  it('compte les ballonnements sévères', () => {
    expect(stats.severeBloating).toBe(1);
  });

  it('compte les épisodes de diarrhée (modéré ou sévère)', () => {
    expect(stats.diarrheaEpisodes).toBe(1);
  });

  it('compte les jours avec repas sans sucre ajouté', () => {
    // Seul Mardi a des repas sans sucre ajouté ; Lundi contient des biscuits.
    expect(stats.noAddedSugarDays).toBe(1);
  });

  it('calcule la moyenne d’hydratation sur les jours renseignés', () => {
    expect(stats.avgHydration).toBeCloseTo(1.5, 5);
  });

  it('renvoie un score énergie entre 0 et 10', () => {
    expect(stats.energyScore).not.toBeNull();
    expect(stats.energyScore!).toBeGreaterThanOrEqual(0);
    expect(stats.energyScore!).toBeLessThanOrEqual(10);
  });
});

describe('severityByDay', () => {
  it('ventile les intensités par jour', () => {
    const pts = severityByDay(buildWeek());
    expect(pts[0]).toMatchObject({ severe: 2, modere: 1, leger: 0, total: 3 });
    expect(pts[1]).toMatchObject({ severe: 0, modere: 0, leger: 1, total: 1 });
  });
});

describe('categoryCountsByDay', () => {
  it('compte les aliments par catégorie', () => {
    const pts = categoryCountsByDay(buildWeek());
    // Lundi : biscuits(pro) + pâtes blanches(pro) + brocoli(beneficial)
    expect(pts[0]).toMatchObject({ pro: 2, beneficial: 1, neutral: 0 });
    // Mardi : brocoli + poulet + ail = 3 bénéfiques
    expect(pts[1]).toMatchObject({ pro: 0, beneficial: 3, neutral: 0 });
  });
});

describe('hydrationByDay', () => {
  it('renvoie null pour les jours sans hydratation', () => {
    const pts = hydrationByDay(buildWeek());
    expect(pts[0].hydration).toBe(1.2);
    expect(pts[2].hydration).toBeNull();
  });
});

describe('amineLoadByDay', () => {
  it('renvoie null pour les jours sans repas, score + bande sinon', () => {
    const days: DayEntry[] = [
      // Charge élevée : parmesan (high +3) + saucisson (high +3) → score ≥ 5.
      { ...emptyDay('2025-06-09'), meals: [makeMeal('12:30', ['parmesan', 'saucisson'])] },
      // Charge faible : le riz n'a pas de profil amines notable.
      { ...emptyDay('2025-06-10'), meals: [makeMeal('12:30', ['riz'])] },
      emptyDay('2025-06-11'), // vide → point absent
    ];
    const pts = amineLoadByDay(days);
    expect(pts[0].band).toBe('eleve');
    expect(pts[0].score!).toBeGreaterThanOrEqual(5);
    expect(pts[1].band).toBe('faible');
    expect(pts[2]).toMatchObject({ score: null, band: null });
  });
});

describe('mealSymptomPoints', () => {
  it('un point par repas, avec intensité max et symptômes actifs', () => {
    const day: DayEntry = {
      ...emptyDay('2025-06-09'),
      meals: [
        { ...makeMeal('07:30', ['café']) }, // sans symptôme
        { ...makeMeal('19:30', ['pizza']), symptoms: sym({ ballonnements: 'severe', gaz: 'leger' }) },
        { id: 'vide', time: '16:00', foods: [] }, // ni aliment ni symptôme → ignoré
      ],
    };
    const pts = mealSymptomPoints([day]);
    expect(pts).toHaveLength(2);
    expect(pts[0]).toMatchObject({ time: '07:30', hour: 7.5, max: null, actifs: [] });
    expect(pts[1].max).toBe('severe');
    expect(pts[1].hour).toBe(19.5);
    expect(pts[1].actifs).toEqual(['Ballonnements (sévère)', 'Gaz / flatulences (léger)']);
  });

  it('heure invalide → 12 h (repli)', () => {
    const day: DayEntry = {
      ...emptyDay('2025-06-09'),
      meals: [{ ...makeMeal('??', ['riz']) }],
    };
    expect(mealSymptomPoints([day])[0].hour).toBe(12);
  });
});

describe('stoolByDay / stoolBand', () => {
  it('mappe le type de Bristol, « aucune selle » → 0, non renseigné → null', () => {
    const days: DayEntry[] = [
      { ...emptyDay('2025-06-09'), stool: { bristol: 6, label: 'Selles molles, déchiquetées (type 6)', count: 3 } },
      { ...emptyDay('2025-06-10'), stool: { label: 'Aucune selle' } },
      emptyDay('2025-06-11'), // non renseigné
      { ...emptyDay('2025-06-12'), stool: { label: 'Selles molles' } }, // label libre sans type → pas plaçable
    ];
    const pts = stoolByDay(days);
    expect(pts[0]).toMatchObject({ bristol: 6, count: 3 });
    expect(pts[1].bristol).toBe(0);
    expect(pts[2].bristol).toBeNull();
    expect(pts[3].bristol).toBeNull();
  });

  it('classe les types par zone', () => {
    expect(stoolBand(0)).toBe('constipation');
    expect(stoolBand(2)).toBe('constipation');
    expect(stoolBand(4)).toBe('normal');
    expect(stoolBand(6)).toBe('diarrhee');
    expect(stoolBand(7)).toBe('diarrhee');
  });
});

describe('topSymptoms', () => {
  it('classe par poids décroissant et exclut les poids nuls', () => {
    const tops = topSymptoms(buildWeek());
    expect(tops[0].key).toBe('ballonnements'); // severe(3) + leger(1) = 4
    expect(tops.every((t) => t.weight > 0)).toBe(true);
    // diarrhée severe (3) et gaz modéré (2) présents, constipation absente exclue
    expect(tops.find((t) => t.key === 'constipation')).toBeUndefined();
  });
});

describe('effectiveDaySymptoms', () => {
  it('prend le max par symptôme entre niveau jour et repas', () => {
    const day = {
      ...emptyDay('2025-06-09'),
      symptoms: sym({ ballonnements: 'leger', diarrhee: 'modere' }),
      meals: [
        { ...makeMeal('08:00', ['café']), symptoms: sym({ ballonnements: 'severe' }) },
        { ...makeMeal('12:30', ['pain']), symptoms: sym({ gaz: 'modere' }) },
      ],
    };
    const eff = effectiveDaySymptoms(day);
    expect(eff.ballonnements).toBe('severe'); // repas > jour
    expect(eff.diarrhee).toBe('modere'); // niveau jour conservé
    expect(eff.gaz).toBe('modere'); // depuis un repas
    expect(eff.reflux).toBe('absent');
  });
});

describe('dayHasContent', () => {
  it('faux pour un jour vide', () => {
    expect(dayHasContent(emptyDay('2025-06-09'))).toBe(false);
  });
  it('vrai dès qu’il y a un aliment', () => {
    const d = { ...emptyDay('2025-06-09'), meals: [makeMeal('08:00', ['café'])] };
    expect(dayHasContent(d)).toBe(true);
  });
  it('vrai dès qu’il y a un symptôme non absent', () => {
    const d = { ...emptyDay('2025-06-09'), symptoms: sym({ gaz: 'leger' }) };
    expect(dayHasContent(d)).toBe(true);
  });
});

describe('latestActiveDate', () => {
  it('renvoie la date du dernier jour renseigné', () => {
    const days: DayEntry[] = [
      { ...emptyDay('2025-06-09'), meals: [makeMeal('08:00', ['café'])] },
      emptyDay('2025-06-10'), // vide → ignoré
      { ...emptyDay('2025-06-11'), symptoms: sym({ gaz: 'modere' }) },
    ];
    expect(latestActiveDate(days)).toBe('2025-06-11');
  });
  it('renvoie undefined si tout est vide', () => {
    expect(latestActiveDate([emptyDay('2025-06-09'), emptyDay('2025-06-10')])).toBeUndefined();
  });
});

describe('fillDayRange', () => {
  it('comble les trous avec des jours vides et trie par date', () => {
    const monday = { ...emptyDay('2025-06-09'), meals: [makeMeal('08:00', ['café'])] };
    const thursday = { ...emptyDay('2025-06-12'), symptoms: sym({ gaz: 'modere' }) };
    const filled = fillDayRange([thursday, monday]); // désordonné volontairement
    expect(filled.map((d) => d.date)).toEqual(['2025-06-09', '2025-06-10', '2025-06-11', '2025-06-12']);
    expect(filled[0]).toBe(monday);
    expect(filled[3]).toBe(thursday);
    expect(dayHasContent(filled[1])).toBe(false);
    expect(dayHasContent(filled[2])).toBe(false);
  });

  it('franchit les fins de mois sans trou', () => {
    const filled = fillDayRange([emptyDay('2025-06-29'), emptyDay('2025-07-02')]);
    expect(filled.map((d) => d.date)).toEqual(['2025-06-29', '2025-06-30', '2025-07-01', '2025-07-02']);
  });

  it('liste vide → liste vide, jour unique → inchangé', () => {
    expect(fillDayRange([])).toEqual([]);
    const single = emptyDay('2025-06-09');
    expect(fillDayRange([single])).toEqual([single]);
  });
});

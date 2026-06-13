import { describe, expect, it } from 'vitest';
import type { DayEntry, Intensity, SymptomKey } from '../types';
import { emptyDay, emptySymptoms, makeMeal } from './factory';
import {
  categoryCountsByDay,
  computeWeekStats,
  dayHasContent,
  effectiveDaySymptoms,
  hydrationByDay,
  latestActiveDate,
  severityByDay,
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

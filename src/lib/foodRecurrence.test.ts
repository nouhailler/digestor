import { describe, expect, it } from 'vitest';
import type { DayEntry, FoodCategory } from '../types';
import { emptyDay, makeMeal } from './factory';
import { foodRecurrence } from './foodRecurrence';

/** Jour minimal : une liste de repas décrits par `heure → aliments`. */
function day(date: string, meals: Record<string, string[]>): DayEntry {
  return {
    ...emptyDay(date),
    meals: Object.entries(meals).map(([time, foods]) => makeMeal(time, foods)),
  };
}

function row(rows: ReturnType<typeof foodRecurrence>, name: string) {
  const r = rows.find((x) => x.name.toLowerCase().startsWith(name.toLowerCase()));
  if (!r) throw new Error(`ligne « ${name} » absente`);
  return r;
}

describe('foodRecurrence', () => {
  const days = [
    day('2026-07-01', { '12:30': ['Tomates', 'Riz blanc'] }),
    day('2026-07-02', {}),
    day('2026-07-05', { '12:30': ['Tomate'], '19:30': ['Tomate', 'Poulet'] }),
    day('2026-07-09', { '19:30': ['Tomates'] }),
  ];

  it('compte les mentions et les jours distincts', () => {
    const rows = foodRecurrence(days, '2026-07-10');
    const tomate = row(rows, 'tomate');
    expect(tomate.mentions).toBe(4); // 1 + 2 (même jour) + 1
    expect(tomate.dates).toEqual(['2026-07-01', '2026-07-05', '2026-07-09']);
  });

  it('donne la plage « de date à date » et l’étendue', () => {
    const tomate = row(foodRecurrence(days, '2026-07-10'), 'tomate');
    expect(tomate.first).toBe('2026-07-01');
    expect(tomate.last).toBe('2026-07-09');
    expect(tomate.spanDays).toBe(9);
    expect(tomate.avgIntervalDays).toBe(4); // 8 jours d’écart / 2 intervalles
    expect(tomate.daysSinceLast).toBe(1);
  });

  it('regroupe les quasi-doublons et affiche l’orthographe la plus fréquente', () => {
    const rows = foodRecurrence(days, '2026-07-10');
    expect(rows.filter((r) => r.key === 'tomate')).toHaveLength(1);
    // 2 « Tomates » et 2 « Tomate » → égalité, la 1re orthographe vue l’emporte.
    expect(row(rows, 'tomate').name).toBe('Tomates');
  });

  it('trie du plus récurrent au moins récurrent', () => {
    const rows = foodRecurrence(days, '2026-07-10');
    expect(rows[0].key).toBe('tomate');
    expect(rows.map((r) => r.dates.length)).toEqual([...rows.map((r) => r.dates.length)].sort((a, b) => b - a));
  });

  it('un aliment vu une seule fois : pas d’intervalle moyen, étendue de 1 jour', () => {
    const poulet = row(foodRecurrence(days, '2026-07-10'), 'poulet');
    expect(poulet.mentions).toBe(1);
    expect(poulet.spanDays).toBe(1);
    expect(poulet.avgIntervalDays).toBeNull();
    expect(poulet.daysSinceLast).toBe(5);
  });

  it('garde la catégorie dominante de l’aliment', () => {
    const rows = foodRecurrence(days, '2026-07-10');
    const cats: Record<string, FoodCategory> = Object.fromEntries(rows.map((r) => [r.key, r.category]));
    expect(cats['riz blanc']).toBe('pro');
  });

  it('ignore les noms vides et déduit la fin de fenêtre si absente', () => {
    const d = day('2026-07-05', { '12:30': ['  ', 'Kiwi'] });
    const rows = foodRecurrence([d]);
    expect(rows).toHaveLength(1);
    expect(rows[0].daysSinceLast).toBe(0);
  });

  it('renvoie une liste vide sans aliment', () => {
    expect(foodRecurrence([emptyDay('2026-07-05')])).toEqual([]);
  });
});

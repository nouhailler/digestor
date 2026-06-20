import { describe, expect, it } from 'vitest';
import type { DayEntry } from '../types';
import { emptyDay } from './factory';
import { searchJournal } from './journalSearch';

function mk(date: string, foods: string[], patch: Partial<DayEntry> = {}): DayEntry {
  const d = emptyDay(date);
  d.meals = [{ id: `m-${date}`, time: '12:00', foods: foods.map((name, i) => ({ id: `${date}-${i}`, name, category: 'neutral' })) }];
  return { ...d, ...patch };
}

const days: DayEntry[] = [
  mk('2026-06-01', ['Pain blanc', 'Café']),
  mk('2026-06-02', ['Tomate'], { notes: 'Repas au restaurant, beaucoup de pain', symptoms: { ...emptyDay('x').symptoms, ballonnements: 'severe' } }),
  mk('2026-06-03', ['Pomme']),
];

describe('searchJournal', () => {
  it('ignore les requêtes trop courtes', () => {
    expect(searchJournal(days, 'p')).toEqual([]);
  });

  it('trouve par aliment, du plus récent au plus ancien', () => {
    const r = searchJournal(days, 'pain');
    expect(r.map((x) => x.date)).toEqual(['2026-06-02', '2026-06-01']);
    expect(r[1].foods).toContain('Pain blanc');
  });

  it('matche les notes', () => {
    const r = searchJournal(days, 'restaurant');
    expect(r).toHaveLength(1);
    expect(r[0].noteMatch).toBe(true);
  });

  it('matche les symptômes actifs par libellé', () => {
    const r = searchJournal(days, 'ballonnement');
    expect(r).toHaveLength(1);
    expect(r[0].symptoms).toContain('Ballonnements');
  });

  it('ne renvoie rien si aucune correspondance', () => {
    expect(searchJournal(days, 'chocolat')).toEqual([]);
  });
});

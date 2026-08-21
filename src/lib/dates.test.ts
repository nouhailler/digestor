import { describe, expect, it } from 'vitest';
import {
  dateTimeLabel,
  dayLongLabel,
  dayMonthLabel,
  fromISODate,
  toISODate,
  weekDays,
  weekLabel,
} from './dates';

describe('toISODate / fromISODate', () => {
  it('formate et reparse une date ISO', () => {
    const d = fromISODate('2025-06-09');
    expect(toISODate(d)).toBe('2025-06-09');
  });
});

describe('weekDays', () => {
  it('renvoie lundi→dimanche pour une date en milieu de semaine', () => {
    // 2025-06-11 est un mercredi
    const days = weekDays(fromISODate('2025-06-11'));
    expect(days).toEqual([
      '2025-06-09', // lundi
      '2025-06-10',
      '2025-06-11',
      '2025-06-12',
      '2025-06-13',
      '2025-06-14',
      '2025-06-15', // dimanche
    ]);
  });

  it('le lundi appartient à sa propre semaine', () => {
    const days = weekDays(fromISODate('2025-06-09'));
    expect(days[0]).toBe('2025-06-09');
  });

  it('le dimanche reste dans la semaine commençant le lundi précédent', () => {
    const days = weekDays(fromISODate('2025-06-15'));
    expect(days[0]).toBe('2025-06-09');
    expect(days[6]).toBe('2025-06-15');
  });
});

describe('weekLabel', () => {
  it('formate une semaine au sein du même mois', () => {
    expect(weekLabel(fromISODate('2025-06-11'))).toBe('Semaine du 9 au 15 juin 2025');
  });

  it('gère un chevauchement de mois', () => {
    // semaine du 30 juin au 6 juillet 2025
    const label = weekLabel(fromISODate('2025-07-02'));
    expect(label).toContain('30');
    expect(label).toContain('juin');
    expect(label).toContain('juil');
  });
});

describe('dayLongLabel', () => {
  it('capitalise le jour', () => {
    expect(dayLongLabel('2025-06-09')).toBe('Lundi 9 juin');
    expect(dayLongLabel('2025-06-10')).toBe('Mardi 10 juin');
  });
});

describe('dayMonthLabel', () => {
  it('jour + mois abrégé, sans point', () => {
    expect(dayMonthLabel('2025-06-09')).toBe('9 juin');
    expect(dayMonthLabel('2025-12-01')).toBe('1 déc');
  });
});

describe('dateTimeLabel', () => {
  it('date longue + heure', () => {
    expect(dateTimeLabel('2025-06-09T08:05:00')).toBe('9 juin 2025, 8 h 05');
    expect(dateTimeLabel('2025-06-09T14:30:00')).toBe('9 juin 2025, 14 h 30');
  });
});

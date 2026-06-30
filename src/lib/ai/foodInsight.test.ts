import { describe, expect, it } from 'vitest';
import { buildFoodInsight, deriveCategory } from './foodInsight';

describe('deriveCategory', () => {
  it('classe « pro » dès qu’un signal est à éviter', () => {
    expect(deriveCategory('high', 'favorable', 'favorable')).toBe('pro');
    expect(deriveCategory('low', 'eviter', 'favorable')).toBe('pro');
    expect(deriveCategory('low', 'favorable', 'eviter')).toBe('pro');
  });

  it('classe « beneficial » seulement si tout est au vert', () => {
    expect(deriveCategory('low', 'favorable', 'favorable')).toBe('beneficial');
  });

  it('classe « neutral » dans les cas intermédiaires', () => {
    expect(deriveCategory('moderate', 'favorable', 'favorable')).toBe('neutral');
    expect(deriveCategory('low', 'attention', 'favorable')).toBe('neutral');
    expect(deriveCategory('unknown', 'inconnu', 'inconnu')).toBe('neutral');
  });
});

describe('buildFoodInsight — amines biogènes', () => {
  it('coerce un bloc amines valide', () => {
    const ins = buildFoodInsight(
      { amines: { level: 'high', liberator: true, daoBlocker: false, group: 'fromage', note: 'Affiné.' } },
      'Roquefort',
      'test',
    );
    expect(ins.amines).toEqual({ level: 'high', liberator: true, group: 'fromage', note: 'Affiné.' });
  });

  it('ignore un niveau invalide → unknown, et omet le bloc s’il est vide', () => {
    expect(buildFoodInsight({ amines: { level: 'bidon' } }, 'X', 'test').amines).toBeUndefined();
    expect(buildFoodInsight({}, 'X', 'test').amines).toBeUndefined();
  });

  it('garde le bloc si un flag est présent même sans niveau', () => {
    const ins = buildFoodInsight({ amines: { liberator: true } }, 'Fraise', 'test');
    expect(ins.amines).toEqual({ level: 'unknown', liberator: true });
  });
});

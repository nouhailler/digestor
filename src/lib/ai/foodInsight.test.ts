import { describe, expect, it } from 'vitest';
import { deriveCategory } from './foodInsight';

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

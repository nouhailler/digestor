import { describe, expect, it } from 'vitest';
import { parseMealTags, resolveMealTag } from './mealTags';

describe('resolveMealTag', () => {
  it('reconnaît les synonymes (accents inclus)', () => {
    expect(resolveMealTag('protéiné')).toBe('proteine');
    expect(resolveMealTag('protéines')).toBe('proteine');
    expect(resolveMealTag('Fibres')).toBe('fibres');
    expect(resolveMealTag('sucré')).toBe('sucre');
    expect(resolveMealTag('gras')).toBeNull();
  });
});

describe('parseMealTags', () => {
  it('parse, dédoublonne et ignore l’inconnu', () => {
    expect(parseMealTags(['protéiné', 'proteine', 'sucré', 'gras'])).toEqual(['proteine', 'sucre']);
  });

  it('renvoie [] hors tableau', () => {
    expect(parseMealTags('proteine')).toEqual([]);
    expect(parseMealTags(undefined)).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { clampAmount, defaultQuantity, formatAmount, formatQuantity, parseQuantity } from './quantity';

describe('formatQuantity', () => {
  it('formate les unités courantes', () => {
    expect(formatQuantity({ amount: 1, unit: 'cac' })).toBe('1 càc');
    expect(formatQuantity({ amount: 2, unit: 'cas' })).toBe('2 càs');
    expect(formatQuantity({ amount: 150, unit: 'g' })).toBe('150 g');
  });

  it('accorde le pluriel des unités qui varient', () => {
    expect(formatQuantity({ amount: 1, unit: 'portion' })).toBe('1 portion');
    expect(formatQuantity({ amount: 2, unit: 'portion' })).toBe('2 portions');
    expect(formatQuantity({ amount: 3, unit: 'tranche' })).toBe('3 tranches');
  });

  it('affiche les demis en glyphe', () => {
    expect(formatAmount(0.5)).toBe('½');
    expect(formatAmount(1.5)).toBe('1½');
    expect(formatQuantity({ amount: 0.5, unit: 'cac' })).toBe('½ càc');
  });
});

describe('clampAmount', () => {
  it('ne descend pas sous un pas et respecte le pas', () => {
    expect(clampAmount(0, 'cac')).toBe(0.5);
    expect(clampAmount(0.5, 'g')).toBe(10); // pas de 10 pour les grammes
    expect(clampAmount(55, 'g')).toBe(60);
  });
});

describe('defaultQuantity', () => {
  it('propose un défaut adapté à l’unité', () => {
    expect(defaultQuantity('cac')).toEqual({ amount: 1, unit: 'cac' });
    expect(defaultQuantity('g')).toEqual({ amount: 50, unit: 'g' });
  });
});

describe('parseQuantity', () => {
  it('lit un objet structuré', () => {
    expect(parseQuantity({ amount: 2, unit: 'cas' })).toEqual({ amount: 2, unit: 'cas' });
  });

  it('lit des chaînes libres avec unités et synonymes', () => {
    expect(parseQuantity('1 càc')).toEqual({ amount: 1, unit: 'cac' });
    expect(parseQuantity('2 cuillères à soupe')).toEqual({ amount: 2, unit: 'cas' });
    expect(parseQuantity('150 g')).toEqual({ amount: 150, unit: 'g' });
    expect(parseQuantity('une pincée')).toEqual({ amount: 1, unit: 'pincee' });
  });

  it('gère fractions et glyphes', () => {
    expect(parseQuantity('1/2 verre')).toEqual({ amount: 0.5, unit: 'verre' });
    expect(parseQuantity('½ càs')).toEqual({ amount: 0.5, unit: 'cas' });
  });

  it('renvoie undefined si rien d’exploitable', () => {
    expect(parseQuantity('beaucoup')).toBeUndefined();
    expect(parseQuantity('')).toBeUndefined();
    expect(parseQuantity(undefined)).toBeUndefined();
    expect(parseQuantity({ amount: 1 })).toBeUndefined(); // unité manquante
  });
});

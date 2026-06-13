import { describe, expect, it } from 'vitest';
import {
  classifyFood,
  dictionaryFoods,
  dictionarySize,
  isAddedSugarOrAlcohol,
  normalize,
} from './foodClassifier';

describe('normalize', () => {
  it('passe en minuscules, retire accents et ponctuation', () => {
    expect(normalize('Œufs Brouillés (2)')).toBe('oeufs brouilles 2');
    expect(normalize('  Pâtes   blanches  ')).toBe('pates blanches');
    expect(normalize("Jus d'orange")).toBe('jus d orange');
  });

  it('renvoie une chaîne vide pour une saisie vide', () => {
    expect(normalize('   ')).toBe('');
  });
});

describe('classifyFood', () => {
  it('classe les aliments pro (rouge)', () => {
    expect(classifyFood('pain blanc')).toBe('pro');
    expect(classifyFood('confiture')).toBe('pro');
    expect(classifyFood('vin blanc (1 verre)')).toBe('pro');
    expect(classifyFood('biscuits sucrés')).toBe('pro');
  });

  it('classe les aliments bénéfiques (vert)', () => {
    expect(classifyFood('brocoli vapeur')).toBe('beneficial');
    expect(classifyFood('ail')).toBe('beneficial');
    expect(classifyFood('huile de coco')).toBe('beneficial');
    expect(classifyFood('œufs brouillés (2)')).toBe('beneficial');
  });

  it('classe les aliments neutres (gris)', () => {
    expect(classifyFood('café')).toBe('neutral');
    expect(classifyFood('quinoa (petite portion)')).toBe('neutral');
    expect(classifyFood('riz complet')).toBe('neutral');
  });

  it('privilégie la correspondance la plus longue', () => {
    // "riz complet" (neutral) doit gagner sur "riz" (pro)
    expect(classifyFood('riz complet')).toBe('neutral');
    // "pain complet" (neutral) doit gagner sur "pain" (pro)
    expect(classifyFood('pain complet aux graines')).toBe('neutral');
    // "pomme de terre" (neutral) sur "pomme" (neutral) — reste neutral
    expect(classifyFood('pomme de terre vapeur')).toBe('neutral');
  });

  it('retombe sur neutral pour un aliment inconnu', () => {
    expect(classifyFood('aliment imaginaire xyz')).toBe('neutral');
    expect(classifyFood('')).toBe('neutral');
  });
});

describe('dictionaryFoods', () => {
  it('expose tout le catalogue (≥ 200 aliments) avec leur catégorie', () => {
    const foods = dictionaryFoods();
    expect(foods.length).toBe(dictionarySize());
    expect(foods.length).toBeGreaterThan(200);
    expect(foods.every((f) => ['pro', 'beneficial', 'neutral'].includes(f.category))).toBe(true);
    expect(foods.find((f) => f.name === 'brocoli')?.category).toBe('beneficial');
  });
});

describe('isAddedSugarOrAlcohol', () => {
  it('détecte sucre et alcool', () => {
    expect(isAddedSugarOrAlcohol('biscuits sucrés')).toBe(true);
    expect(isAddedSugarOrAlcohol("jus d'orange")).toBe(true);
    expect(isAddedSugarOrAlcohol('vin blanc')).toBe(true);
    expect(isAddedSugarOrAlcohol('confiture')).toBe(true);
  });

  it('ignore les aliments sans sucre ajouté', () => {
    expect(isAddedSugarOrAlcohol('brocoli vapeur')).toBe(false);
    expect(isAddedSugarOrAlcohol('poulet rôti')).toBe(false);
  });
});

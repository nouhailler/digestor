import { describe, expect, it } from 'vitest';
import type { FoodInsight } from '../types';
import { amineBreakdown, amineTolerance, classifyAmines, dayAmineLoad, withDictionaryAmines } from './biogenicAmines';

describe('classifyAmines', () => {
  it('classe les aliments fermentés/affinés en élevé', () => {
    expect(classifyAmines('Roquefort').level).toBe('high');
    expect(classifyAmines('saucisson sec').level).toBe('high');
    expect(classifyAmines('vin rouge').level).toBe('high');
    expect(classifyAmines('choucroute').level).toBe('high');
    expect(classifyAmines('thon').level).toBe('high');
  });

  it('classe les aliments frais en faible', () => {
    expect(classifyAmines('courgette').level).toBe('low');
    expect(classifyAmines('pomme').level).toBe('low');
    expect(classifyAmines('riz').level).toBe('low');
  });

  it('marque les histamino-libérateurs et bloqueurs de DAO', () => {
    expect(classifyAmines('fraise').liberator).toBe(true);
    expect(classifyAmines('chocolat noir').daoBlocker).toBe(true);
    expect(classifyAmines('vin rouge').daoBlocker).toBe(true);
  });

  it('renvoie unknown pour un aliment inconnu (n’invente pas « faible »)', () => {
    expect(classifyAmines('aliment martien').level).toBe('unknown');
    expect(classifyAmines('').level).toBe('unknown');
  });

  it('match partiel : le terme le plus long gagne', () => {
    // "vin rouge" (9) doit primer sur "vin" (3)
    expect(classifyAmines('un verre de vin rouge').note).toMatch(/riche/i);
  });

  it('porte la famille déclencheuse sur les aliments élevés', () => {
    expect(classifyAmines('roquefort').group).toBe('fromage');
    expect(classifyAmines('vin rouge').group).toBe('alcool');
  });
});

describe('dayAmineLoad', () => {
  it('charge faible pour une journée d’aliments frais', () => {
    const r = dayAmineLoad(['courgette', 'poulet', 'riz', 'pomme']);
    expect(r.band).toBe('faible');
    expect(r.highCount).toBe(0);
    expect(r.combo).toBe(false);
  });

  it('cumule le score (modéré +1, élevé +3, libérateur/DAO +1)', () => {
    // roquefort high(3) + group fromage ; chocolat moderate(1) + liberator(+1) + dao(+1) = 3
    const r = dayAmineLoad(['roquefort', 'chocolat']);
    expect(r.score).toBe(3 + 3);
    expect(r.band).toBe('eleve'); // >= 5
    expect(r.highCount).toBe(1);
    expect(r.liberators).toBe(1);
    expect(r.daoBlockers).toBe(1);
  });

  it('détecte la combinaison alcool + fromage/charcuterie/fermenté et escalade', () => {
    const r = dayAmineLoad(['vin rouge', 'comté']);
    expect(r.combo).toBe(true);
    expect(r.band).toBe('eleve');
    expect(r.groups).toEqual(expect.arrayContaining(['alcool', 'fromage']));
  });

  it('pas de combo si l’alcool est seul (sans fromage/charcuterie/fermenté)', () => {
    const r = dayAmineLoad(['vin rouge', 'courgette']);
    expect(r.combo).toBe(false);
  });

  it('charge modérée entre les seuils', () => {
    const r = dayAmineLoad(['tomate', 'epinard']); // 1 + 1(liberator tomate) + 1 = 3 → modéré
    expect(r.band).toBe('modere');
  });
});

describe('amineTolerance', () => {
  it('dérive la portion tolérée du niveau', () => {
    expect(amineTolerance({ level: 'high' })?.level).toBe('avoid');
    expect(amineTolerance({ level: 'moderate' })?.level).toBe('moderate');
    expect(amineTolerance({ level: 'low' })?.level).toBe('free');
    expect(amineTolerance({ level: 'unknown' })).toBeUndefined();
  });

  it('rétrograde un « faible » libérateur/DAO en portion modérée (prudence)', () => {
    expect(amineTolerance({ level: 'low', liberator: true })?.level).toBe('moderate');
    expect(amineTolerance({ level: 'low', daoBlocker: true })?.level).toBe('moderate');
  });

  it('respecte une tolérance explicite et sa note', () => {
    const t = amineTolerance({ level: 'high', tolerance: 'moderate', toleranceNote: '1 tranche fine' });
    expect(t).toEqual({ level: 'moderate', note: '1 tranche fine' });
  });
});

describe('withDictionaryAmines', () => {
  const base: FoodInsight = {
    key: 'x',
    name: 'x',
    category: 'neutral',
    fodmapLevel: 'low',
    fodmaps: { fructose: 'low', lactose: 'low', fructans: 'low', gos: 'low', polyols: 'low' },
    sibo: { verdict: 'inconnu', note: '' },
    candida: { verdict: 'inconnu', note: '' },
    summary: '',
    tips: [],
    model: 'test',
    updatedAt: '',
  };

  it('complète depuis le dictionnaire une fiche sans amines', () => {
    const out = withDictionaryAmines({ ...base, name: 'Roquefort' });
    expect(out.amines?.level).toBe('high');
  });

  it('ne touche pas une fiche déjà pourvue (même référence)', () => {
    const ins = { ...base, name: 'Roquefort', amines: { level: 'moderate' as const } };
    expect(withDictionaryAmines(ins)).toBe(ins);
  });

  it('laisse inchangée une fiche dont l’aliment est inconnu du dictionnaire', () => {
    const ins = { ...base, name: 'aliment martien' };
    expect(withDictionaryAmines(ins)).toBe(ins);
  });
});

describe('amineBreakdown', () => {
  it('liste les contributeurs (élevé d’abord), les freineurs de DAO et les libérateurs', () => {
    const b = amineBreakdown(['Vin rouge', 'Tomate', 'Riz', 'Courgette']);
    // contributeurs = niveau modéré/élevé, trié élevé d'abord
    expect(b.contributors.map((c) => c.name)).toEqual(['Vin rouge', 'Tomate']);
    expect(b.daoBlockers.map((c) => c.name)).toEqual(['Vin rouge']); // vin = freine la DAO
    expect(b.liberators.map((c) => c.name)).toEqual(['Tomate']); // tomate = libératrice
    expect(b.load.band).toBe('eleve'); // vin(3)+dao(1)+tomate(1)+lib(1) = 6
  });

  it('dédoublonne par nom normalisé', () => {
    const b = amineBreakdown(['Roquefort', 'roquefort', 'ROQUEFORT']);
    expect(b.contributors).toHaveLength(1);
  });
});

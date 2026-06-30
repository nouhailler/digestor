import { describe, expect, it } from 'vitest';
import { classifyAmines, dayAmineLoad } from './biogenicAmines';

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

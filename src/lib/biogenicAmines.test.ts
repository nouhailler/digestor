import { describe, expect, it } from 'vitest';
import type { FoodInsight } from '../types';
import {
  amineBadge,
  amineBreakdown,
  amineNegligible,
  amineTolerance,
  classifyAmines,
  dayAmineByType,
  dayAmineLoad,
  dominantAmine,
  needsAmineProfile,
  withDictionaryAmines,
} from './biogenicAmines';

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

  it('classe les légumineuses en faible, les fèves en modéré (tyramine)', () => {
    expect(classifyAmines('lentilles corail').level).toBe('low');
    expect(classifyAmines('pois chiches').level).toBe('low');
    expect(classifyAmines('haricots rouges').level).toBe('low');
    expect(classifyAmines('feves').level).toBe('moderate');
    expect(classifyAmines('feves').tyramine).toBe('moderate');
    // « haricots verts » (plus long) prime toujours sur « haricots »
    expect(classifyAmines('haricots verts').level).toBe('low');
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

describe('amineNegligible', () => {
  it('reconnaît les aliments à amines clairement négligeables', () => {
    expect(amineNegligible('poivron')).toBe(true);
    expect(amineNegligible('Chou-fleur')).toBe(true); // match par mot : « chou »
    expect(amineNegligible('huile d’olive')).toBe(true);
    expect(amineNegligible('eau plate')).toBe(true);
    expect(amineNegligible('gousse d’ail')).toBe(true);
  });

  it('n’attrape pas par frontière de mot les aliments contenant un fragment', () => {
    // « eau » ⊂ « veau »/« gateau », « ail » ⊂ « aile »/« travail » : boundary protège
    expect(amineNegligible('veau')).toBe(false);
    expect(amineNegligible('gateau')).toBe(false);
    expect(amineNegligible('aile de poulet')).toBe(false);
    expect(amineNegligible('beaufort')).toBe(false); // fromage affiné : reste à traiter
  });

  it('exclut les cas ambigus (libérateurs / fermentés / affinés)', () => {
    expect(amineNegligible('tomate')).toBe(false);
    expect(amineNegligible('epinard')).toBe(false);
    expect(amineNegligible('fraise')).toBe(false);
    expect(amineNegligible('')).toBe(false);
  });
});

describe('needsAmineProfile', () => {
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

  it('à enrichir : inconnu du dictionnaire, sans profil, non négligeable', () => {
    expect(needsAmineProfile({ ...base, name: 'boudin noir' })).toBe(true);
  });

  it('pas à enrichir : déjà un profil amines', () => {
    expect(needsAmineProfile({ ...base, name: 'boudin noir', amines: { level: 'high' } })).toBe(false);
  });

  it('pas à enrichir : connu du dictionnaire', () => {
    expect(needsAmineProfile({ ...base, name: 'Roquefort' })).toBe(false);
  });

  it('pas à enrichir : aliment à amines négligeables', () => {
    expect(needsAmineProfile({ ...base, name: 'poivron rouge' })).toBe(false);
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

  it('liste les inhibiteurs de MAO', () => {
    const b = amineBreakdown(['Curcuma', 'Réglisse', 'Riz']);
    expect(b.maoInhibitors.map((c) => c.name).sort()).toEqual(['Curcuma', 'Réglisse']);
    expect(b.load.maoInhibitors).toBe(2);
  });
});

describe('détail par amine', () => {
  it('classifyAmines porte le détail histamine/tyramine des fromages affinés', () => {
    const roquefort = classifyAmines('roquefort');
    expect(roquefort.histamine).toBe('high');
    expect(roquefort.tyramine).toBe('high');
    expect(roquefort.fermented).toBe(true);
  });

  it('marque les inhibiteurs de MAO et la dépendance à la fraîcheur', () => {
    expect(classifyAmines('curcuma').maoInhibitor).toBe(true);
    expect(classifyAmines('fruit de la passion').maoInhibitor).toBe(true);
    expect(classifyAmines('thon').freshnessDependent).toBe(true);
  });

  it('dominantAmine renvoie l’amine la plus chargée', () => {
    expect(dominantAmine(classifyAmines('roquefort'))).toBe('histamine'); // égalité → 1re rencontrée
    expect(dominantAmine(classifyAmines('avocat'))).toBe('putrescine / cadavérine');
    expect(dominantAmine({ level: 'high' })).toBeUndefined(); // aucun détail
  });

  it('amineBadge mentionne l’inhibition de la MAO', () => {
    expect(amineBadge(classifyAmines('curcuma')).title).toMatch(/inhibe la MAO/i);
  });
});

describe('dayAmineByType', () => {
  it('sépare les axes histamine et tyramine', () => {
    // roquefort : histamine high(3) + tyramine high(3) ; jambon sec : histamine mod(1) + tyramine mod(1)
    const r = dayAmineByType(['roquefort', 'jambon sec']);
    expect(r.histamine.score).toBe(3 + 1);
    expect(r.tyramine.score).toBe(3 + 1);
    expect(r.histamine.band).toBe('modere'); // 4 → modéré (< 5)
  });

  it('l’axe histamine reprend le niveau global quand le détail est absent', () => {
    // "thon" : histamine détaillée modérée(1) ; "vin rouge" : histamine mod(1) + daoBlocker(+1)
    const r = dayAmineByType(['vin rouge']);
    expect(r.histamine.score).toBe(1 + 1); // moderate + daoBlocker
  });

  it('l’axe tyramine compte les inhibiteurs de MAO', () => {
    const r = dayAmineByType(['curcuma']); // pas de tyramine détaillée mais maoInhibitor +1
    expect(r.tyramine.score).toBe(1);
  });
});

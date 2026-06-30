import { describe, expect, it } from 'vitest';
import type { SatietyCheck } from '../types';
import {
  clampVas,
  emptySatietyCheck,
  hasSatiety,
  removeCheck,
  sortChecks,
  typeApplies,
  upsertCheck,
  VAS_NEUTRAL,
} from './satiety';

const check = (checkpoint: SatietyCheck['checkpoint'], hunger = 50): SatietyCheck => ({
  checkpoint,
  hungerIntensity: hunger,
  energyLevel: 50,
  sugarCraving: 50,
});

describe('clampVas', () => {
  it('borne à 0-100 et arrondit', () => {
    expect(clampVas(-5)).toBe(0);
    expect(clampVas(150)).toBe(100);
    expect(clampVas(42.6)).toBe(43);
  });

  it('retombe sur la valeur neutre si la valeur n’est pas finie', () => {
    expect(clampVas(Number.NaN)).toBe(VAS_NEUTRAL);
    expect(clampVas(Number.POSITIVE_INFINITY)).toBe(VAS_NEUTRAL);
  });
});

describe('emptySatietyCheck', () => {
  it('initialise les trois VAS à la valeur neutre', () => {
    const c = emptySatietyCheck('1h');
    expect(c).toEqual({
      checkpoint: '1h',
      hungerIntensity: VAS_NEUTRAL,
      energyLevel: VAS_NEUTRAL,
      sugarCraving: VAS_NEUTRAL,
    });
  });
});

describe('upsertCheck', () => {
  it('ajoute un nouveau checkpoint et trie par ordre temporel', () => {
    let list: SatietyCheck[] = [];
    list = upsertCheck(list, check('2h'));
    list = upsertCheck(list, check('immediate'));
    expect(list.map((c) => c.checkpoint)).toEqual(['immediate', '2h']);
  });

  it('remplace le relevé du même checkpoint (1 max par checkpoint)', () => {
    let list = [check('immediate', 10)];
    list = upsertCheck(list, check('immediate', 90));
    expect(list).toHaveLength(1);
    expect(list[0].hungerIntensity).toBe(90);
  });
});

describe('removeCheck / sortChecks / typeApplies', () => {
  it('retire le relevé d’un checkpoint', () => {
    const list = [check('immediate'), check('2h')];
    expect(removeCheck(list, 'immediate').map((c) => c.checkpoint)).toEqual(['2h']);
  });

  it('trie immédiat → +3 h', () => {
    const list = [check('3h'), check('immediate'), check('1h')];
    expect(sortChecks(list).map((c) => c.checkpoint)).toEqual(['immediate', '1h', '3h']);
  });

  it('le type de satiété ne s’applique qu’aux checkpoints proches', () => {
    expect(typeApplies('immediate')).toBe(true);
    expect(typeApplies('1h')).toBe(true);
    expect(typeApplies('2h')).toBe(false);
    expect(typeApplies('3h')).toBe(false);
  });
});

describe('hasSatiety', () => {
  it('détecte la présence de relevés', () => {
    expect(hasSatiety({ satiety: undefined })).toBe(false);
    expect(hasSatiety({ satiety: [] })).toBe(false);
    expect(hasSatiety({ satiety: [check('immediate')] })).toBe(true);
  });
});

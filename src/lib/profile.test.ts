import { describe, expect, it } from 'vitest';
import { buildProfileContext, hasHealthInfo } from './profile';

describe('buildProfileContext', () => {
  it('undefined si aucune info santé', () => {
    expect(buildProfileContext(undefined)).toBeUndefined();
    expect(buildProfileContext({ patientName: 'exemple' })).toBeUndefined();
    expect(hasHealthInfo({ patientName: 'x' })).toBe(false);
  });

  it('inclut âge, sexe, antécédents et médicaments (facultatifs)', () => {
    const ctx = buildProfileContext({
      patientName: 'exemple',
      age: 35,
      sex: 'femme',
      medicalHistory: 'gastrite',
      medications: 'oméprazole',
    });
    expect(ctx).toContain('âge : 35 ans');
    expect(ctx).toContain('sexe : femme');
    expect(ctx).toContain('antécédents médicaux : gastrite');
    expect(ctx).toContain('médicaments : oméprazole');
  });

  it('signale les allergies en priorité', () => {
    const ctx = buildProfileContext({ patientName: 'x', allergies: ['arachides'] });
    expect(ctx).toMatch(/ALLERGIES.*arachides/i);
  });

  it('ignore un âge nul ou vide', () => {
    expect(buildProfileContext({ patientName: 'x', age: 0 })).toBeUndefined();
  });
});

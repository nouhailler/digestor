// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SymptomGrid, cycleIntensity } from './SymptomGrid';
import { emptySymptoms } from '../lib/factory';
import { SYMPTOM_ORDER } from '../lib/constants';

afterEach(cleanup);

describe('cycleIntensity', () => {
  it('cycle absent → leger → modere → severe → absent', () => {
    expect(cycleIntensity('absent')).toBe('leger');
    expect(cycleIntensity('leger')).toBe('modere');
    expect(cycleIntensity('modere')).toBe('severe');
    expect(cycleIntensity('severe')).toBe('absent');
  });
});

describe('<SymptomGrid>', () => {
  it('affiche les 12 symptômes', () => {
    render(<SymptomGrid symptoms={emptySymptoms()} editing={false} onCycle={() => {}} />);
    expect(screen.getByText('Ballonnements')).toBeTruthy();
    expect(screen.getByText('Nausées')).toBeTruthy();
    expect(screen.queryAllByRole('button')).toHaveLength(0); // pas de bouton en lecture
  });

  it('en édition, taper une pastille appelle onCycle avec sa clé', () => {
    const onCycle = vi.fn();
    render(<SymptomGrid symptoms={emptySymptoms()} editing onCycle={onCycle} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(SYMPTOM_ORDER.length);
    fireEvent.click(screen.getByText('Ballonnements'));
    expect(onCycle).toHaveBeenCalledWith('ballonnements');
  });
});

// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { TipBanner } from './TipBanner';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('<TipBanner>', () => {
  it('affiche une astuce', () => {
    render(<TipBanner tab="journal" />);
    expect(screen.getByText(/Astuce/)).toBeTruthy();
  });

  it('se masque et mémorise le rejet au clic sur la croix', () => {
    render(<TipBanner tab="journal" />);
    fireEvent.click(screen.getByLabelText("Masquer l'astuce"));
    expect(screen.queryByText(/Astuce/)).toBeNull();
    expect(localStorage.getItem('digestor-tip-dismissed-journal')).toBe('1');
  });

  it('reste masqué si déjà rejeté', () => {
    localStorage.setItem('digestor-tip-dismissed-journal', '1');
    render(<TipBanner tab="journal" />);
    expect(screen.queryByText(/Astuce/)).toBeNull();
  });
});

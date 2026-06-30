// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { VasSlider } from './VasSlider';

afterEach(cleanup);

describe('<VasSlider>', () => {
  it('affiche le label, la valeur et les ancres', () => {
    render(<VasSlider value={42} label="Faim" leftLabel="Aucune" rightLabel="Extrême" onChange={() => {}} />);
    expect(screen.getByText('Faim')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('Aucune')).toBeTruthy();
    expect(screen.getByText('Extrême')).toBeTruthy();
  });

  it('associe le label à l’input (range) et remonte la valeur au changement', () => {
    const onChange = vi.fn();
    render(<VasSlider value={50} label="Énergie" leftLabel="Bas" rightLabel="Haut" onChange={onChange} />);
    const input = screen.getByLabelText('Énergie') as HTMLInputElement;
    expect(input.type).toBe('range');
    expect(input.value).toBe('50');
    fireEvent.change(input, { target: { value: '73' } });
    expect(onChange).toHaveBeenCalledWith(73);
  });

  it('en lecture seule, n’expose pas de slider interactif', () => {
    render(<VasSlider value={30} readOnly label="Sucre" leftLabel="Bas" rightLabel="Haut" />);
    expect(screen.queryByRole('slider')).toBeNull();
    expect(screen.getByRole('img', { name: /Sucre/ })).toBeTruthy();
  });
});

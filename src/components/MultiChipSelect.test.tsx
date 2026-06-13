// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MultiChipSelect } from './MultiChipSelect';

afterEach(cleanup);

describe('<MultiChipSelect>', () => {
  it('sélectionne une option au clic', () => {
    const onChange = vi.fn();
    render(
      <MultiChipSelect label="Allergies" options={['Lait', 'Œuf']} selected={[]} onChange={onChange} />,
    );
    fireEvent.click(screen.getByText('Lait'));
    expect(onChange).toHaveBeenCalledWith(['Lait']);
  });

  it('désélectionne une option déjà choisie', () => {
    const onChange = vi.fn();
    render(
      <MultiChipSelect label="Allergies" options={['Lait', 'Œuf']} selected={['Lait']} onChange={onChange} />,
    );
    fireEvent.click(screen.getByText('Lait'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('ajoute une valeur personnalisée via Entrée', () => {
    const onChange = vi.fn();
    render(<MultiChipSelect label="Aliments" options={[]} selected={[]} onChange={onChange} placeholder="ajouter…" />);
    const input = screen.getByPlaceholderText('ajouter…');
    fireEvent.change(input, { target: { value: 'oignon' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(['oignon']);
  });
});

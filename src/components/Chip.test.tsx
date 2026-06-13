// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Chip } from './Chip';

afterEach(cleanup);

describe('<Chip>', () => {
  it('affiche son contenu', () => {
    render(<Chip color="#fff">pain blanc</Chip>);
    expect(screen.getByText('pain blanc')).toBeTruthy();
  });

  it('rend un <span> non cliquable sans onClick', () => {
    render(<Chip color="#fff">café</Chip>);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('rend un <button> et déclenche onClick quand fourni', () => {
    const onClick = vi.fn();
    render(
      <Chip color="#fff" onClick={onClick}>
        confiture
      </Chip>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

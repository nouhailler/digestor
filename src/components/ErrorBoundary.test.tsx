// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

afterEach(cleanup);

function Boom(): never {
  throw new Error('boom');
}

test('affiche le repli quand un enfant plante (au lieu d’un écran noir)', () => {
  // React journalise l'erreur attrapée : on tait le bruit pendant le test.
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  render(
    <ErrorBoundary>
      <Boom />
    </ErrorBoundary>,
  );
  expect(screen.getByText(/n'a pas pu s'afficher/i)).toBeTruthy();
  expect(screen.getByRole('button', { name: /Recharger/i })).toBeTruthy();
  spy.mockRestore();
});

test('rend les enfants normalement sans erreur', () => {
  render(
    <ErrorBoundary>
      <p>contenu ok</p>
    </ErrorBoundary>,
  );
  expect(screen.getByText('contenu ok')).toBeTruthy();
});

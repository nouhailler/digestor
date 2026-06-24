import { describe, expect, it } from 'vitest';
import { foodSuggestions } from './foodSuggestions';

const favorites = ['Banane', 'Pain complet', 'Yaourt'];
const knownFoods = ['Banane', 'Pâtes', 'Pomme', 'Pain de mie'];

describe('foodSuggestions', () => {
  it('requête vide → les favoris (ajout rapide), marqués favoris', () => {
    const out = foodSuggestions({ query: '', favorites, knownFoods });
    expect(out).toEqual([
      { name: 'Banane', favorite: true },
      { name: 'Pain complet', favorite: true },
      { name: 'Yaourt', favorite: true },
    ]);
  });

  it('1–2 caractères → rien (trop court)', () => {
    expect(foodSuggestions({ query: 'pa', favorites, knownFoods })).toEqual([]);
  });

  it('≥ 3 caractères → favoris correspondants avant les autres aliments connus', () => {
    const out = foodSuggestions({ query: 'pai', favorites, knownFoods });
    expect(out).toEqual([
      { name: 'Pain complet', favorite: true }, // favori d'abord
      { name: 'Pain de mie', favorite: false }, // puis aliment connu
    ]);
  });

  it('déduplique par forme normalisée (favori prioritaire sur l’aliment connu)', () => {
    // « Banane » est à la fois favori et déjà saisi : il n'apparaît qu'une fois, en favori.
    const out = foodSuggestions({ query: 'banan', favorites, knownFoods });
    expect(out).toEqual([{ name: 'Banane', favorite: true }]);
  });

  it('ignore la correspondance exacte (déjà ajoutable via Entrée)', () => {
    expect(foodSuggestions({ query: 'banane', favorites, knownFoods })).toEqual([]);
  });

  it('≥ 3 caractères → les aliments récents passent devant favoris et connus', () => {
    // « Pain de mie » mangé récemment remonte avant le favori « Pain complet ».
    const out = foodSuggestions({
      query: 'pai',
      favorites,
      knownFoods,
      recent: ['Pain de mie'],
    });
    expect(out).toEqual([
      { name: 'Pain de mie', favorite: false }, // récent d'abord
      { name: 'Pain complet', favorite: true }, // puis le favori
    ]);
  });

  it('un récent qui est aussi favori garde son étoile et reste en tête', () => {
    const out = foodSuggestions({
      query: 'pai',
      favorites,
      knownFoods,
      recent: ['Pain complet'],
    });
    expect(out).toEqual([
      { name: 'Pain complet', favorite: true }, // récent ET favori → étoilé, en tête
      { name: 'Pain de mie', favorite: false },
    ]);
  });

  it('exclut les aliments déjà dans le repas et respecte la limite', () => {
    const out = foodSuggestions({
      query: '',
      favorites,
      knownFoods,
      exclude: new Set(['banane']),
      limit: 1,
    });
    expect(out).toEqual([{ name: 'Pain complet', favorite: true }]);
  });
});

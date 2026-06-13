import { describe, expect, it } from 'vitest';
import { toSuggestionSet } from './mealSuggestions';

describe('toSuggestionSet', () => {
  it('normalise des suggestions valides', () => {
    const set = toSuggestionSet(
      {
        suggestions: [
          { title: 'Déjeuner doux', foods: ['poulet', 'riz', ''], why: 'pauvre en FODMAP' },
          { title: '', foods: [], why: 'vide' }, // ignorée (ni titre ni aliments)
        ],
      },
      'modele/x:free',
    );
    expect(set.suggestions).toHaveLength(1);
    expect(set.suggestions[0].title).toBe('Déjeuner doux');
    expect(set.suggestions[0].foods).toEqual(['poulet', 'riz']); // vide filtré
    expect(set.model).toBe('modele/x:free');
  });

  it('renvoie une liste vide si le format est inattendu', () => {
    expect(toSuggestionSet({ suggestions: 'oops' }, 'm').suggestions).toEqual([]);
    expect(toSuggestionSet({}, 'm').suggestions).toEqual([]);
  });
});

import { normalize } from './foodClassifier';

export interface FoodSuggestion {
  name: string;
  favorite: boolean; // vrai si l'aliment fait partie des favoris (affiché avec une étoile)
}

interface FoodSuggestionsOptions {
  query: string;
  favorites: string[]; // noms des favoris, dans l'ordre voulu (les premiers proposés)
  knownFoods: string[]; // noms déjà saisis ailleurs (anti-doublon)
  exclude?: Set<string>; // clés normalisées à ignorer (aliments déjà dans le repas)
  limit?: number;
}

/**
 * Suggestions d'aliments pour l'ajout à un repas, **favoris en tête**.
 * - requête vide → la liste des favoris (ajout rapide) ;
 * - 1–2 caractères → rien (trop court pour filtrer utilement) ;
 * - ≥ 3 caractères → favoris correspondants d'abord, puis autres aliments connus.
 *
 * Dédupliqué par forme normalisée, en excluant `exclude` (aliments déjà présents
 * dans le repas) — rien à dupliquer.
 */
export function foodSuggestions({
  query,
  favorites,
  knownFoods,
  exclude = new Set(),
  limit = 6,
}: FoodSuggestionsOptions): FoodSuggestion[] {
  const q = normalize(query);
  const favKeys = new Set(favorites.map(normalize));
  const out: FoodSuggestion[] = [];
  const seen = new Set<string>();

  const push = (name: string, favorite: boolean) => {
    const key = normalize(name);
    if (!key || seen.has(key) || exclude.has(key)) return;
    seen.add(key);
    out.push({ name, favorite });
  };

  if (q === '') {
    for (const name of favorites) push(name, true);
    return out.slice(0, limit);
  }
  if (q.length < 3) return [];

  for (const name of favorites) {
    const n = normalize(name);
    if (n.includes(q) && n !== q) push(name, true);
  }
  for (const name of knownFoods) {
    const n = normalize(name);
    if (n.includes(q) && n !== q && !favKeys.has(n)) push(name, false);
  }
  return out.slice(0, limit);
}

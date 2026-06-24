import { normalize } from './foodClassifier';

export interface FoodSuggestion {
  name: string;
  favorite: boolean; // vrai si l'aliment fait partie des favoris (affiché avec une étoile)
}

interface FoodSuggestionsOptions {
  query: string;
  favorites: string[]; // noms des favoris, dans l'ordre voulu (les premiers proposés)
  knownFoods: string[]; // noms déjà saisis ailleurs (anti-doublon)
  recent?: string[]; // noms consommés récemment (aujourd'hui/hier/avant-hier), du plus pertinent au moins
  exclude?: Set<string>; // clés normalisées à ignorer (aliments déjà dans le repas)
  limit?: number;
}

/**
 * Suggestions d'aliments pour l'ajout à un repas, **aliments récents en tête**.
 * - requête vide → la liste des favoris (ajout rapide) ;
 * - 1–2 caractères → rien (trop court pour filtrer utilement) ;
 * - ≥ 3 caractères → d'abord les aliments consommés récemment (aujourd'hui, hier
 *   ou avant-hier, déjà ordonnés par fréquence/récence), puis les favoris, puis
 *   les autres aliments connus. On gagne du temps : ce qu'on a mangé ce matin
 *   remonte au lieu d'être noyé en bas de liste.
 *
 * Dédupliqué par forme normalisée, en excluant `exclude` (aliments déjà présents
 * dans le repas) — rien à dupliquer.
 */
export function foodSuggestions({
  query,
  favorites,
  knownFoods,
  recent = [],
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

  // 1) Récents d'abord (déjà ordonnés par fréquence/récence) : ce qu'on a mangé
  //    aujourd'hui, hier ou avant-hier remonte en tête.
  for (const name of recent) {
    const n = normalize(name);
    if (n.includes(q) && n !== q) push(name, favKeys.has(n));
  }
  // 2) Puis les favoris correspondants encore non proposés.
  for (const name of favorites) {
    const n = normalize(name);
    if (n.includes(q) && n !== q) push(name, true);
  }
  // 3) Enfin les autres aliments connus.
  for (const name of knownFoods) {
    const n = normalize(name);
    if (n.includes(q) && n !== q && !favKeys.has(n)) push(name, false);
  }
  return out.slice(0, limit);
}

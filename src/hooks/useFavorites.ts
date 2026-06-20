import { useLiveQuery } from 'dexie-react-hooks';
import type { FavoriteFood } from '../types';
import { getAllFavorites } from '../lib/db';

/** Liste, en live, des aliments favoris (triés par nom). */
export function useFavorites(): FavoriteFood[] {
  return useLiveQuery(() => getAllFavorites(), []) ?? [];
}

import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { FoodInsight } from '../types';
import { getAllFoodInsights } from '../lib/db';

/**
 * Carte live des analyses d'aliments, indexée par nom normalisé (= clé de cache).
 * Permet de refléter dynamiquement, dans les repas et l'analyse de journée,
 * une fiche d'aliment générée par l'IA (changement de couleur, contexte enrichi).
 */
export function useFoodInsightMap(): Map<string, FoodInsight> {
  const list = useLiveQuery(() => getAllFoodInsights(), []);
  return useMemo(() => new Map((list ?? []).map((i) => [i.key, i])), [list]);
}

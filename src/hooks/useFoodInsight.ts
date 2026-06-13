import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { AiConfig, FoodInsight } from '../types';
import { getFoodInsight, putFoodInsight } from '../lib/db';
import { normalize } from '../lib/foodClassifier';
import { analyzeFood } from '../lib/ai/foodInsight';

/**
 * Gère l'analyse IA d'un aliment + son cache Dexie.
 * - `insight` : fiche en cache (live), `undefined` si absente/au chargement.
 * - `analyze()` : lance l'analyse à la demande et met en cache.
 */
export function useFoodInsight(name: string) {
  const key = normalize(name);
  const insight = useLiveQuery(
    () => (key ? getFoodInsight(key) : Promise.resolve(undefined)),
    [key],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  // Réinitialise l'erreur quand on change d'aliment.
  useEffect(() => {
    setError(null);
  }, [key]);

  useEffect(() => () => abort.current?.abort(), []);

  async function analyze(config: AiConfig, profileContext?: string): Promise<void> {
    if (!key || loading) return;
    setLoading(true);
    setError(null);
    abort.current?.abort();
    abort.current = new AbortController();
    try {
      const result = await analyzeFood(name, config, {
        profileContext,
        signal: abort.current.signal,
      });
      await putFoodInsight(result);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setError(e instanceof Error ? e.message : "Échec de l'analyse.");
    } finally {
      setLoading(false);
    }
  }

  return { insight: insight as FoodInsight | undefined, loading, error, analyze };
}

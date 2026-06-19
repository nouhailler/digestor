import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { AiConfig, FoodInsight } from '../types';
import { getFoodInsight, putFoodInsight } from '../lib/db';
import { normalize } from '../lib/foodClassifier';
import { analyzeFood } from '../lib/ai/foodInsight';
import { runAiTask } from '../lib/ai/aiActivity';

/**
 * Gère l'analyse IA d'un aliment + son cache Dexie.
 * L'analyse s'exécute via le store global (`runAiTask`) : elle se poursuit
 * en arrière-plan même si le composant est démonté (changement d'écran).
 */
export function useFoodInsight(name: string) {
  const key = normalize(name);
  const insight = useLiveQuery(
    () => (key ? getFoodInsight(key) : Promise.resolve(undefined)),
    [key],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => setError(null), [key]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function analyze(config: AiConfig, profileContext?: string, details?: string): Promise<void> {
    if (!key || loading) return;
    setLoading(true);
    setError(null);
    try {
      await runAiTask(`Aliment · ${name}`, (signal) =>
        analyzeFood(name, config, { profileContext, details, signal }).then(putFoodInsight),
      );
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : "Échec de l'analyse.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  return { insight: insight as FoodInsight | undefined, loading, error, analyze };
}

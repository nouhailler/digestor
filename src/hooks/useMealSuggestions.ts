import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { AiConfig, MealSuggestionSet } from '../types';
import { getMealSuggestions, setMealSuggestions } from '../lib/db';
import { suggestMeals } from '../lib/ai/mealSuggestions';
import { runAiTask } from '../lib/ai/aiActivity';

type Plan = { kind: 'replaceAll' } | { kind: 'more' } | { kind: 'one'; index: number };

const MAX_SUGGESTIONS = 12;

/** Suggestions de repas IA (jeu unique en cache meta) : générer / compléter / régénérer une idée. */
export function useMealSuggestions() {
  const set = useLiveQuery(() => getMealSuggestions(), []);
  const [loading, setLoading] = useState(false);
  const [busyIndex, setBusyIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function core(config: AiConfig, profileContext: string | undefined, plan: Plan) {
    if (loading) return;
    setLoading(true);
    setError(null);
    if (plan.kind === 'one') setBusyIndex(plan.index);
    try {
      await runAiTask('Idées de repas', async (signal) => {
        const current = (await getMealSuggestions())?.suggestions ?? [];
        const avoid = current.map((s) => s.title).filter(Boolean);
        const count = plan.kind === 'one' ? 1 : plan.kind === 'more' ? 3 : 4;
        const res = await suggestMeals(config, {
          profileContext,
          signal,
          count,
          avoid: plan.kind === 'replaceAll' ? [] : avoid,
        });

        let next = res.suggestions;
        if (plan.kind === 'more') next = [...current, ...res.suggestions].slice(0, MAX_SUGGESTIONS);
        else if (plan.kind === 'one') {
          next = [...current];
          if (res.suggestions[0]) next[plan.index] = res.suggestions[0];
        }
        await setMealSuggestions({ suggestions: next, model: res.model, updatedAt: new Date().toISOString() });
      });
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : 'Échec de la génération.');
    } finally {
      if (mounted.current) {
        setLoading(false);
        setBusyIndex(null);
      }
    }
  }

  return {
    set: set as MealSuggestionSet | undefined,
    loading,
    busyIndex,
    error,
    /** Régénère tout le jeu (4 idées). */
    generate: (config: AiConfig, ctx?: string) => core(config, ctx, { kind: 'replaceAll' }),
    /** Ajoute des idées supplémentaires (sans écraser). */
    more: (config: AiConfig, ctx?: string) => core(config, ctx, { kind: 'more' }),
    /** Remplace une idée par une autre. */
    regenerate: (config: AiConfig, ctx: string | undefined, index: number) =>
      core(config, ctx, { kind: 'one', index }),
  };
}

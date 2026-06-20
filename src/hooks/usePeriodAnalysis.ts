import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { AiConfig, DayEntry, PeriodAnalysis } from '../types';
import { getPeriodAnalysis, putPeriodAnalysis } from '../lib/db';
import { analyzePeriod, type PeriodScope } from '../lib/ai/periodAnalysis';
import { runAiTask } from '../lib/ai/aiActivity';

/** Rapport IA d'une période (clé = portée+plage) + cache Dexie, en arrière-plan. */
export function usePeriodAnalysis(key: string) {
  const analysis = useLiveQuery(() => getPeriodAnalysis(key), [key]);
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

  async function analyze(
    days: DayEntry[],
    meta: { scope: PeriodScope; from: string; to: string; label: string },
    config: AiConfig,
    profileContext?: string,
  ): Promise<void> {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await runAiTask(`Période · ${meta.label}`, (signal) =>
        analyzePeriod(days, meta, config, { profileContext, signal }).then(putPeriodAnalysis),
      );
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : "Échec de l'analyse.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  return { analysis: analysis as PeriodAnalysis | undefined, loading, error, analyze };
}

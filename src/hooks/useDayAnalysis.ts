import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { AiConfig, DayAnalysis, DayEntry } from '../types';
import { getDayAnalysis, putDayAnalysis } from '../lib/db';
import { analyzeDay } from '../lib/ai/dayAnalysis';
import { runAiTask } from '../lib/ai/aiActivity';

/** Analyse IA d'une journée (clé = date) + cache Dexie. Exécution en arrière-plan. */
export function useDayAnalysis(date: string) {
  const analysis = useLiveQuery(() => getDayAnalysis(date), [date]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => setError(null), [date]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function analyze(day: DayEntry, config: AiConfig, profileContext?: string): Promise<void> {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await runAiTask(`Journée · ${day.date}`, (signal) =>
        analyzeDay(day, config, { profileContext, signal }).then(putDayAnalysis),
      );
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : "Échec de l'analyse.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  return { analysis: analysis as DayAnalysis | undefined, loading, error, analyze };
}

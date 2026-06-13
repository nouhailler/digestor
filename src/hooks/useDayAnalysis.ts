import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { AiConfig, DayAnalysis, DayEntry } from '../types';
import { getDayAnalysis, putDayAnalysis } from '../lib/db';
import { analyzeDay } from '../lib/ai/dayAnalysis';

/** Analyse IA d'une journée (clé = date) + cache Dexie. */
export function useDayAnalysis(date: string) {
  const analysis = useLiveQuery(() => getDayAnalysis(date), [date]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => setError(null), [date]);
  useEffect(() => () => abort.current?.abort(), []);

  async function analyze(day: DayEntry, config: AiConfig, profileContext?: string): Promise<void> {
    if (loading) return;
    setLoading(true);
    setError(null);
    abort.current?.abort();
    abort.current = new AbortController();
    try {
      const result = await analyzeDay(day, config, { profileContext, signal: abort.current.signal });
      await putDayAnalysis(result);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setError(e instanceof Error ? e.message : "Échec de l'analyse.");
    } finally {
      setLoading(false);
    }
  }

  return { analysis: analysis as DayAnalysis | undefined, loading, error, analyze };
}

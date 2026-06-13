import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { AiConfig, SymptomInfo } from '../types';
import { getSymptomInfo, putSymptomInfo } from '../lib/db';
import { normalize } from '../lib/foodClassifier';
import { explainSymptom } from '../lib/ai/symptomInfo';

/** Fiche détaillée d'un symptôme (origine/manifestation/effets/conseils) + cache. */
export function useSymptomInfo(name: string) {
  const key = normalize(name);
  const info = useLiveQuery(
    () => (key ? getSymptomInfo(key) : Promise.resolve(undefined)),
    [key],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => setError(null), [key]);
  useEffect(() => () => abort.current?.abort(), []);

  async function explain(config: AiConfig, profileContext?: string): Promise<void> {
    if (!key || loading) return;
    setLoading(true);
    setError(null);
    abort.current?.abort();
    abort.current = new AbortController();
    try {
      const result = await explainSymptom(name, config, { profileContext, signal: abort.current.signal });
      await putSymptomInfo(result);
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setError(e instanceof Error ? e.message : "Échec de l'explication.");
    } finally {
      setLoading(false);
    }
  }

  return { info: info as SymptomInfo | undefined, loading, error, explain };
}

import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { AiConfig, SymptomInfo } from '../types';
import { getSymptomInfo, putSymptomInfo } from '../lib/db';
import { normalize } from '../lib/foodClassifier';
import { explainSymptom } from '../lib/ai/symptomInfo';
import { runAiTask } from '../lib/ai/aiActivity';

/** Fiche détaillée d'un symptôme + cache. Exécution en arrière-plan (runAiTask). */
export function useSymptomInfo(name: string) {
  const key = normalize(name);
  const info = useLiveQuery(
    () => (key ? getSymptomInfo(key) : Promise.resolve(undefined)),
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

  async function explain(config: AiConfig, profileContext?: string): Promise<void> {
    if (!key || loading) return;
    setLoading(true);
    setError(null);
    try {
      await runAiTask(`Fiche · ${name}`, (signal) =>
        explainSymptom(name, config, { profileContext, signal }).then(putSymptomInfo),
      );
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : "Échec de l'explication.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  return { info: info as SymptomInfo | undefined, loading, error, explain };
}

import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { AiConfig, OrganInfo } from '../types';
import { getOrganInfo, putOrganInfo } from '../lib/db';
import { explainOrgan } from '../lib/ai/organInfo';
import { runAiTask } from '../lib/ai/aiActivity';

/** Approfondissement IA d'un organe + cache. Exécution en arrière-plan (runAiTask). */
export function useOrganInfo(id: string, name: string) {
  const info = useLiveQuery(
    () => (id ? getOrganInfo(id) : Promise.resolve(undefined)),
    [id],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => setError(null), [id]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function explain(config: AiConfig, profileContext?: string): Promise<void> {
    if (!id || loading) return;
    setLoading(true);
    setError(null);
    try {
      await runAiTask(`Organe · ${name}`, (signal) =>
        explainOrgan(id, name, config, { profileContext, signal }).then(putOrganInfo),
      );
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : "Échec de l'approfondissement.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  return { info: info as OrganInfo | undefined, loading, error, explain };
}

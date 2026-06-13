import { useLiveQuery } from 'dexie-react-hooks';
import type { AiConfig } from '../types';
import { getAiConfig, isAiReady, setAiConfig } from '../lib/db';

/**
 * Configuration IA en live (clé OpenRouter + modèle sélectionné).
 * `config` vaut `undefined` tant que le chargement n'est pas terminé.
 */
export function useAiConfig() {
  const config = useLiveQuery(() => getAiConfig(), []);
  return {
    config,
    ready: isAiReady(config),
    save: (next: AiConfig) => setAiConfig(next),
  };
}

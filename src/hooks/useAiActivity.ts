import { useEffect, useState, useSyncExternalStore } from 'react';
import { getAiSnapshot, subscribeAi } from '../lib/ai/aiActivity';

/** Snapshot live de l'activité IA globale. */
export function useAiActivity() {
  return useSyncExternalStore(subscribeAi, getAiSnapshot);
}

/**
 * Nombre de secondes écoulées depuis le passage de `active` à vrai (0 si inactif).
 * Sert au petit décompte « sablier + Ns ».
 */
export function useElapsedSeconds(active: boolean): number {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) {
      setSeconds(0);
      return;
    }
    const start = Date.now();
    setSeconds(0);
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [active]);
  return seconds;
}

/**
 * Force un re-render chaque seconde tant que `active` est vrai
 * (pour rafraîchir un décompte basé sur un timestamp global).
 */
export function useSecondTick(active: boolean): void {
  const [, setT] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setT((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
}

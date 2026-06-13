import { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { AiConfig } from '../types';
import { getEncyclopediaExtra, setEncyclopediaExtra } from '../lib/db';
import { ENCYCLOPEDIA, encyclopediaNames, type EncyclopediaCategory } from '../lib/encyclopedia';
import { enrichEncyclopedia } from '../lib/ai/symptomInfo';

/**
 * Encyclopédie = socle statique + entrées ajoutées par l'IA (cache meta),
 * fusionnées par catégorie.
 */
export function useEncyclopedia() {
  const extra = useLiveQuery(() => getEncyclopediaExtra(), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);

  const categories = useMemo<EncyclopediaCategory[]>(() => {
    const map = new Map<string, EncyclopediaCategory>();
    for (const c of ENCYCLOPEDIA) map.set(c.category, { category: c.category, items: [...c.items] });
    for (const it of extra?.items ?? []) {
      const cat = map.get(it.category) ?? { category: it.category, items: [] };
      if (!cat.items.some((x) => x.name.toLowerCase() === it.name.toLowerCase()))
        cat.items.push({ name: it.name, manifestation: it.manifestation });
      map.set(it.category, cat);
    }
    return [...map.values()];
  }, [extra]);

  async function enrich(config: AiConfig): Promise<void> {
    if (loading) return;
    setLoading(true);
    setError(null);
    abort.current?.abort();
    abort.current = new AbortController();
    try {
      const known = [...encyclopediaNames(), ...(extra?.items.map((i) => i.name) ?? [])];
      const res = await enrichEncyclopedia(config, known, { signal: abort.current.signal });
      const merged = [...(extra?.items ?? []), ...res.items];
      await setEncyclopediaExtra({ items: merged, model: res.model, updatedAt: new Date().toISOString() });
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      setError(e instanceof Error ? e.message : "Échec de l'enrichissement.");
    } finally {
      setLoading(false);
    }
  }

  return { categories, extraCount: extra?.items.length ?? 0, loading, error, enrich };
}

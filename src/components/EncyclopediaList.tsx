import { useMemo, useState } from 'react';
import { ChevronRight, Loader2, Search, Sparkles } from 'lucide-react';
import { BristolScale } from './BristolScale';
import { useAiConfig } from '../hooks/useAiConfig';
import { useEncyclopedia } from '../hooks/useEncyclopedia';
import { normalize } from '../lib/foodClassifier';

interface EncyclopediaListProps {
  onSelectSymptom: (name: string, hint: string) => void;
  onOpenAiSettings: () => void;
  autoEnrich?: boolean;
}

export function EncyclopediaList({ onSelectSymptom, onOpenAiSettings }: EncyclopediaListProps) {
  const { config, ready } = useAiConfig();
  const { categories, extraCount, loading, error, enrich } = useEncyclopedia();
  const [query, setQuery] = useState('');

  const q = normalize(query);
  const filtered = useMemo(() => {
    if (q.length < 1) return categories;
    return categories
      .map((c) => ({
        category: c.category,
        items: c.items.filter(
          (it) => normalize(it.name).includes(q) || normalize(it.manifestation).includes(q),
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [categories, q]);

  const totalMatches = filtered.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="space-y-5 text-sm">
      {/* Recherche */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3">
        <Search size={16} className="text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un symptôme…"
          title="Filtre les symptômes par nom ou description."
          className="w-full bg-transparent py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="text-muted hover:text-ink" aria-label="Effacer">
            ✕
          </button>
        )}
      </div>

      {/* Échelle de Bristol illustrée (masquée pendant une recherche) */}
      {q.length < 1 && <BristolScale />}

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-4 text-center text-muted">
          Aucun symptôme ne correspond à « {query} ».
        </p>
      ) : (
        filtered.map((cat) => (
          <div key={cat.category}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{cat.category}</h4>
            <ul className="space-y-1.5">
              {cat.items.map((it) => (
                <li key={it.name}>
                  <button
                    type="button"
                    onClick={() => onSelectSymptom(it.name, it.manifestation)}
                    className="flex w-full items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left hover:border-leger"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-ink">{it.name}</span>
                      <span className="block text-xs text-muted">{it.manifestation}</span>
                    </span>
                    <ChevronRight size={16} className="mt-0.5 shrink-0 text-muted" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      {q.length >= 1 && <p className="text-xs text-muted">{totalMatches} résultat(s).</p>}

      {/* Enrichissement IA */}
      <div className="border-t border-border/60 pt-4">
        {ready ? (
          <button
            type="button"
            onClick={() => config && enrich(config)}
            disabled={loading}
            title="Demande à l'IA des symptômes supplémentaires, ajoutés aux catégories."
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? 'Enrichissement…' : "Enrichir avec l'IA"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAiSettings}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted hover:text-ink"
          >
            <Sparkles size={15} /> Configurer l'IA pour enrichir
          </button>
        )}
        {extraCount > 0 && <p className="mt-2 text-xs text-muted">{extraCount} symptôme(s) ajouté(s) par l'IA.</p>}
        {error && <p className="mt-2" style={{ color: 'var(--color-severe)' }}>{error}</p>}
      </div>
    </div>
  );
}

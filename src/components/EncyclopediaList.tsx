import { useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Check, ChevronRight, Loader2, Search, Sparkles, StopCircle, Wand2 } from 'lucide-react';
import { BristolScale } from './BristolScale';
import { useAiConfig } from '../hooks/useAiConfig';
import { useProfile } from '../hooks/useProfile';
import { useEncyclopedia } from '../hooks/useEncyclopedia';
import { getAllSymptomInfos, putSymptomInfo } from '../lib/db';
import { explainSymptom } from '../lib/ai/symptomInfo';
import { buildProfileContext } from '../lib/profile';
import { normalize } from '../lib/foodClassifier';

interface EncyclopediaListProps {
  onSelectSymptom: (name: string, hint: string) => void;
  onOpenAiSettings: () => void;
}

export function EncyclopediaList({ onSelectSymptom, onOpenAiSettings }: EncyclopediaListProps) {
  const { config, ready } = useAiConfig();
  const { profile } = useProfile();
  const { categories, extraCount, loading, error, enrich } = useEncyclopedia();
  const detailed = useLiveQuery(() => getAllSymptomInfos(), []);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [bulk, setBulk] = useState<{ done: number; total: number } | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const stopRef = useRef(false);

  const detailedKeys = useMemo(
    () => new Set((detailed ?? []).map((d) => d.key)),
    [detailed],
  );

  const q = normalize(query);
  const filtered = useMemo(() => {
    return categories
      .filter((c) => cat === 'all' || c.category === cat)
      .map((c) => ({
        category: c.category,
        items: c.items.filter(
          (it) => q.length < 1 || normalize(it.name).includes(q) || normalize(it.manifestation).includes(q),
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [categories, cat, q]);

  const totalMatches = filtered.reduce((n, c) => n + c.items.length, 0);

  // Pré-génération en masse des fiches manquantes (sur le périmètre affiché).
  const missing = useMemo(
    () => filtered.flatMap((c) => c.items).filter((it) => !detailedKeys.has(normalize(it.name))),
    [filtered, detailedKeys],
  );

  async function runBulk() {
    if (!config || missing.length === 0) return;
    if (missing.length > 20 && !confirm(`Détailler ${missing.length} fiches d'affilée ? Cela enchaîne autant de requêtes IA.`))
      return;
    stopRef.current = false;
    setBulkError(null);
    setBulk({ done: 0, total: missing.length });
    const ctx = buildProfileContext(profile);
    for (let i = 0; i < missing.length; i++) {
      if (stopRef.current) break;
      try {
        const info = await explainSymptom(missing[i].name, config, { profileContext: ctx });
        await putSymptomInfo(info);
      } catch (e) {
        setBulkError(`« ${missing[i].name} » : ${e instanceof Error ? e.message : 'échec'}`);
        break;
      }
      setBulk({ done: i + 1, total: missing.length });
    }
    setBulk(null);
  }

  return (
    <div className="space-y-4 text-sm">
      {/* Recherche + filtre catégorie */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface-2 px-3">
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
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          title="Filtrer par catégorie de symptômes."
          className="rounded-lg border border-border bg-surface-2 px-2 py-2 text-sm text-ink [color-scheme:dark]"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category}>
              {c.category}
            </option>
          ))}
        </select>
      </div>

      {/* Échelle de Bristol (vue complète, sans recherche/filtre) */}
      {q.length < 1 && cat === 'all' && <BristolScale />}

      {/* Compteur fiches détaillées + pré-génération */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
        <span className="flex-1 text-xs text-muted">
          {detailedKeys.size} fiche(s) détaillée(s) en cache
          {missing.length > 0 ? ` · ${missing.length} sans détail ici` : ''}.
        </span>
        {missing.length > 0 &&
          (bulk ? (
            <span className="inline-flex items-center gap-2 text-xs text-ink">
              <Loader2 size={14} className="animate-spin" /> {bulk.done}/{bulk.total}
              <button type="button" onClick={() => (stopRef.current = true)} className="text-muted hover:text-severe" title="Arrêter">
                <StopCircle size={15} />
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={ready ? runBulk : onOpenAiSettings}
              title={ready ? 'Génère et met en cache les fiches détaillées manquantes (IA).' : 'Configurez l’IA d’abord.'}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
              style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
            >
              <Wand2 size={14} /> Tout détailler ({missing.length})
            </button>
          ))}
      </div>
      {bulkError && (
        <p className="rounded-lg px-3 py-2 text-xs" style={{ color: 'var(--color-severe)', background: 'rgba(240,96,106,0.08)' }}>
          {bulkError}
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-4 text-center text-muted">
          Aucun symptôme ne correspond.
        </p>
      ) : (
        filtered.map((category) => (
          <div key={category.category}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{category.category}</h4>
            <ul className="space-y-1.5">
              {category.items.map((it) => {
                const done = detailedKeys.has(normalize(it.name));
                return (
                  <li key={it.name}>
                    <button
                      type="button"
                      onClick={() => onSelectSymptom(it.name, it.manifestation)}
                      className="flex w-full items-start gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left hover:border-leger"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-ink">
                          {it.name}
                          {done && (
                            <span title="Fiche détaillée en cache">
                              <Check size={13} style={{ color: 'var(--color-leger)' }} />
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-muted">{it.manifestation}</span>
                      </span>
                      <ChevronRight size={16} className="mt-0.5 shrink-0 text-muted" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}

      {q.length >= 1 && <p className="text-xs text-muted">{totalMatches} résultat(s).</p>}

      {/* Enrichissement IA (nouveaux symptômes) */}
      <div className="border-t border-border/60 pt-4">
        {ready ? (
          <button
            type="button"
            onClick={() => config && enrich(config)}
            disabled={loading}
            title="Demande à l'IA des symptômes supplémentaires, ajoutés aux catégories."
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted hover:text-ink disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {loading ? 'Enrichissement…' : "Ajouter des symptômes (IA)"}
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

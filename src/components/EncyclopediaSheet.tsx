import { useEffect, useRef } from 'react';
import { ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { Sheet } from './Sheet';
import { useAiConfig } from '../hooks/useAiConfig';
import { useEncyclopedia } from '../hooks/useEncyclopedia';

interface EncyclopediaSheetProps {
  open: boolean;
  autoEnrich?: boolean; // lance l'enrichissement à l'ouverture (si IA configurée)
  onClose: () => void;
  onOpenAiSettings: () => void;
  onSelectSymptom: (name: string, hint: string) => void;
}

/** Encyclopédie des symptômes digestifs, classée par catégorie. */
export function EncyclopediaSheet({
  open,
  autoEnrich,
  onClose,
  onOpenAiSettings,
  onSelectSymptom,
}: EncyclopediaSheetProps) {
  const { config, ready } = useAiConfig();
  const { categories, extraCount, loading, error, enrich } = useEncyclopedia();
  const autoDone = useRef(false);

  // Déclenche l'enrichissement une seule fois si demandé à l'ouverture.
  useEffect(() => {
    if (!open) {
      autoDone.current = false;
      return;
    }
    if (autoEnrich && ready && config && !autoDone.current && !loading) {
      autoDone.current = true;
      void enrich(config);
    }
  }, [open, autoEnrich, ready, config, loading, enrich]);

  return (
    <Sheet open={open} title="Encyclopédie des symptômes" onClose={onClose}>
      <div className="space-y-5 text-sm">
        <p className="text-muted">
          Symptômes digestifs classés par catégorie. Touchez un symptôme pour sa fiche détaillée.
        </p>

        {categories.map((cat) => (
          <div key={cat.category}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{cat.category}</h4>
            <ul className="space-y-1.5">
              {cat.items.map((it) => (
                <li key={it.name}>
                  <button
                    type="button"
                    onClick={() => onSelectSymptom(it.name, it.manifestation)}
                    className="flex w-full items-start gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-left hover:border-leger"
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
        ))}

        {/* Enrichissement IA */}
        <div className="border-t border-border/60 pt-4">
          {ready ? (
            <button
              type="button"
              onClick={() => config && enrich(config)}
              disabled={loading}
              title="Demande à l'IA des symptômes digestifs supplémentaires, ajoutés aux catégories ci-dessus."
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
    </Sheet>
  );
}

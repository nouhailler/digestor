import { Activity, Leaf, Link2, Loader2, RefreshCw, Settings2, Sparkles, TriangleAlert } from 'lucide-react';
import { Sheet } from './Sheet';
import { useAiConfig } from '../hooks/useAiConfig';
import { useProfile } from '../hooks/useProfile';
import { useSymptomInfo } from '../hooks/useSymptomInfo';
import { buildProfileContext } from '../lib/profile';

interface SymptomDetailSheetProps {
  open: boolean;
  name: string;
  staticHint?: string; // repère statique affiché d'emblée
  onClose: () => void;
  onOpenAiSettings: () => void;
  /** Ouvre la fiche d'un symptôme lié (liens croisés). */
  onSelectRelated?: (name: string) => void;
}

export function SymptomDetailSheet({
  open,
  name,
  staticHint,
  onClose,
  onOpenAiSettings,
  onSelectRelated,
}: SymptomDetailSheetProps) {
  const { config, ready } = useAiConfig();
  const { profile } = useProfile();
  const { info, loading, error, explain } = useSymptomInfo(name);

  const run = () => config && explain(config, buildProfileContext(profile));

  return (
    <Sheet open={open} title={name || 'Symptôme'} onClose={onClose}>
      <div className="space-y-4 text-sm">
        {staticHint && <p className="leading-relaxed text-ink">{staticHint}</p>}

        {info ? (
          <div className="space-y-4">
            {info.origine && (
              <Block icon={<Activity size={15} style={{ color: 'var(--color-modere)' }} />} title="Origine">
                <p className="text-ink">{info.origine}</p>
              </Block>
            )}
            {info.manifestation && (
              <Block icon={<TriangleAlert size={15} style={{ color: 'var(--color-severe)' }} />} title="Manifestation">
                <p className="text-ink">{info.manifestation}</p>
              </Block>
            )}
            {info.effets.length > 0 && (
              <Block icon={<Activity size={15} style={{ color: 'var(--color-severe)' }} />} title="Effets">
                <List items={info.effets} color="var(--color-severe)" />
              </Block>
            )}
            {info.conseils.length > 0 && (
              <Block icon={<Leaf size={15} style={{ color: 'var(--color-leger)' }} />} title="Que faire">
                <List items={info.conseils} color="var(--color-leger)" />
              </Block>
            )}
            {info.related.length > 0 && (
              <Block icon={<Link2 size={15} className="text-muted" />} title="Symptômes liés">
                <div className="flex flex-wrap gap-2">
                  {info.related.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => onSelectRelated?.(r)}
                      disabled={!onSelectRelated}
                      title={onSelectRelated ? `Ouvrir la fiche : ${r}` : undefined}
                      className="rounded-full border border-border px-3 py-1 text-xs text-ink hover:border-leger disabled:opacity-70"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </Block>
            )}
            <p className="border-t border-border/60 pt-3 text-xs text-muted">
              Généré par {info.model}. Repère indicatif, non médical — consultez un professionnel.
            </p>
            {ready ? (
              <button
                type="button"
                onClick={run}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-ink disabled:opacity-50"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                Réactualiser
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAiSettings}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-ink"
              >
                <Settings2 size={15} /> Configurer l'IA pour réactualiser
              </button>
            )}
            {error && <p style={{ color: 'var(--color-severe)' }}>{error}</p>}
          </div>
        ) : ready ? (
          <div className="space-y-3">
            <p className="text-muted">
              Obtenez une fiche détaillée : origine, manifestation, effets et conseils pour l'éviter.
            </p>
            <button
              type="button"
              onClick={run}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Génération…' : "Détailler avec l'IA"}
            </button>
            {error && <p style={{ color: 'var(--color-severe)' }}>{error}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-muted">
              Pour une fiche détaillée (origine, effets, conseils), configurez une clé OpenRouter et un modèle.
            </p>
            <button
              type="button"
              onClick={onOpenAiSettings}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-ink"
            >
              <Settings2 size={16} /> Ouvrir les paramètres IA
            </button>
          </div>
        )}
      </div>
    </Sheet>
  );
}

function Block({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}

function List({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="space-y-1">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-2 text-ink">
          <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          {t}
        </li>
      ))}
    </ul>
  );
}

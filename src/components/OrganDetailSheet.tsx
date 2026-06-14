import { Activity, HeartPulse, Leaf, Link2, Loader2, RefreshCw, Settings2, Sparkles, TriangleAlert } from 'lucide-react';
import { Sheet } from './Sheet';
import { AiBusy } from './ai/AiBusy';
import { getOrgan } from '../lib/organs';
import { useAiConfig } from '../hooks/useAiConfig';
import { useProfile } from '../hooks/useProfile';
import { useOrganInfo } from '../hooks/useOrganInfo';
import { buildProfileContext } from '../lib/profile';

interface OrganDetailSheetProps {
  open: boolean;
  organId: string | null;
  onClose: () => void;
  onOpenAiSettings: () => void;
}

/** Fiche d'un organe : image + rôle + pathologies (statiques) + approfondissement IA. */
export function OrganDetailSheet({ open, organId, onClose, onOpenAiSettings }: OrganDetailSheetProps) {
  const organ = organId ? getOrgan(organId) : undefined;
  const { config, ready } = useAiConfig();
  const { profile } = useProfile();
  const { info, loading, error, explain } = useOrganInfo(organ?.id ?? '', organ?.name ?? '');

  const run = () => config && explain(config, buildProfileContext(profile));

  return (
    <Sheet open={open && !!organ} title={organ?.name ?? 'Organe'} onClose={onClose}>
      {organ && (
        <div className="space-y-4 text-sm">
          {/* Image : fond clair (illustrations à libellés sombres, peu lisibles sur thème sombre). */}
          <div className="rounded-xl bg-white p-3">
            <img
              src={organ.image}
              alt={organ.imageAlt}
              loading="lazy"
              className="mx-auto block h-auto w-full max-w-[300px]"
            />
          </div>

          <Block icon={<HeartPulse size={15} style={{ color: 'var(--color-leger)' }} />} title="Rôle dans la digestion">
            <p className="leading-relaxed text-ink">{organ.role}</p>
          </Block>

          <Block icon={<TriangleAlert size={15} style={{ color: 'var(--color-modere)' }} />} title="Pathologies fréquentes">
            <ul className="space-y-2">
              {organ.pathologies.map((p) => (
                <li key={p.name} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: 'var(--color-modere)' }}
                  />
                  <span>
                    <span className="font-medium text-ink">{p.name}</span>
                    <span className="text-muted"> — {p.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Block>

          {/* ---- Approfondissement IA ---- */}
          {info ? (
            <div className="space-y-4 border-t border-border/60 pt-4">
              {info.apercu && (
                <Block icon={<Activity size={15} style={{ color: 'var(--color-modere)' }} />} title="Pour aller plus loin">
                  <p className="text-ink">{info.apercu}</p>
                </Block>
              )}
              {info.pathologies.length > 0 && (
                <Block icon={<TriangleAlert size={15} style={{ color: 'var(--color-severe)' }} />} title="Pathologies détaillées">
                  <ul className="space-y-2">
                    {info.pathologies.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: 'var(--color-severe)' }}
                        />
                        <span>
                          <span className="font-medium text-ink">{p.name}</span>
                          {p.description && <span className="text-muted"> — {p.description}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Block>
              )}
              {info.liens && (
                <Block icon={<Link2 size={15} className="text-muted" />} title="Lien avec candidose / SIBO / SII">
                  <p className="text-ink">{info.liens}</p>
                </Block>
              )}
              {info.conseils.length > 0 && (
                <Block icon={<Leaf size={15} style={{ color: 'var(--color-leger)' }} />} title="Prendre soin de cet organe">
                  <List items={info.conseils} color="var(--color-leger)" />
                </Block>
              )}
              {info.signesAlarme.length > 0 && (
                <Block icon={<TriangleAlert size={15} style={{ color: 'var(--color-severe)' }} />} title="Quand consulter">
                  <List items={info.signesAlarme} color="var(--color-severe)" />
                </Block>
              )}
              <p className="border-t border-border/60 pt-3 text-xs text-muted">
                Généré par {info.model}. Information indicative, non médicale — consultez un professionnel.
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
            <div className="space-y-3 border-t border-border/60 pt-4">
              <p className="text-muted">
                Approfondissez avec l'IA : rôle détaillé, pathologies, lien avec candidose / SIBO / SII, conseils
                et signes d'alarme.
              </p>
              <button
                type="button"
                onClick={run}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
              >
                {loading ? <AiBusy active /> : <Sparkles size={16} />}
                {loading ? 'Génération…' : "Approfondir avec l'IA"}
              </button>
              {error && <p style={{ color: 'var(--color-severe)' }}>{error}</p>}
            </div>
          ) : (
            <div className="space-y-3 border-t border-border/60 pt-4">
              <p className="text-muted">
                Pour un approfondissement (pathologies, conseils, signes d'alarme), configurez une clé OpenRouter
                et un modèle.
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
      )}
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

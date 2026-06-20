import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, Lightbulb, Loader2, RefreshCw, Settings2, Sparkles, TrendingUp } from 'lucide-react';
import type { DayEntry, PeriodTrend } from '../../types';
import type { PeriodScope } from '../../lib/ai/periodAnalysis';
import { Sheet } from '../Sheet';
import { AiBusy } from './AiBusy';
import { VERDICT_COLOR, VERDICT_LABEL } from '../../lib/ai/insightFormat';
import { computeTrends } from '../../lib/periodReport';
import { periodKey } from '../../lib/ai/periodAnalysis';
import { buildProfileContext, hasHealthInfo } from '../../lib/profile';
import { useAiConfig } from '../../hooks/useAiConfig';
import { useProfile } from '../../hooks/useProfile';
import { usePeriodAnalysis } from '../../hooks/usePeriodAnalysis';

interface PeriodReportSheetProps {
  open: boolean;
  onClose: () => void;
  onOpenAiSettings: () => void;
  days: DayEntry[];
  scope: PeriodScope;
  from: string;
  to: string;
  label: string;
}

export function PeriodReportSheet({ open, onClose, onOpenAiSettings, days, scope, from, to, label }: PeriodReportSheetProps) {
  const { config, ready } = useAiConfig();
  const { profile } = useProfile();
  const key = periodKey(scope, from, to);
  const { analysis, loading, error, analyze } = usePeriodAnalysis(key);

  const trends = computeTrends(days);
  const runAnalyze = () => config && analyze(days, { scope, from, to, label }, config, buildProfileContext(profile));

  return (
    <Sheet open={open} title={`Rapport — ${label}`} onClose={onClose}>
      <div className="space-y-5 text-sm">
        {/* Tendances locales (toujours affichées, sans IA) */}
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
            <TrendingUp size={15} style={{ color: 'var(--color-leger)' }} /> Tendances (1re vs 2de moitié)
          </h4>
          {trends.length === 0 ? (
            <p className="text-muted">Pas assez de jours renseignés sur cette période pour dégager des tendances.</p>
          ) : (
            <ul className="space-y-1.5">
              {trends.map((t) => (
                <TrendRow key={t.metric} trend={t} />
              ))}
            </ul>
          )}
        </div>

        {/* Synthèse IA */}
        <div className="border-t border-border/60 pt-4">
          {!ready ? (
            <div className="space-y-3">
              <p className="text-muted">
                Pour une synthèse rédigée (verdict, déclencheurs récurrents, pistes), configurez une clé
                OpenRouter et un modèle gratuit.
              </p>
              <button
                type="button"
                onClick={onOpenAiSettings}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-ink"
              >
                <Settings2 size={16} /> Ouvrir les paramètres IA
              </button>
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              <span
                className="inline-block rounded-full border px-3 py-1 text-xs"
                style={{
                  color: VERDICT_COLOR[analysis.verdict],
                  borderColor: VERDICT_COLOR[analysis.verdict],
                  backgroundColor: `color-mix(in srgb, ${VERDICT_COLOR[analysis.verdict]} 12%, transparent)`,
                }}
              >
                Période : {VERDICT_LABEL[analysis.verdict]}
              </span>
              {analysis.summary && <p className="leading-relaxed text-ink">{analysis.summary}</p>}
              {analysis.trends.length > 0 && (
                <Block icon={<TrendingUp size={15} style={{ color: 'var(--color-leger)' }} />} title="Tendances">
                  {analysis.trends}
                </Block>
              )}
              {analysis.triggers.length > 0 && (
                <Block icon={<AlertTriangle size={15} style={{ color: 'var(--color-severe)' }} />} title="Déclencheurs récurrents">
                  {analysis.triggers}
                </Block>
              )}
              {analysis.improvements.length > 0 && (
                <div>
                  <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    <Lightbulb size={15} style={{ color: 'var(--color-modere)' }} /> Pistes d'amélioration
                  </h4>
                  <ul className="space-y-2.5">
                    {analysis.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 text-ink">
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-modere)]" />
                        <div>
                          <p>{imp.action}</p>
                          {imp.why && <p className="mt-0.5 text-xs leading-relaxed text-muted">Pourquoi : {imp.why}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {hasHealthInfo(profile) && <p className="text-xs text-muted">Analyse personnalisée selon votre profil santé.</p>}
              <p className="border-t border-border/60 pt-3 text-xs text-muted">Généré par {analysis.model}. Repère indicatif, non médical.</p>
              <button
                type="button"
                onClick={runAnalyze}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-ink disabled:opacity-50"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                Régénérer
              </button>
              {error && <p style={{ color: 'var(--color-severe)' }}>{error}</p>}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted">
                Lancez une synthèse IA de la période pour un bilan rédigé : verdict global, déclencheurs
                récurrents et pistes d'amélioration.
              </p>
              <button
                type="button"
                onClick={runAnalyze}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
              >
                {loading ? <AiBusy active /> : <Sparkles size={16} />}
                {loading ? 'Analyse…' : 'Générer le rapport IA'}
              </button>
              {error && <p style={{ color: 'var(--color-severe)' }}>{error}</p>}
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}

function TrendRow({ trend }: { trend: PeriodTrend }) {
  const color = trend.direction === 'flat' ? 'var(--color-absent)' : trend.good ? 'var(--color-leger)' : 'var(--color-severe)';
  const Icon = trend.direction === 'up' ? ArrowUpRight : trend.direction === 'down' ? ArrowDownRight : ArrowRight;
  return (
    <li className="flex items-center gap-2">
      <Icon size={16} style={{ color }} />
      <span className="text-ink">{trend.metric}</span>
      <span className="text-muted">— {trend.detail}</span>
    </li>
  );
}

function Block({ icon, title, children }: { icon: React.ReactNode; title: string; children: string[] }) {
  return (
    <div>
      <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        {icon} {title}
      </h4>
      <ul className="space-y-1">
        {children.map((t, i) => (
          <li key={i} className="flex items-start gap-2 text-ink">
            <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-muted)]" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

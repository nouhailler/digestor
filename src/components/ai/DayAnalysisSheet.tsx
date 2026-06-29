import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Download,
  Lightbulb,
  Loader2,
  RefreshCw,
  Settings2,
  Share2,
  Sparkles,
} from 'lucide-react';
import type { DayAnalysis, DayEntry, DayImprovement } from '../../types';
import { Sheet } from '../Sheet';
import { AiBusy } from './AiBusy';
import { VERDICT_COLOR, VERDICT_LABEL } from '../../lib/ai/insightFormat';
import { dayLongLabel } from '../../lib/dates';
import { dayHasContent } from '../../lib/aggregates';
import { buildProfileContext, hasHealthInfo } from '../../lib/profile';
import { useAiConfig } from '../../hooks/useAiConfig';
import { useProfile } from '../../hooks/useProfile';
import { useDayAnalysis } from '../../hooks/useDayAnalysis';
import { useFoodInsightMap } from '../../hooks/useFoodInsightMap';
import { downloadDayAnalysis, shareDayAnalysis } from '../../lib/dayAnalysisExport';

interface DayAnalysisSheetProps {
  open: boolean;
  day: DayEntry | null;
  onClose: () => void;
  onOpenAiSettings: () => void;
}

/** Analyse IA d'une journée complète (depuis le Journal). */
export function DayAnalysisSheet({ open, day, onClose, onOpenAiSettings }: DayAnalysisSheetProps) {
  const { config, ready } = useAiConfig();
  const { profile } = useProfile();
  const { analysis, loading, error, analyze } = useDayAnalysis(day?.date ?? '');
  const insights = useFoodInsightMap();

  const runAnalyze = () => day && config && analyze(day, config, buildProfileContext(profile), insights);
  const empty = !day || !dayHasContent(day);

  return (
    <Sheet open={open} title={day ? `Analyse — ${dayLongLabel(day.date)}` : 'Analyse'} onClose={onClose}>
      {!ready ? (
        <NotConfigured onOpenAiSettings={onOpenAiSettings} />
      ) : empty ? (
        <p className="text-sm text-muted">
          Renseignez d'abord des repas ou des symptômes pour cette journée, puis lancez l'analyse.
        </p>
      ) : analysis ? (
        <div className="space-y-4 text-sm">
          <span
            className="inline-block rounded-full border px-3 py-1 text-xs"
            style={{
              color: VERDICT_COLOR[analysis.verdict],
              borderColor: VERDICT_COLOR[analysis.verdict],
              backgroundColor: `color-mix(in srgb, ${VERDICT_COLOR[analysis.verdict]} 12%, transparent)`,
            }}
          >
            Journée : {VERDICT_LABEL[analysis.verdict]}
          </span>

          {analysis.summary && <p className="leading-relaxed text-ink">{analysis.summary}</p>}

          {analysis.likelyTriggers.length > 0 && (
            <Block icon={<AlertTriangle size={15} style={{ color: 'var(--color-severe)' }} />} title="Déclencheurs probables">
              {analysis.likelyTriggers}
            </Block>
          )}
          {analysis.improvements.length > 0 && (
            <ImprovementsBlock improvements={analysis.improvements} />
          )}

          {hasHealthInfo(profile) && (
            <p className="text-xs text-muted">Analyse personnalisée selon votre profil santé.</p>
          )}
          <p className="border-t border-border/60 pt-3 text-xs text-muted">
            Généré par {analysis.model}. Repère indicatif, non médical.
          </p>

          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
            <button
              type="button"
              onClick={runAnalyze}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-ink disabled:opacity-50"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              Réanalyser
            </button>
            <ExportButtons analysis={analysis} />
          </div>
          {error && <p style={{ color: 'var(--color-severe)' }}>{error}</p>}
        </div>
      ) : (
        <div className="space-y-4 text-sm">
          <p className="text-muted">
            Lancez une analyse IA de cette journée pour repérer les déclencheurs probables et des pistes
            d'amélioration.
          </p>
          <button
            type="button"
            onClick={runAnalyze}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
          >
            {loading ? <AiBusy active /> : <Sparkles size={16} />}
            {loading ? 'Analyse…' : "Analyser ma journée"}
          </button>
          {error && <p style={{ color: 'var(--color-severe)' }}>{error}</p>}
        </div>
      )}
    </Sheet>
  );
}

/** Récupérer l'analyse : partage natif (repli presse-papiers) + téléchargement texte. */
function ExportButtons({ analysis }: { analysis: DayAnalysis }) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    try {
      const result = await shareDayAnalysis(analysis);
      if (result === 'copied') {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* partage/copie indisponible : on ne bloque pas */
    }
  };

  const btn =
    'inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-ink';

  return (
    <>
      <button type="button" onClick={onShare} className={btn}>
        {copied ? (
          <Check size={15} style={{ color: 'var(--color-leger)' }} />
        ) : (
          <Share2 size={15} />
        )}
        {copied ? 'Copié' : 'Partager'}
      </button>
      <button type="button" onClick={() => downloadDayAnalysis(analysis)} className={btn}>
        <Download size={15} /> Télécharger
      </button>
    </>
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

/** Tolère l'ancien format en cache (chaîne) en plus de `{ action, why }`. */
function normalizeImprovement(imp: DayImprovement | string): DayImprovement {
  return typeof imp === 'string' ? { action: imp, why: '' } : imp;
}

/** Pistes d'amélioration : chaque recommandation est suivie de sa justification. */
function ImprovementsBlock({ improvements }: { improvements: (DayImprovement | string)[] }) {
  return (
    <div>
      <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
        <Lightbulb size={15} style={{ color: 'var(--color-modere)' }} /> Pistes d'amélioration
      </h4>
      <ul className="space-y-2.5">
        {improvements.map((imp, i) => {
          const { action, why } = normalizeImprovement(imp);
          return (
            <li key={i} className="flex items-start gap-2 text-ink">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-modere)]" />
              <div>
                <p>{action}</p>
                {why && <p className="mt-0.5 text-xs leading-relaxed text-muted">Pourquoi : {why}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NotConfigured({ onOpenAiSettings }: { onOpenAiSettings: () => void }) {
  return (
    <div className="space-y-4 text-sm">
      <p className="text-muted">
        Pour analyser votre journée, configurez une clé OpenRouter et choisissez un modèle gratuit.
      </p>
      <button
        type="button"
        onClick={onOpenAiSettings}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-ink"
      >
        <Settings2 size={16} /> Ouvrir les paramètres IA
      </button>
    </div>
  );
}

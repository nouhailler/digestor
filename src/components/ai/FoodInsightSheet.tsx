import { Loader2, RefreshCw, Settings2, Sparkles, UserCheck } from 'lucide-react';
import { Sheet } from '../Sheet';
import { AiBusy } from './AiBusy';
import { FoodInsightCard } from './FoodInsightCard';
import { useAiConfig } from '../../hooks/useAiConfig';
import { useFoodInsight } from '../../hooks/useFoodInsight';
import { useProfile } from '../../hooks/useProfile';
import { buildProfileContext, hasHealthInfo } from '../../lib/profile';

interface FoodInsightSheetProps {
  open: boolean;
  name: string;
  onClose: () => void;
  onOpenAiSettings: () => void;
  /** Contexte produit (ingrédients/marque) injecté à l'analyse — ex. produit scanné. */
  details?: string;
}

/** Sheet d'analyse d'un aliment (depuis une chip du journal ou l'écran Aliments). */
export function FoodInsightSheet({ open, name, onClose, onOpenAiSettings, details }: FoodInsightSheetProps) {
  const { config, ready } = useAiConfig();
  const { profile } = useProfile();
  const { insight, loading, error, analyze } = useFoodInsight(name);

  const profileAware = hasHealthInfo(profile);
  const runAnalyze = () => config && analyze(config, buildProfileContext(profile), details);

  return (
    <Sheet open={open} title={name || 'Aliment'} onClose={onClose}>
      {insight ? (
        // Une fiche en cache (analyse IA OU import) est toujours consultable,
        // même sans clé configurée.
        <div className="space-y-4">
          <FoodInsightCard insight={insight} />
          {profileAware && <ProfileAwareNote />}
          {ready ? (
            <button
              type="button"
              onClick={runAnalyze}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-ink disabled:opacity-50"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              Réanalyser
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAiSettings}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-ink"
            >
              <Settings2 size={15} /> Configurer l'IA pour réanalyser
            </button>
          )}
          {error && <p className="text-sm" style={{ color: 'var(--color-severe)' }}>{error}</p>}
        </div>
      ) : !ready ? (
        <div className="space-y-4 text-sm">
          <p className="text-muted">
            Pas d'analyse en cache pour « {name} ». Pour l'analyser (FODMAP, SIBO, candidose),
            configurez une clé OpenRouter et un modèle gratuit — ou importez une fiche depuis Claude Web.
          </p>
          <button
            type="button"
            onClick={onOpenAiSettings}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-ink"
          >
            <Settings2 size={16} /> Ouvrir les paramètres IA
          </button>
        </div>
      ) : (
        <div className="space-y-4 text-sm">
          <p className="text-muted">
            Pas encore d'analyse pour « {name} ». Lancez une analyse IA pour obtenir son profil
            FODMAP et son adéquation SIBO / candidose.
          </p>
          {profileAware && <ProfileAwareNote />}
          <button
            type="button"
            onClick={runAnalyze}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
          >
            {loading ? <AiBusy active /> : <Sparkles size={16} />}
            {loading ? 'Analyse…' : "Analyser avec l'IA"}
          </button>
          {error && <p style={{ color: 'var(--color-severe)' }}>{error}</p>}
        </div>
      )}
    </Sheet>
  );
}

function ProfileAwareNote() {
  return (
    <p className="inline-flex items-center gap-1.5 text-xs text-muted">
      <UserCheck size={13} style={{ color: 'var(--color-leger)' }} />
      Analyse personnalisée selon votre profil santé.
    </p>
  );
}

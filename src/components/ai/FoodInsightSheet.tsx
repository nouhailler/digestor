import { useState } from 'react';
import { Check, ImageDown, Loader2, RefreshCw, Settings2, Share2, Sparkles, Star, UserCheck } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Sheet } from '../Sheet';
import { AiBusy } from './AiBusy';
import { FoodInsightCard } from './FoodInsightCard';
import { useAiConfig } from '../../hooks/useAiConfig';
import { useFoodInsight } from '../../hooks/useFoodInsight';
import { useProfile } from '../../hooks/useProfile';
import { addFavorite, db, removeFavorite } from '../../lib/db';
import { normalize } from '../../lib/foodClassifier';
import { dateLabel } from '../../lib/dates';
import { buildProfileContext, hasHealthInfo } from '../../lib/profile';
import { shareFoodInsight } from '../../lib/foodInsightExport';
import { shareFoodInsightImage } from '../../lib/foodInsightImage';
import type { FoodInsight } from '../../types';

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
      <FavoriteToggle name={name} />
      {insight ? (
        // Une fiche en cache (analyse IA OU import) est toujours consultable,
        // même sans clé configurée.
        <div className="space-y-4">
          <FoodInsightCard insight={insight} />
          {profileAware && <ProfileAwareNote />}
          <div className="flex flex-wrap items-center gap-2">
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
            <ShareInsightButton insight={insight} />
            <ShareImageButton insight={insight} />
          </div>
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

/** Étoile favori + date de scan (la « fiche » de l'aliment). */
function FavoriteToggle({ name }: { name: string }) {
  const key = normalize(name);
  const favorite = useLiveQuery(() => (key ? db.favorites.get(key) : undefined), [key]);
  const isFav = !!favorite;
  if (!name) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => (isFav ? removeFavorite(key) : addFavorite(name))}
        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
        style={{
          borderColor: isFav ? 'var(--color-modere)' : 'var(--color-border)',
          color: isFav ? 'var(--color-modere)' : 'var(--color-muted)',
        }}
      >
        <Star size={13} fill={isFav ? 'currentColor' : 'none'} />
        {isFav ? 'Favori' : 'Ajouter aux favoris'}
      </button>
      {favorite?.scannedAt && (
        <span className="text-xs text-muted">Scanné le {dateLabel(favorite.scannedAt)}</span>
      )}
    </div>
  );
}

/**
 * Partage la fiche (feuille native de l'OS sur mobile, sinon copie dans le
 * presse-papiers) pour l'envoyer à un proche : « cet aliment m'est favorable… ».
 */
function ShareInsightButton({ insight }: { insight: FoodInsight }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const result = await shareFoodInsight(insight);
    if (result === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }
  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-ink"
    >
      {copied ? <Check size={15} style={{ color: 'var(--color-leger)' }} /> : <Share2 size={15} />}
      {copied ? 'Texte copié' : 'Partager le texte'}
    </button>
  );
}

/**
 * Partage la fiche en IMAGE (carte PNG) : feuille native de l'OS sur mobile,
 * sinon téléchargement du PNG (avec retour « Image téléchargée »).
 */
function ShareImageButton({ insight }: { insight: FoodInsight }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function share() {
    setBusy(true);
    try {
      const result = await shareFoodInsightImage(insight);
      if (result === 'downloaded') {
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      type="button"
      onClick={share}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-ink disabled:opacity-50"
    >
      {busy ? (
        <Loader2 size={15} className="animate-spin" />
      ) : done ? (
        <Check size={15} style={{ color: 'var(--color-leger)' }} />
      ) : (
        <ImageDown size={15} />
      )}
      {done ? 'Image téléchargée' : "Partager l'image"}
    </button>
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

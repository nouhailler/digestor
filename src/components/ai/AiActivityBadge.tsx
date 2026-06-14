import { Check, Hourglass } from 'lucide-react';
import { useAiActivity, useSecondTick } from '../../hooks/useAiActivity';

/**
 * Indicateur global d'activité IA (en-tête) : sablier qui tourne + « IA » + secondes
 * tant qu'une analyse tourne (même en quittant l'écran), puis pastille verte « IA ✓ »
 * quelques secondes une fois terminé.
 */
export function AiActivityBadge() {
  const { count, startedAt, flashUntil } = useAiActivity();
  const active = count > 0;
  useSecondTick(active || Date.now() < flashUntil);

  if (active) {
    const seconds = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs"
        style={{ color: 'var(--color-modere)', borderColor: 'var(--color-modere)' }}
        title={`Analyse IA en cours${count > 1 ? ` (${count})` : ''} — continue même si vous changez d'écran.`}
        aria-live="polite"
      >
        <Hourglass size={13} className="animate-spin" />
        <span className="font-semibold">IA</span>
        {count > 1 && <span>×{count}</span>}
        <span className="tabular-nums">{seconds}s</span>
      </span>
    );
  }

  if (Date.now() < flashUntil) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs"
        style={{ color: 'var(--color-leger)', borderColor: 'var(--color-leger)' }}
        title="Analyse IA terminée."
      >
        <Check size={13} />
        <span className="font-semibold">IA</span>
      </span>
    );
  }

  return null;
}

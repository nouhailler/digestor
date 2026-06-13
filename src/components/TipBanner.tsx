import { useState } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { HELP } from '../lib/help';
import type { Tab } from './BottomNav';

/**
 * Bandeau de tip discret en haut d'un écran. Affiche un conseil de l'écran,
 * masquable, l'état étant mémorisé par écran (localStorage).
 */
export function TipBanner({ tab }: { tab: Tab }) {
  const storageKey = `digestor-tip-dismissed-${tab}`;
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(storageKey) === '1',
  );

  const tips = HELP[tab].tips;
  if (dismissed || tips.length === 0) return null;

  // Conseil du jour : tourne selon le jour de l'année pour varier.
  const tip = tips[Math.floor(Date.now() / 86_400_000) % tips.length];

  function dismiss() {
    localStorage.setItem(storageKey, '1');
    setDismissed(true);
  }

  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm">
      <Lightbulb size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--color-modere)' }} />
      <p className="flex-1 text-muted">
        <span className="text-ink">Astuce :</span> {tip}
      </p>
      <button type="button" onClick={dismiss} aria-label="Masquer l'astuce" className="shrink-0 text-muted hover:text-ink">
        <X size={15} />
      </button>
    </div>
  );
}

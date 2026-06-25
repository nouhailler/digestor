import { Lightbulb, PlayCircle } from 'lucide-react';
import { Sheet } from './Sheet';
import { HELP } from '../lib/help';
import type { Tab } from './BottomNav';

interface HelpSheetProps {
  open: boolean;
  tab: Tab;
  onClose: () => void;
  /** Relance la visite guidée (bulles ancrées) de l'écran courant. */
  onStartTour: () => void;
}

/** Aide contextuelle de l'écran courant. */
export function HelpSheet({ open, tab, onClose, onStartTour }: HelpSheetProps) {
  const help = HELP[tab];
  return (
    <Sheet open={open} title={`Aide — ${help.title}`} onClose={onClose}>
      <div className="space-y-4 text-sm">
        <p className="leading-relaxed text-ink">{help.intro}</p>

        <button
          type="button"
          onClick={onStartTour}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-ink hover:border-leger"
        >
          <PlayCircle size={16} style={{ color: 'var(--color-leger)' }} />
          Lancer la visite guidée de cet écran
        </button>

        <ul className="space-y-2.5">
          {help.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Lightbulb size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--color-modere)' }} />
              <span className="text-ink">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  );
}

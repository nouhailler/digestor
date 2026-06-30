import { useState } from 'react';
import { ChevronDown, HelpCircle, MoreHorizontal } from 'lucide-react';
import { Chip } from './Chip';
import { AiActivityBadge } from './ai/AiActivityBadge';
import {
  CATEGORY_COLOR,
  CATEGORY_HINT,
  CATEGORY_LABEL,
  INTENSITY_COLOR,
  INTENSITY_HINT,
  INTENSITY_LABEL,
} from '../lib/constants';
import type { Intensity } from '../types';

const INTENSITIES: Intensity[] = ['severe', 'modere', 'leger', 'absent'];

// Préférence d'affichage propre à l'appareil (comme le thème) : la légende du
// bandeau est repliée par défaut ; le choix est mémorisé en localStorage.
const LEGEND_KEY = 'digestor-legend-open';
function getStoredLegendOpen(): boolean {
  try {
    return localStorage.getItem(LEGEND_KEY) === '1';
  } catch {
    return false;
  }
}
function setStoredLegendOpen(open: boolean): void {
  try {
    localStorage.setItem(LEGEND_KEY, open ? '1' : '0');
  } catch {
    /* localStorage indisponible */
  }
}

interface LegendProps {
  title: string;
  onMenu: () => void;
  onHelp: () => void;
}

/** En-tête sticky : titre + légende aliments & intensités (repliable) + aide + menu ⋯. */
export function Legend({ title, onMenu, onHelp }: LegendProps) {
  const [legendOpen, setLegendOpen] = useState(getStoredLegendOpen);

  function toggleLegend() {
    const next = !legendOpen;
    setLegendOpen(next);
    setStoredLegendOpen(next);
  }

  return (
    <header className="safe-top sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-[15px] font-medium text-ink">{title}</h1>
          <div className="flex shrink-0 items-center gap-2">
            <AiActivityBadge />
            <button
              type="button"
              onClick={onHelp}
              aria-label="Aide"
              data-tour="header-help"
              className="rounded-full border border-border p-1.5 text-muted hover:text-ink"
            >
              <HelpCircle size={18} />
            </button>
            <button
              type="button"
              onClick={onMenu}
              aria-label="Menu"
              data-tour="header-menu"
              className="rounded-full border border-border p-1.5 text-muted hover:text-ink"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleLegend}
          aria-expanded={legendOpen}
          data-tour="header-legend"
          title="Légende des couleurs (aliments & intensités). Touchez pour afficher/réduire."
          className="mt-2 inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
        >
          Légende des couleurs
          <ChevronDown size={14} className={legendOpen ? 'rotate-180 transition' : 'transition'} />
        </button>

        {legendOpen && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="text-muted" title="Légende des couleurs d'aliments utilisées dans tout le journal.">
            Aliments :
          </span>
          <Chip color={CATEGORY_COLOR.pro} title={CATEGORY_HINT.pro}>
            {CATEGORY_LABEL.pro}
          </Chip>
          <Chip color={CATEGORY_COLOR.beneficial} title={CATEGORY_HINT.beneficial}>
            {CATEGORY_LABEL.beneficial}
          </Chip>
          <Chip color={CATEGORY_COLOR.neutral} title={CATEGORY_HINT.neutral}>
            {CATEGORY_LABEL.neutral}
          </Chip>

          <span className="ml-2 text-muted" title="Échelle d'intensité des symptômes.">
            Intensité :
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {INTENSITIES.map((i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 text-ink"
                title={INTENSITY_HINT[i]}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: INTENSITY_COLOR[i] }}
                />
                {INTENSITY_LABEL[i]}
              </span>
            ))}
          </div>
        </div>
        )}
      </div>
    </header>
  );
}

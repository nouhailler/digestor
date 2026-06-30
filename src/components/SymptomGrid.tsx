import { Info } from 'lucide-react';
import type { Intensity, SymptomKey } from '../types';
import {
  INTENSITY_COLOR,
  INTENSITY_CYCLE,
  INTENSITY_LABEL,
  SYMPTOM_HINTS,
  SYMPTOM_LABELS,
  SYMPTOM_ORDER,
} from '../lib/constants';

interface SymptomGridProps {
  symptoms: Record<SymptomKey, Intensity>;
  editing: boolean;
  onCycle: (key: SymptomKey) => void;
  /** En lecture : ouvre la fiche détaillée du symptôme (encyclopédie). */
  onInfo?: (key: SymptomKey) => void;
}

/**
 * Grille 4 colonnes (desktop) / 2 colonnes (mobile) dans l'ordre exact.
 * En édition, taper une pastille fait cycler l'intensité.
 */
export function SymptomGrid({ symptoms, editing, onCycle, onInfo }: SymptomGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
      {SYMPTOM_ORDER.map((key) => {
        // Défaut « absent » : un jour enregistré avant l'ajout d'un symptôme n'a pas la clé.
        const intensity = symptoms[key] ?? 'absent';
        const dot = (
          <span
            className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: INTENSITY_COLOR[intensity] }}
          />
        );
        const label = <span className="text-sm leading-tight text-ink">{SYMPTOM_LABELS[key]}</span>;
        const baseHint = `${SYMPTOM_LABELS[key]} — ${SYMPTOM_HINTS[key]}`;

        if (!editing) {
          if (onInfo) {
            return (
              <button
                key={key}
                type="button"
                onClick={() => onInfo(key)}
                title={`${baseHint}\nToucher pour la fiche détaillée.`}
                className="group flex items-start gap-2 text-left"
              >
                {dot}
                <span className="text-sm leading-tight text-ink underline decoration-dotted decoration-muted underline-offset-4">
                  {SYMPTOM_LABELS[key]}
                </span>
                <Info size={12} className="mt-1 shrink-0 text-muted opacity-0 group-hover:opacity-100" />
              </button>
            );
          }
          return (
            <div key={key} className="flex items-start gap-2" title={`${baseHint} (${INTENSITY_LABEL[intensity]})`}>
              {dot}
              {label}
            </div>
          );
        }
        return (
          <button
            key={key}
            type="button"
            onClick={() => onCycle(key)}
            title={`${baseHint}\nIntensité : ${INTENSITY_LABEL[intensity]} — touchez pour faire varier (absent → léger → modéré → sévère).`}
            className="flex items-start gap-2 text-left active:scale-[0.97] transition-transform"
          >
            {dot}
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function cycleIntensity(current: Intensity): Intensity {
  const i = INTENSITY_CYCLE.indexOf(current);
  return INTENSITY_CYCLE[(i + 1) % INTENSITY_CYCLE.length];
}

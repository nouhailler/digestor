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
}

/**
 * Grille 4 colonnes (desktop) / 2 colonnes (mobile) dans l'ordre exact.
 * En édition, taper une pastille fait cycler l'intensité.
 */
export function SymptomGrid({ symptoms, editing, onCycle }: SymptomGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
      {SYMPTOM_ORDER.map((key) => {
        const intensity = symptoms[key];
        const dot = (
          <span
            className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: INTENSITY_COLOR[intensity] }}
          />
        );
        const label = <span className="text-sm leading-tight text-ink">{SYMPTOM_LABELS[key]}</span>;
        const baseHint = `${SYMPTOM_LABELS[key]} — ${SYMPTOM_HINTS[key]}`;

        if (!editing) {
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

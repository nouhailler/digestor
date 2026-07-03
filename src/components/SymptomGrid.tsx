import { AlertTriangle, Info } from 'lucide-react';
import type { Intensity, SymptomKey } from '../types';
import {
  INTENSITY_COLOR,
  INTENSITY_CYCLE,
  INTENSITY_LABEL,
  SYMPTOM_CATEGORY_COLOR,
  SYMPTOM_HINTS,
  SYMPTOM_LABELS,
} from '../lib/constants';
import { isUrgentSymptom, symptomMetaHint, symptomsByCategory } from '../lib/symptomCatalog';

interface SymptomGridProps {
  symptoms: Record<SymptomKey, Intensity>;
  editing: boolean;
  onCycle: (key: SymptomKey) => void;
  /** En lecture : ouvre la fiche détaillée du symptôme (encyclopédie). */
  onInfo?: (key: SymptomKey) => void;
}

const GROUPS = symptomsByCategory();

/**
 * Symptômes regroupés par système (digestif → général), avec une section
 * « Signes d'alerte » à part (bordure rouge + bandeau d'avertissement).
 * En édition, taper une pastille fait cycler l'intensité. Un bouton par
 * symptôme en édition ; en lecture, bouton « info » si `onInfo`, sinon texte.
 */
export function SymptomGrid({ symptoms, editing, onCycle, onInfo }: SymptomGridProps) {
  return (
    <div className="space-y-4">
      {GROUPS.map((group) => {
        const isAlert = group.category === 'alerte';
        return (
          <section
            key={group.category}
            className={isAlert ? 'rounded-xl border p-3' : ''}
            style={isAlert ? { borderColor: 'var(--color-severe)' } : undefined}
          >
            <div className="mb-2 flex items-center gap-2">
              {isAlert ? (
                <AlertTriangle size={13} className="shrink-0" style={{ color: 'var(--color-severe)' }} />
              ) : (
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: SYMPTOM_CATEGORY_COLOR[group.category] }}
                />
              )}
              <h4
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: isAlert ? 'var(--color-severe)' : undefined }}
              >
                {group.label}
              </h4>
            </div>
            {isAlert && (
              <p className="mb-3 text-xs leading-snug text-muted">
                Ces signes nécessitent une prise en charge médicale immédiate, pas seulement du suivi.
              </p>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              {group.keys.map((key) => (
                <SymptomCell
                  key={key}
                  symptomKey={key}
                  intensity={symptoms[key] ?? 'absent'}
                  editing={editing}
                  onCycle={onCycle}
                  onInfo={onInfo}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

interface SymptomCellProps {
  symptomKey: SymptomKey;
  intensity: Intensity;
  editing: boolean;
  onCycle: (key: SymptomKey) => void;
  onInfo?: (key: SymptomKey) => void;
}

function SymptomCell({ symptomKey: key, intensity, editing, onCycle, onInfo }: SymptomCellProps) {
  const urgent = isUrgentSymptom(key);
  const metaHint = symptomMetaHint(key);
  // Défaut « absent » : un jour enregistré avant l'ajout d'un symptôme n'a pas la clé.
  const dot = (
    <span
      className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: INTENSITY_COLOR[intensity] }}
    />
  );
  const label = (
    <span className="inline-flex items-start gap-1 text-sm leading-tight text-ink">
      {SYMPTOM_LABELS[key]}
      {urgent && <AlertTriangle size={11} className="mt-0.5 shrink-0" style={{ color: 'var(--color-severe)' }} />}
    </span>
  );
  const baseHint = `${SYMPTOM_LABELS[key]} — ${SYMPTOM_HINTS[key]}${metaHint ? `\n(${metaHint})` : ''}`;

  if (!editing) {
    if (onInfo) {
      return (
        <button
          type="button"
          onClick={() => onInfo(key)}
          title={`${baseHint}\nToucher pour la fiche détaillée.`}
          className="group flex items-start gap-2 text-left"
        >
          {dot}
          <span className="inline-flex items-start gap-1 text-sm leading-tight text-ink underline decoration-dotted decoration-muted underline-offset-4">
            {SYMPTOM_LABELS[key]}
            {urgent && <AlertTriangle size={11} className="mt-0.5 shrink-0" style={{ color: 'var(--color-severe)' }} />}
          </span>
          <Info size={12} className="mt-1 shrink-0 text-muted opacity-0 group-hover:opacity-100" />
        </button>
      );
    }
    return (
      <div className="flex items-start gap-2" title={`${baseHint} (${INTENSITY_LABEL[intensity]})`}>
        {dot}
        {label}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onCycle(key)}
      title={`${baseHint}\nIntensité : ${INTENSITY_LABEL[intensity]} — touchez pour faire varier (absent → léger → modéré → sévère).`}
      className="flex items-start gap-2 text-left active:scale-[0.97] transition-transform"
    >
      {dot}
      {label}
    </button>
  );
}

export function cycleIntensity(current: Intensity): Intensity {
  const i = INTENSITY_CYCLE.indexOf(current);
  return INTENSITY_CYCLE[(i + 1) % INTENSITY_CYCLE.length];
}

import { useState } from 'react';
import { Anchor, ChevronDown, Feather, Gauge, HelpCircle, Plus, Timer, Trash2, Wind } from 'lucide-react';
import type { FoodInsight, Meal, SatietyCheck, SatietyCheckpoint, SatietyType } from '../types';
import { VasSlider } from './VasSlider';
import { SatietyHelpSheet } from './SatietyHelp';
import { satietyDurationCore } from '../lib/satietyDuration';
import {
  CHECKPOINT_LABEL,
  SATIETY_CHECKPOINTS,
  SATIETY_TYPES,
  SATIETY_TYPE_COLOR,
  SATIETY_TYPE_LABEL,
  VAS_METRICS,
  emptySatietyCheck,
  removeCheck,
  sortChecks,
  typeApplies,
  upsertCheck,
} from '../lib/satiety';

const TYPE_ICON: Record<SatietyType, typeof Feather> = {
  legere: Feather,
  lourde: Anchor,
  ballonnement: Wind,
};

interface MealSatietyProps {
  meal: Meal;
  editing: boolean;
  onChange: (meal: Meal) => void;
  /** Analyses IA des aliments (par nom normalisé) : affinent la durée attendue (FODMAP). */
  insights?: Map<string, FoodInsight>;
}

/** Ligne « durée de satiété » (mesurée + attendue), calculée en direct. */
function DurationLine({ meal, insights }: { meal: Meal; insights?: Map<string, FoodInsight> }) {
  const core = satietyDurationCore(meal, insights);
  if (!core) return null;
  return (
    <p className="inline-flex items-center gap-1.5 text-xs text-muted">
      <Timer size={13} /> Satiété {core}
    </p>
  );
}

/**
 * Suivi de satiété d'un repas (faim / énergie / envie de sucre en VAS 0-100 à
 * plusieurs checkpoints + type de satiété). Vide par défaut : n'affiche rien en
 * lecture tant qu'aucun relevé n'a été saisi.
 */
export function MealSatiety({ meal, editing, onChange, insights }: MealSatietyProps) {
  const [open, setOpen] = useState(false);
  const [readOpen, setReadOpen] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const checks = sortChecks(meal.satiety ?? []);
  const missing = SATIETY_CHECKPOINTS.filter((cp) => !checks.some((c) => c.checkpoint === cp));

  function setCheck(check: SatietyCheck) {
    onChange({ ...meal, satiety: upsertCheck(checks, check) });
  }
  function delCheck(cp: SatietyCheckpoint) {
    onChange({ ...meal, satiety: removeCheck(checks, cp) });
  }

  // --- Lecture seule : rien si vide, sinon zone repliable ---
  if (!editing) {
    if (checks.length === 0) return null;
    return (
      <div className="rounded-lg border border-border/70 bg-surface-2/40">
        <button
          type="button"
          onClick={() => setReadOpen((o) => !o)}
          aria-expanded={readOpen}
          title={readOpen ? 'Réduire la satiété' : 'Afficher la satiété'}
          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
        >
          <span className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
              <Gauge size={13} /> Satiété
            </span>
            {/* Replié : rappel des checkpoints saisis. */}
            {!readOpen &&
              checks.map((c) => (
                <span key={c.checkpoint} className="text-xs text-ink">
                  {CHECKPOINT_LABEL[c.checkpoint]}
                </span>
              ))}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-muted transition-transform ${readOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {readOpen && (
          <div className="space-y-3 px-3 pb-3">
            {checks.map((c) => (
              <CheckReadRow key={c.checkpoint} check={c} />
            ))}
            <DurationLine meal={meal} insights={insights} />
          </div>
        )}
      </div>
    );
  }

  // --- Édition : zone repliable ---
  return (
    <>
    <div className="rounded-lg border border-border/70 bg-surface-2/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title="Faim, énergie et envie de sucre ressenties après ce repas, à différents moments. Touchez pour déplier."
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            <Gauge size={13} /> Satiété après ce repas
          </span>
          {!open &&
            checks.map((c) => (
              <span key={c.checkpoint} className="text-xs text-ink">
                {CHECKPOINT_LABEL[c.checkpoint]}
              </span>
            ))}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="space-y-4 px-3 pb-3">
          {checks.length > 0 && <DurationLine meal={meal} insights={insights} />}
          {checks.map((c) => (
            <CheckEditRow
              key={c.checkpoint}
              check={c}
              onChange={setCheck}
              onRemove={() => delCheck(c.checkpoint)}
              onHelp={() => setHelpOpen(true)}
            />
          ))}

          {missing.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {missing.map((cp) => (
                <button
                  key={cp}
                  type="button"
                  onClick={() => setCheck(emptySatietyCheck(cp))}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted hover:text-ink"
                >
                  <Plus size={13} /> {CHECKPOINT_LABEL[cp]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    <SatietyHelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

function CheckEditRow({
  check,
  onChange,
  onRemove,
  onHelp,
}: {
  check: SatietyCheck;
  onChange: (c: SatietyCheck) => void;
  onRemove: () => void;
  onHelp?: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-ink">{CHECKPOINT_LABEL[check.checkpoint]}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Retirer le relevé ${CHECKPOINT_LABEL[check.checkpoint]}`}
          className="text-muted hover:text-severe"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {VAS_METRICS.map((metric) => (
          <VasSlider
            key={metric.key}
            label={metric.label}
            leftLabel={metric.leftLabel}
            rightLabel={metric.rightLabel}
            color={metric.color}
            value={check[metric.key]}
            onChange={(v) => onChange({ ...check, [metric.key]: v })}
          />
        ))}
      </div>

      {typeApplies(check.checkpoint) && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted">Type de satiété</p>
            {onHelp && (
              <button
                type="button"
                onClick={onHelp}
                aria-label="Comprendre la satiété et sa durée"
                title="Comment Digestor évalue la satiété (faim, énergie) et sa durée tenue / attendue"
                className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
              >
                <HelpCircle size={14} /> Aide
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {SATIETY_TYPES.map((t) => {
              const Icon = TYPE_ICON[t];
              const active = check.satietyType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange({ ...check, satietyType: active ? null : t })}
                  aria-pressed={active}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
                  style={{
                    color: active ? '#0e0e0f' : 'var(--color-muted)',
                    borderColor: active ? SATIETY_TYPE_COLOR[t] : 'var(--color-border)',
                    backgroundColor: active ? SATIETY_TYPE_COLOR[t] : 'transparent',
                  }}
                >
                  <Icon size={13} /> {SATIETY_TYPE_LABEL[t]}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckReadRow({ check }: { check: SatietyCheck }) {
  const Icon = check.satietyType ? TYPE_ICON[check.satietyType] : null;
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-semibold text-ink">{CHECKPOINT_LABEL[check.checkpoint]}</span>
        {check.satietyType && Icon && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
            style={{ color: '#0e0e0f', backgroundColor: SATIETY_TYPE_COLOR[check.satietyType] }}
          >
            <Icon size={11} /> {SATIETY_TYPE_LABEL[check.satietyType]}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {VAS_METRICS.map((metric) => (
          <VasSlider
            key={metric.key}
            readOnly
            label={metric.label}
            leftLabel={metric.leftLabel}
            rightLabel={metric.rightLabel}
            color={metric.color}
            value={check[metric.key]}
          />
        ))}
      </div>
    </div>
  );
}

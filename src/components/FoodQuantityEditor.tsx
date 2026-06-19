import { Minus, Plus } from 'lucide-react';
import type { FoodQuantity, QuantityUnit } from '../types';
import {
  QUANTITY_UNITS,
  clampAmount,
  defaultQuantity,
  formatAmount,
  formatQuantity,
  unitDef,
} from '../lib/quantity';

interface FoodQuantityEditorProps {
  /** Quantité courante (ou indéfinie si non précisée). */
  value?: FoodQuantity;
  /** Applique une nouvelle quantité, ou la retire (`undefined`). */
  onChange: (q: FoodQuantity | undefined) => void;
  onClose: () => void;
}

/**
 * Petit popover de réglage de la quantité d'un aliment (cuillères, portions, poids…).
 * Ancré sous la chip d'aliment. Tant que l'utilisateur n'interagit pas, rien n'est
 * écrit (ouvrir le popover n'ajoute pas de quantité) ; « Effacer » la retire.
 */
export function FoodQuantityEditor({ value, onChange, onClose }: FoodQuantityEditorProps) {
  // Valeurs affichées : la quantité existante, ou un défaut « 1 càc » non encore validé.
  const current = value ?? defaultQuantity('cac');

  function setUnit(unit: QuantityUnit) {
    const def = unitDef(unit);
    // En changeant d'unité, on garde la valeur si elle a du sens, sinon le défaut
    // de la nouvelle unité (ex. passage en « g » → 50 g plutôt que 1 g).
    const amount = current.amount < def.step ? def.default : clampAmount(current.amount, unit);
    onChange({ amount, unit });
  }

  function step(direction: 1 | -1) {
    const def = unitDef(current.unit);
    onChange({ amount: clampAmount(current.amount + direction * def.step, current.unit), unit: current.unit });
  }

  return (
    <>
      {/* Capture des clics extérieurs pour fermer. */}
      <div className="fixed inset-0 z-10" onClick={onClose} aria-hidden />
      <div
        className="absolute left-0 top-full z-20 mt-1 w-60 rounded-xl border border-border bg-surface-2 p-3 text-ink shadow-lg"
        role="dialog"
        aria-label="Quantité de l'aliment"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">Quantité</span>
          <span className="text-sm font-medium text-ink">{formatQuantity(current)}</span>
        </div>

        <div className="mb-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Diminuer"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-ink hover:border-leger"
          >
            <Minus size={15} />
          </button>
          <span className="min-w-12 text-center text-base font-semibold text-ink">
            {formatAmount(current.amount)}
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Augmenter"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-ink hover:border-leger"
          >
            <Plus size={15} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {QUANTITY_UNITS.map((u) => {
            const active = value && current.unit === u.key;
            return (
              <button
                key={u.key}
                type="button"
                onClick={() => setUnit(u.key)}
                title={u.long}
                className="rounded-full border px-2.5 py-1 text-xs"
                style={{
                  borderColor: active ? 'var(--color-leger)' : 'var(--color-border)',
                  color: active ? 'var(--color-leger)' : 'var(--color-muted)',
                  backgroundColor: active ? 'rgba(95,191,111,0.10)' : 'transparent',
                }}
              >
                {u.short}
              </button>
            );
          })}
        </div>

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              onClose();
            }}
            className="mt-3 w-full rounded-lg border border-border py-1.5 text-xs text-muted hover:text-severe"
          >
            Effacer la quantité
          </button>
        )}
      </div>
    </>
  );
}

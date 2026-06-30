import { useId } from 'react';

interface VasSliderProps {
  /** Valeur courante (0-100). */
  value: number;
  /** Appelé pendant le drag avec la nouvelle valeur (ignoré en lecture seule). */
  onChange?: (value: number) => void;
  /** Intitulé de la mesure (associé à l'input pour l'accessibilité). */
  label: string;
  /** Ancre textuelle à gauche (valeur 0). */
  leftLabel: string;
  /** Ancre textuelle à droite (valeur 100). */
  rightLabel: string;
  /** Couleur d'accent (variable CSS de @theme). */
  color?: string;
  /** Affichage non interactif (barre de lecture). */
  readOnly?: boolean;
}

/**
 * Échelle visuelle analogique (VAS) 0-100 réutilisable. En édition : un
 * `<input type="range">` natif coloré via `accent-color` (zone tactile large,
 * pas de lib externe). En lecture seule : une barre remplie proportionnelle.
 */
export function VasSlider({
  value,
  onChange,
  label,
  leftLabel,
  rightLabel,
  color = 'var(--color-leger)',
  readOnly = false,
}: VasSliderProps) {
  const id = useId();

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-medium text-ink">
          {label}
        </label>
        <span className="text-xs tabular-nums text-muted">{value}</span>
      </div>

      {readOnly ? (
        <div
          className="relative h-2 w-full overflow-hidden rounded-full bg-surface-2"
          role="img"
          aria-label={`${label} : ${value} sur 100`}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${value}%`, backgroundColor: color }}
          />
        </div>
      ) : (
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={value}
          aria-label={label}
          aria-valuetext={`${value} sur 100`}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="h-6 w-full cursor-pointer bg-transparent"
          style={{ accentColor: color, touchAction: 'pan-y' }}
        />
      )}

      <div className="flex justify-between text-[11px] text-muted">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

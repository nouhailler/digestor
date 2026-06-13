import type { DayQuality } from '../types';
import { QUALITY_HINT } from '../lib/constants';

const STYLE: Record<Exclude<DayQuality, null>, { label: string; color: string }> = {
  difficile: { label: 'Journée difficile', color: 'var(--color-severe)' },
  correcte: { label: 'Journée correcte', color: 'var(--color-modere)' },
  bonne: { label: 'Bonne journée', color: 'var(--color-leger)' },
};

interface QualityBadgeProps {
  quality: DayQuality;
  onClick?: () => void;
  suggested?: boolean;
}

/** Badge de qualité translucide coloré (cf. maquettes). */
export function QualityBadge({ quality, onClick, suggested }: QualityBadgeProps) {
  if (!quality) {
    if (!onClick) return null;
    return (
      <button
        type="button"
        onClick={onClick}
        title={QUALITY_HINT}
        className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted"
      >
        + qualité
      </button>
    );
  }
  const { label, color } = STYLE[quality];
  const Tag = onClick ? 'button' : 'span';
  const title = suggested
    ? `${QUALITY_HINT}\n(Ici proposé automatiquement.)`
    : QUALITY_HINT;
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      title={title}
      style={{ color, borderColor: color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}
      className="rounded-full border px-3 py-1 text-xs whitespace-nowrap"
    >
      {label}
      {suggested ? ' ·' : ''}
    </Tag>
  );
}

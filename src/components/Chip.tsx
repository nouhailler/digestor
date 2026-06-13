import type { ReactNode } from 'react';

interface ChipProps {
  /** Couleur (variable CSS) du texte + bordure. */
  color: string;
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  className?: string;
}

/**
 * Pastille « pill » : rounded-full, fond translucide foncé,
 * bordure 1px colorée + texte coloré. Base des chips aliments & légende.
 */
export function Chip({ color, children, onClick, title, className = '' }: ChipProps) {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      title={title}
      style={{ color, borderColor: color, backgroundColor: 'rgba(255,255,255,0.03)' }}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm leading-none whitespace-nowrap ${
        onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

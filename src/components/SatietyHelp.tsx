import { Sheet } from './Sheet';
import { SATIETY_HELP } from '../lib/help';

/** Corps de l'explication du suivi de satiété (réutilisé dans plusieurs contextes). */
export function SatietyHelpContent() {
  return (
    <div className="space-y-3 text-sm">
      <p className="leading-relaxed text-ink">{SATIETY_HELP.intro}</p>
      <ul className="space-y-2.5">
        {SATIETY_HELP.points.map((p) => (
          <li key={p.label} className="leading-relaxed">
            <strong className="text-ink">{p.label} : </strong>
            <span className="text-muted">{p.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Feuille d'explication ouverte depuis le bouton « Aide » de la zone Satiété. */
export function SatietyHelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} title={SATIETY_HELP.title} onClose={onClose}>
      <SatietyHelpContent />
    </Sheet>
  );
}

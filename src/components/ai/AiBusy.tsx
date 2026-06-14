import { Hourglass } from 'lucide-react';
import { useElapsedSeconds } from '../../hooks/useAiActivity';

/**
 * Petit indicateur « sablier + décompte en secondes » pour les boutons d'analyse,
 * pendant qu'une requête IA est en cours (sur l'écran courant).
 */
export function AiBusy({ active }: { active: boolean }) {
  const seconds = useElapsedSeconds(active);
  return (
    <span className="inline-flex items-center gap-1">
      <Hourglass size={15} className="animate-spin" />
      <span className="tabular-nums">{seconds}s</span>
    </span>
  );
}

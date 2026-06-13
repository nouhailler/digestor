import { ShieldAlert } from 'lucide-react';
import { Sheet } from './Sheet';

export function AboutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} title="À propos de Digestor" onClose={onClose}>
      <div className="space-y-4 text-sm leading-relaxed text-ink">
        <p className="text-muted">
          Digestor est un <strong className="text-ink">journal de suivi</strong> alimentaire et symptomatique
          destiné à repérer des tendances pour la candidose intestinale, le SIBO et le SII.
        </p>

        <div className="flex gap-3 rounded-xl border border-border bg-surface-2 p-4">
          <ShieldAlert size={20} className="mt-0.5 shrink-0" style={{ color: 'var(--color-modere)' }} />
          <div className="space-y-2">
            <p className="font-semibold" style={{ color: 'var(--color-modere)' }}>
              Avertissement médical
            </p>
            <p>
              Cet outil sert au <strong>suivi et au repérage de tendances</strong>. Ce n'est{' '}
              <strong>pas un dispositif de diagnostic</strong>.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>Le <strong className="text-ink">SIBO</strong> se confirme par un test respiratoire.</li>
              <li>Le <strong className="text-ink">SII</strong> repose sur des critères cliniques (Rome IV).</li>
              <li>
                L'hypothèse d'une <strong className="text-ink">candidose systémique</strong> chronique reste
                débattue en médecine ; la candidose intestinale localisée, elle, est reconnue.
              </li>
            </ul>
            <p>
              Consultez un <strong>médecin / gastro-entérologue</strong> pour toute interprétation.
            </p>
          </div>
        </div>

        <p className="text-muted">
          🔒 Vos données sont <strong className="text-ink">stockées uniquement sur cet appareil</strong>{' '}
          (IndexedDB). Le cœur de l'app fonctionne hors-ligne, sans serveur. Pensez à exporter régulièrement
          votre journal en JSON pour le sauvegarder.
        </p>

        <p className="text-muted">
          🤖 L'assistant IA est <strong className="text-ink">optionnel</strong>. Si vous l'activez, votre clé
          OpenRouter reste sur l'appareil et seuls le nom de l'aliment analysé et votre éventuel contexte de
          profil sont envoyés à OpenRouter pour produire l'analyse. Ces analyses restent des repères indicatifs,
          non médicaux.
        </p>
      </div>
    </Sheet>
  );
}

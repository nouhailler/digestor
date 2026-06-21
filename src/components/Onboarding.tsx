import { useState } from 'react';
import {
  Apple,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LineChart,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

interface Step {
  Icon: typeof BookOpen;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    Icon: Sparkles,
    title: 'Bienvenue dans Digestor',
    body: "Un journal alimentaire et un suivi des symptômes pour la candidose intestinale, le SIBO et le SII. Tout reste sur votre appareil, même hors-ligne.",
  },
  {
    Icon: BookOpen,
    title: 'Saisissez votre journée',
    body: "Dans le Journal : ajoutez vos repas (chips d'aliments colorées), faites varier l'intensité des symptômes d'un toucher, notez transit et hydratation. Le crayon bascule en mode édition ; la sauvegarde est automatique.",
  },
  {
    Icon: LineChart,
    title: 'Comprenez vos tendances',
    body: "L'onglet Semaine résume vos 7 derniers jours et repère des corrélations aliment → symptôme. L'onglet Évolution trace vos courbes dans le temps.",
  },
  {
    Icon: Apple,
    title: 'Analysez vos aliments (IA)',
    body: "Optionnel : avec une clé OpenRouter, l'onglet Aliments (ou un toucher sur une chip) analyse le profil FODMAP, SIBO et candidose d'un aliment. Renseignez votre profil santé pour des analyses personnalisées.",
  },
  {
    Icon: Stethoscope,
    title: 'Votre boîte à outils',
    body: "Depuis le menu (☰) : suivez vos traitements & compléments, menez vos tests de réintroduction FODMAP, réutilisez vos modèles de repas, générez un rapport de période et un dossier médical imprimable, et fouillez votre journal. Dans Aliments, « Trouver les doublons » fait le ménage et chaque aliment peut être supprimé définitivement.",
  },
  {
    Icon: ShieldCheck,
    title: 'Confidentialité & santé',
    body: "Vos données ne quittent pas l'appareil (pensez à les exporter pour les sauvegarder). Digestor est un outil de repérage de tendances, pas un dispositif de diagnostic : consultez un médecin pour toute interprétation.",
  },
];

export function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;
  const { Icon } = step;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 backdrop-blur-sm">
      <div className="safe-bottom mx-4 flex max-h-[90vh] w-full max-w-md flex-col rounded-2xl border border-border bg-surface p-6">
        <button
          type="button"
          onClick={onFinish}
          className="self-end text-sm text-muted hover:text-ink"
        >
          Passer
        </button>

        <div className="flex flex-1 flex-col items-center px-2 py-6 text-center">
          <div
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(95,191,111,0.12)', color: 'var(--color-leger)' }}
          >
            <Icon size={30} />
          </div>
          <h2 className="mb-3 text-xl font-semibold text-ink">{step.title}</h2>
          <p className="leading-relaxed text-muted">{step.body}</p>
        </div>

        {/* Indicateurs */}
        <div className="mb-5 flex justify-center gap-2">
          {STEPS.map((_, idx) => (
            <span
              key={idx}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: idx === i ? 20 : 7,
                backgroundColor: idx === i ? 'var(--color-leger)' : 'var(--color-border)',
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setI((v) => Math.max(0, v - 1))}
            disabled={i === 0}
            className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm text-muted disabled:opacity-0"
          >
            <ChevronLeft size={16} /> Précédent
          </button>
          <button
            type="button"
            onClick={() => (last ? onFinish() : setI((v) => v + 1))}
            className="inline-flex items-center gap-1 rounded-full px-5 py-2 text-sm font-medium"
            style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
          >
            {last ? 'Commencer' : 'Suivant'}
            {!last && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

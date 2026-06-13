import { Apple, BookOpen, CalendarDays, LineChart, Stethoscope } from 'lucide-react';

export type Tab = 'journal' | 'aliments' | 'semaine' | 'evolution' | 'reperes';

const TABS: { id: Tab; label: string; Icon: typeof BookOpen }[] = [
  { id: 'journal', label: 'Journal', Icon: BookOpen },
  { id: 'aliments', label: 'Aliments', Icon: Apple },
  { id: 'semaine', label: 'Semaine', Icon: CalendarDays },
  { id: 'evolution', label: 'Évolution', Icon: LineChart },
  { id: 'reperes', label: 'Repères', Icon: Stethoscope },
];

interface BottomNavProps {
  active: Tab;
  onChange: (t: Tab) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="no-print safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl">
        {TABS.map(({ id, label, Icon }) => {
          const on = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 py-2"
              style={{ color: on ? 'var(--color-leger)' : 'var(--color-muted)' }}
            >
              <Icon size={20} strokeWidth={on ? 2.4 : 1.8} />
              <span className="text-[11px]">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

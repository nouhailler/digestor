import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface MultiChipSelectProps {
  label: string;
  options: string[]; // suggestions
  selected: string[];
  onChange: (next: string[]) => void;
  color?: string; // couleur des chips sélectionnées
  placeholder?: string;
  allowCustom?: boolean;
}

/**
 * Sélection multiple par chips : suggestions cliquables + ajout libre.
 * Les valeurs personnalisées non présentes dans `options` apparaissent aussi.
 */
export function MultiChipSelect({
  label,
  options,
  selected,
  onChange,
  color = 'var(--color-leger)',
  placeholder = 'ajouter…',
  allowCustom = true,
}: MultiChipSelectProps) {
  const [draft, setDraft] = useState('');

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((s) => s !== value) : [...selected, value]);
  };

  const addCustom = () => {
    const v = draft.trim();
    if (!v) return;
    if (!selected.some((s) => s.toLowerCase() === v.toLowerCase())) onChange([...selected, v]);
    setDraft('');
  };

  // Valeurs custom (sélectionnées hors options) affichées en tête.
  const customSelected = selected.filter((s) => !options.includes(s));
  const all = [...customSelected, ...options];

  return (
    <div>
      <span className="mb-2 block text-sm text-muted">{label}</span>
      <div className="flex flex-wrap gap-2">
        {all.map((opt) => {
          const on = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm"
              style={{
                color: on ? color : 'var(--color-muted)',
                borderColor: on ? color : 'var(--color-border)',
                backgroundColor: on ? `color-mix(in srgb, ${color} 12%, transparent)` : 'transparent',
              }}
            >
              {opt}
              {on && <X size={13} className="opacity-70" />}
            </button>
          );
        })}

        {allowCustom && (
          <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder={placeholder}
              className="w-28 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
            />
            <button type="button" onClick={addCustom} aria-label="Ajouter" className="text-muted hover:text-leger">
              <Plus size={15} />
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

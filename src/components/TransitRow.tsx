import { Droplet, Hourglass } from 'lucide-react';
import type { DayEntry, Stool } from '../types';
import { Chip } from './Chip';
import { BRISTOL_HINT, STOOL_OPTIONS } from '../lib/constants';

/** Couleur d'une chip de selles selon l'échelle de Bristol. */
function stoolColor(stool?: Stool): string {
  const b = stool?.bristol;
  if (b == null) return 'var(--color-absent)';
  if (b >= 6 || b <= 1) return 'var(--color-severe)'; // diarrhée / constipation marquée
  if (b === 5 || b === 2) return 'var(--color-modere)';
  return 'var(--color-leger)'; // 3-4 normales
}

function stoolText(stool?: Stool): string | null {
  if (!stool || (!stool.label && !stool.count && !stool.bristol)) return null;
  const label = stool.label || 'Selles';
  const count = stool.count ? ` (×${stool.count})` : '';
  return `${label}${count}`;
}

interface TransitRowProps {
  day: DayEntry;
  editing: boolean;
  onChange: (patch: Partial<DayEntry>) => void;
}

/** Rangée « 1,2 L d'eau · Selles molles (×2) · Délai digestion : ~3 h ». */
export function TransitRow({ day, editing, onChange }: TransitRowProps) {
  if (!editing) {
    const chips: { text: string; color: string; title?: string }[] = [];
    if (typeof day.hydrationL === 'number')
      chips.push({ text: `${formatL(day.hydrationL)} d'eau`, color: 'var(--color-leger)', title: 'Hydratation du jour' });
    const st = stoolText(day.stool);
    if (st)
      chips.push({
        text: st,
        color: stoolColor(day.stool),
        title: day.stool?.bristol ? `Échelle de Bristol : type ${day.stool.bristol}` : undefined,
      });
    if (typeof day.digestionDelayH === 'number')
      chips.push({
        text: `Délai digestion : ~${day.digestionDelayH} h`,
        color: 'var(--color-absent)',
        title: 'Temps ressenti de digestion',
      });

    if (chips.length === 0) return <p className="text-sm text-muted">—</p>;
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Droplet size={14} className="text-muted" />
        {chips.map((c, i) => (
          <Chip key={i} color={c.color} title={c.title}>
            {c.text}
          </Chip>
        ))}
      </div>
    );
  }

  const stool = day.stool ?? {};
  // Valeur courante de la combobox : on retrouve l'option par son libellé.
  const currentStool = stool.label ?? '';

  function selectStool(label: string) {
    if (!label) {
      onChange({ stool: undefined });
      return;
    }
    const opt = STOOL_OPTIONS.find((o) => o.label === label);
    onChange({ stool: { ...stool, label, bristol: opt?.bristol } });
  }

  return (
    <div className="space-y-3 text-sm">
      <label className="flex items-center gap-2" title="Quantité d'eau bue sur la journée.">
        <Droplet size={15} className="text-muted" />
        <span className="w-28 text-muted">Eau (L)</span>
        <Stepper
          value={day.hydrationL ?? 0}
          step={0.1}
          min={0}
          onChange={(v) => onChange({ hydrationL: Math.round(v * 10) / 10 })}
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <span className="w-28 text-muted" title={BRISTOL_HINT}>
          Selles
        </span>
        <select
          value={currentStool}
          onChange={(e) => selectStool(e.target.value)}
          title={BRISTOL_HINT}
          className="flex-1 min-w-[12rem] rounded-md border border-border bg-surface-2 px-2 py-1.5 text-ink [color-scheme:dark]"
        >
          <option value="">— Type de selles —</option>
          {STOOL_OPTIONS.map((o) => (
            <option key={o.label} value={o.label}>
              {o.label}
            </option>
          ))}
        </select>
        <NumField
          label="nb"
          title="Nombre de selles dans la journée."
          value={stool.count}
          min={0}
          onChange={(v) => onChange({ stool: { ...stool, count: v } })}
        />
      </div>

      <label
        className="flex items-center gap-2"
        title="Temps ressenti entre la prise du repas et la digestion/évacuation."
      >
        <Hourglass size={15} className="text-muted" />
        <span className="w-28 text-muted">Délai digestion (h)</span>
        <Stepper
          value={day.digestionDelayH ?? 0}
          step={1}
          min={0}
          onChange={(v) => onChange({ digestionDelayH: v })}
        />
      </label>
    </div>
  );
}

function formatL(l: number): string {
  return `${l.toFixed(1).replace('.', ',')} L`;
}

function Stepper({
  value,
  onChange,
  step,
  min,
}: {
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
}) {
  return (
    <span className="inline-flex items-center overflow-hidden rounded-md border border-border">
      <button
        type="button"
        className="px-2.5 py-1 text-muted hover:text-ink"
        onClick={() => onChange(Math.max(min, Math.round((value - step) * 10) / 10))}
      >
        −
      </button>
      <span className="min-w-[3rem] text-center text-ink">{value.toString().replace('.', ',')}</span>
      <button
        type="button"
        className="px-2.5 py-1 text-muted hover:text-ink"
        onClick={() => onChange(Math.round((value + step) * 10) / 10)}
      >
        +
      </button>
    </span>
  );
}

function NumField({
  label,
  value,
  onChange,
  min,
  max,
  title,
}: {
  label: string;
  value?: number;
  onChange: (v: number | undefined) => void;
  min?: number;
  max?: number;
  title?: string;
}) {
  return (
    <input
      type="number"
      value={value ?? ''}
      min={min}
      max={max}
      placeholder={label}
      title={title}
      onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      className="w-20 rounded-md border border-border bg-surface-2 px-2 py-1 text-ink placeholder:text-muted [color-scheme:dark]"
    />
  );
}

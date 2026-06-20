import { Activity, Droplet, Moon } from 'lucide-react';
import type { DayEntry, Intensity } from '../types';
import { Chip } from './Chip';
import { INTENSITY_COLOR, INTENSITY_CYCLE, STRESS_LABEL } from '../lib/constants';

interface ContextRowProps {
  day: DayEntry;
  editing: boolean;
  onChange: (patch: Partial<DayEntry>) => void;
}

function nextIntensity(i: Intensity): Intensity {
  return INTENSITY_CYCLE[(INTENSITY_CYCLE.indexOf(i) + 1) % INTENSITY_CYCLE.length];
}

/** Facteurs contextuels : stress, sommeil, cycle menstruel (modulateurs du SII/SIBO). */
export function ContextRow({ day, editing, onChange }: ContextRowProps) {
  const stress = day.stress ?? 'absent';

  if (!editing) {
    const chips: { text: string; color: string; title?: string }[] = [];
    if (stress !== 'absent')
      chips.push({ text: `Stress ${STRESS_LABEL[stress].toLowerCase()}`, color: INTENSITY_COLOR[stress], title: 'Niveau de stress du jour' });
    if (typeof day.sleepH === 'number')
      chips.push({ text: `${formatH(day.sleepH)} de sommeil`, color: sleepColor(day.sleepH), title: 'Durée de sommeil' });
    if (day.menstrual) chips.push({ text: 'Règles', color: 'var(--color-modere)', title: 'Jour de règles (cycle menstruel)' });

    if (chips.length === 0) return <p className="text-sm text-muted">—</p>;
    return (
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((c, i) => (
          <Chip key={i} color={c.color} title={c.title}>
            {c.text}
          </Chip>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2" title="Niveau de stress ressenti dans la journée (modulateur fréquent des symptômes digestifs).">
        <Activity size={15} className="text-muted" />
        <span className="w-28 text-muted">Stress</span>
        <button
          type="button"
          onClick={() => onChange({ stress: nextIntensity(stress) })}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1"
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: INTENSITY_COLOR[stress] }} />
          <span className="text-ink">{STRESS_LABEL[stress]}</span>
        </button>
      </div>

      <label className="flex items-center gap-2" title="Nombre d'heures de sommeil de la nuit précédente.">
        <Moon size={15} className="text-muted" />
        <span className="w-28 text-muted">Sommeil (h)</span>
        <Stepper
          value={day.sleepH ?? 0}
          step={0.5}
          min={0}
          max={16}
          onChange={(v) => onChange({ sleepH: v === 0 ? undefined : v })}
        />
      </label>

      <div className="flex items-center gap-2" title="Cochez les jours de règles : les symptômes digestifs varient souvent avec le cycle.">
        <Droplet size={15} className="text-muted" />
        <span className="w-28 text-muted">Règles</span>
        <button
          type="button"
          onClick={() => onChange({ menstrual: !day.menstrual })}
          aria-pressed={!!day.menstrual}
          className="rounded-full border px-3 py-1"
          style={{
            color: day.menstrual ? 'var(--color-modere)' : 'var(--color-muted)',
            borderColor: day.menstrual ? 'var(--color-modere)' : 'var(--color-border)',
            backgroundColor: day.menstrual ? 'color-mix(in srgb, var(--color-modere) 12%, transparent)' : 'transparent',
          }}
        >
          {day.menstrual ? 'Oui' : 'Non'}
        </button>
      </div>
    </div>
  );
}

function formatH(h: number): string {
  return `${h.toString().replace('.', ',')} h`;
}

function sleepColor(h: number): string {
  if (h < 6) return 'var(--color-severe)';
  if (h < 7) return 'var(--color-modere)';
  return 'var(--color-leger)';
}

function Stepper({
  value,
  onChange,
  step,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
  max: number;
}) {
  const round = (v: number) => Math.round(v * 10) / 10;
  return (
    <span className="inline-flex items-center overflow-hidden rounded-md border border-border">
      <button type="button" className="px-2.5 py-1 text-muted hover:text-ink" onClick={() => onChange(round(Math.max(min, value - step)))}>
        −
      </button>
      <span className="min-w-[3rem] text-center text-ink">{value.toString().replace('.', ',')}</span>
      <button type="button" className="px-2.5 py-1 text-muted hover:text-ink" onClick={() => onChange(round(Math.min(max, value + step)))}>
        +
      </button>
    </span>
  );
}

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addWeeks } from 'date-fns';
import type { DayEntry } from '../types';
import { useDays } from '../hooks/useDays';
import { computeWeekStats, dayHasContent, effectiveDaySymptoms } from '../lib/aggregates';
import { detectCorrelations, type CorrelationLevel } from '../lib/correlations';
import { suggestDayQuality } from '../lib/quality';
import { SYMPTOM_ORDER } from '../lib/constants';
import {
  dayOfMonth,
  fromISODate,
  todayISO,
  toISODate,
  weekDays,
  weekLabel,
  weekdayShort,
} from '../lib/dates';
import { TipBanner } from '../components/TipBanner';

interface WeekViewProps {
  date: string;
  onDateChange: (iso: string) => void;
  onOpenDay: (iso: string) => void;
}

const LEVEL_COLOR: Record<CorrelationLevel, string> = {
  defavorable: 'var(--color-severe)',
  surveiller: 'var(--color-modere)',
  favorable: 'var(--color-leger)',
  neutre: 'var(--color-absent)',
};

const QUALITY_COLOR = {
  difficile: 'var(--color-severe)',
  correcte: 'var(--color-modere)',
  bonne: 'var(--color-leger)',
} as const;

/** Couleur d'un jour dans l'agenda : qualité effective, ou neutre si pas de données. */
function dayColor(day: DayEntry): string | null {
  if (!dayHasContent(day)) return null;
  const q = day.quality ?? suggestDayQuality(day);
  return q ? QUALITY_COLOR[q] : null;
}

function countActiveSymptoms(day: DayEntry): number {
  const sym = effectiveDaySymptoms(day);
  return SYMPTOM_ORDER.filter((k) => sym[k] !== 'absent').length;
}

export function WeekView({ date, onDateChange, onOpenDay }: WeekViewProps) {
  const dates = weekDays(fromISODate(date));
  const days = useDays(dates);
  const goWeek = (d: number) => onDateChange(toISODate(addWeeks(fromISODate(date), d)));

  if (!days) return <Loading />;

  const stats = computeWeekStats(days);
  const correlations = detectCorrelations(days);
  const today = todayISO();

  return (
    <div className="mx-auto max-w-3xl px-4 pt-4 pb-28">
      <TipBanner tab="semaine" />

      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => goWeek(-1)} aria-label="Semaine précédente" className="rounded-full border border-border p-2 text-muted hover:text-ink">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-medium text-ink">{weekLabel(fromISODate(date))}</h2>
        <button type="button" onClick={() => goWeek(1)} aria-label="Semaine suivante" className="rounded-full border border-border p-2 text-muted hover:text-ink">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Agenda cliquable de la semaine */}
      <div className="mb-6 grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const color = dayColor(day);
          const isToday = day.date === today;
          const isSelected = day.date === date;
          const nSym = countActiveSymptoms(day);
          const nMeals = day.meals.filter((m) => m.foods.length > 0).length;
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onOpenDay(day.date)}
              title={`${weekdayShort(day.date)} ${dayOfMonth(day.date)} — ${nMeals} repas, ${nSym} symptôme(s). Ouvrir dans le Journal.`}
              className="flex flex-col items-center gap-1 rounded-xl border bg-surface py-2 transition active:scale-95"
              style={{
                borderColor: isSelected ? 'var(--color-leger)' : 'var(--color-border)',
                boxShadow: isSelected ? '0 0 0 1px var(--color-leger) inset' : undefined,
              }}
            >
              <span className="text-[10px] uppercase text-muted">{weekdayShort(day.date)}</span>
              <span className={`text-sm ${isToday ? 'font-bold text-ink' : 'text-ink'}`}>
                {dayOfMonth(day.date)}
              </span>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: color ?? 'transparent', outline: color ? 'none' : '1px solid var(--color-border)' }}
              />
              <span className="text-[9px] leading-none text-muted">
                {nMeals > 0 ? `${nMeals}🍴` : '—'}
              </span>
            </button>
          );
        })}
      </div>

      <h3 className="mb-3 text-xl font-semibold text-ink">Récapitulatif de la semaine</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Jours difficiles" value={`${stats.hardDays} / ${stats.totalDays}`} color="severe" />
        <StatCard label="Épisodes de ballonnements sévères" value={`${stats.severeBloating}`} color="severe" />
        <StatCard label="Épisodes de diarrhée" value={`${stats.diarrheaEpisodes}`} color="modere" />
        <StatCard
          label="Jours sans sucre ajouté"
          value={`${stats.noAddedSugarDays} / ${stats.totalDays}`}
          color="leger"
        />
        <StatCard
          label="Hydratation moy. / jour"
          value={stats.avgHydration != null ? `${stats.avgHydration.toFixed(1).replace('.', ',')} L` : '—'}
          color="leger"
        />
        <StatCard
          label="Score énergie moy."
          value={stats.energyScore != null ? `${stats.energyScore} / 10` : '—'}
          color="modere"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <h3 className="mb-3 text-base font-semibold text-ink">Corrélations identifiées cette semaine</h3>
        {correlations.length === 0 ? (
          <p className="text-sm text-muted">Pas encore assez de données pour dégager des corrélations fiables.</p>
        ) : (
          <ul className="space-y-2.5">
            {correlations.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-ink">
                <span
                  className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: LEVEL_COLOR[c.level] }}
                />
                {c.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const COLOR_VAR: Record<'severe' | 'modere' | 'leger', string> = {
  severe: 'var(--color-severe)',
  modere: 'var(--color-modere)',
  leger: 'var(--color-leger)',
};

function StatCard({ label, value, color }: { label: string; value: string; color: keyof typeof COLOR_VAR }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="min-h-[2.5rem] text-sm leading-tight text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold" style={{ color: COLOR_VAR[color] }}>
        {value}
      </div>
    </div>
  );
}

function Loading() {
  return <div className="mx-auto max-w-3xl px-4 pt-10 text-center text-muted">Chargement…</div>;
}

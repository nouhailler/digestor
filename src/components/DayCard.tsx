import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  Droplets,
  Pencil,
  Plus,
  ScrollText,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import type { DayEntry, DayQuality, FoodInsight, Meal, SymptomKey } from '../types';
import { dayLongLabel } from '../lib/dates';
import { makeMeal } from '../lib/factory';
import { DEFAULT_MEAL_TIMES, SYMPTOM_ORDER } from '../lib/constants';
import { suggestDayQuality } from '../lib/quality';
import { QualityBadge } from './QualityBadge';
import { MealEditor } from './MealEditor';
import { SymptomGrid, cycleIntensity } from './SymptomGrid';
import { TransitRow } from './TransitRow';

const QUALITY_CYCLE: DayQuality[] = [null, 'difficile', 'correcte', 'bonne'];

interface DayCardProps {
  day: DayEntry;
  update: (updater: (prev: DayEntry) => DayEntry) => void;
  defaultEditing?: boolean;
  /** Tap sur une chip d'aliment (mode lecture) → analyse IA. */
  onFoodInfo?: (name: string) => void;
  /** Tap sur un symptôme (mode lecture) → fiche encyclopédie. */
  onSymptomInfo?: (key: SymptomKey) => void;
  /** Aliments déjà saisis : proposés en autocomplétion (anti-doublon). */
  knownFoods?: string[];
  /** Analyses IA des aliments (par nom normalisé) : colore les chips dynamiquement. */
  insights?: Map<string, FoodInsight>;
}

export function DayCard({ day, update, defaultEditing = false, onFoodInfo, onSymptomInfo, knownFoods, insights }: DayCardProps) {
  const [editing, setEditing] = useState(defaultEditing);

  const suggested = useMemo(() => suggestDayQuality(day), [day]);
  const effectiveQuality = day.quality ?? suggested;
  const isSuggested = day.quality == null && effectiveQuality != null;
  // Symptômes « généraux » (non rattachés à un repas) : affichés si présents ou s'il n'y a aucun repas.
  const hasGeneralSymptoms = SYMPTOM_ORDER.some((k) => day.symptoms[k] !== 'absent');
  const showGeneralSymptoms = day.meals.length === 0 || hasGeneralSymptoms;

  function setMeal(meal: Meal) {
    update((d) => ({ ...d, meals: d.meals.map((m) => (m.id === meal.id ? meal : m)) }));
  }
  function removeMeal(id: string) {
    update((d) => ({ ...d, meals: d.meals.filter((m) => m.id !== id) }));
  }
  function addMeal() {
    update((d) => {
      const time = DEFAULT_MEAL_TIMES[d.meals.length] ?? '12:00';
      return { ...d, meals: [...d.meals, makeMeal(time)] };
    });
  }
  function cycleSymptom(key: SymptomKey) {
    update((d) => ({
      ...d,
      symptoms: { ...d.symptoms, [key]: cycleIntensity(d.symptoms[key]) },
    }));
  }
  function cycleQuality() {
    update((d) => {
      const current = d.quality ?? suggestDayQuality(d);
      const next = QUALITY_CYCLE[(QUALITY_CYCLE.indexOf(current) + 1) % QUALITY_CYCLE.length];
      return { ...d, quality: next };
    });
  }

  const sortedMeals = [...day.meals].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <article className="print-card rounded-2xl border border-border bg-surface p-5">
      {/* En-tête de carte */}
      <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
        <h2 className="flex items-center gap-2 text-lg font-medium text-ink">
          <CalendarDays size={18} className="text-muted" />
          {dayLongLabel(day.date)}
        </h2>
        <div className="flex items-center gap-2">
          <QualityBadge
            quality={effectiveQuality}
            suggested={isSuggested}
            onClick={editing ? cycleQuality : undefined}
          />
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            className="no-print rounded-full border border-border p-1.5 text-muted hover:text-ink"
            aria-label={editing ? 'Terminer' : 'Modifier'}
            title={editing ? 'Terminer' : 'Modifier'}
          >
            {editing ? <Check size={16} /> : <Pencil size={15} />}
          </button>
        </div>
      </div>

      {/* Repas */}
      <Section icon={<UtensilsCrossed size={15} />} title="Repas du jour">
        {sortedMeals.length === 0 && !editing && (
          <p className="text-sm text-muted">Aucun repas enregistré.</p>
        )}
        <div className="space-y-4">
          {sortedMeals.map((meal) => (
            <MealEditor
              key={meal.id}
              meal={meal}
              editing={editing}
              onChange={setMeal}
              onRemove={() => removeMeal(meal.id)}
              onFoodInfo={onFoodInfo}
              onSymptomInfo={onSymptomInfo}
              knownFoods={knownFoods}
              insights={insights}
            />
          ))}
        </div>
        {editing && (
          <button
            type="button"
            onClick={addMeal}
            title="Ajouter un repas (heure + aliments + symptômes ressentis après)."
            className="mt-3 inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm text-muted hover:text-ink"
          >
            <Plus size={15} /> Repas
          </button>
        )}
      </Section>

      {/* Symptômes généraux (hors repas) — n'apparaît que si pertinent. */}
      {(showGeneralSymptoms || editing) && (
        <Section
          icon={<Sparkles size={15} />}
          title={day.meals.length === 0 ? 'Symptômes' : 'Symptômes (hors repas)'}
          suffix={
            !editing && day.symptomTiming ? (
              <span className="text-xs uppercase tracking-wide text-muted">({day.symptomTiming})</span>
            ) : null
          }
        >
          {editing && (
            <input
              value={day.symptomTiming ?? ''}
              onChange={(e) => update((d) => ({ ...d, symptomTiming: e.target.value }))}
              placeholder="Moment (ex. 2 h après le dîner) — optionnel"
              title="Précisez quand les symptômes généraux sont survenus."
              className="mb-3 w-full rounded-md border border-border bg-surface-2 px-2 py-1 text-sm text-ink placeholder:text-muted"
            />
          )}
          {showGeneralSymptoms || editing ? (
            <SymptomGrid
              symptoms={day.symptoms}
              editing={editing}
              onCycle={cycleSymptom}
              onInfo={!editing ? onSymptomInfo : undefined}
            />
          ) : (
            <p className="text-sm text-muted">Renseignés par repas ci-dessus.</p>
          )}
        </Section>
      )}

      {/* Notes */}
      <Section icon={<ScrollText size={15} />} title="Notes">
        {editing ? (
          <textarea
            value={day.notes ?? ''}
            onChange={(e) => update((d) => ({ ...d, notes: e.target.value }))}
            rows={3}
            placeholder="Observations du jour…"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted"
          />
        ) : day.notes ? (
          <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm leading-relaxed text-ink">
            {day.notes}
          </div>
        ) : (
          <p className="text-sm text-muted">—</p>
        )}
      </Section>

      {/* Transit & hydratation */}
      <Section icon={<Droplets size={15} />} title="Transit & hydratation">
        <TransitRow day={day} editing={editing} onChange={(patch) => update((d) => ({ ...d, ...patch }))} />
      </Section>
    </article>
  );
}

function Section({
  icon,
  title,
  suffix,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  suffix?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
        <span className="text-muted">{icon}</span>
        {title}
        {suffix}
      </h3>
      {children}
    </section>
  );
}

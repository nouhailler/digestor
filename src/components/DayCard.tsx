import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Droplets,
  HeartPulse,
  Pencil,
  Plus,
  ScrollText,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import type { DayEntry, DayQuality, FoodInsight, Meal, SymptomKey } from '../types';
import { dayLongLabel } from '../lib/dates';
import { makeMeal } from '../lib/factory';
import { mealFromTemplate, templateFromMeal } from '../lib/mealTemplates';
import { putMealTemplate } from '../lib/db';
import { syncSatietyNotes } from '../lib/satietyDuration';
import { useMealTemplates } from '../hooks/useMealTemplates';
import { DEFAULT_MEAL_TIMES, INTENSITY_COLOR, SYMPTOM_LABELS, SYMPTOM_ORDER } from '../lib/constants';
import { suggestDayQuality } from '../lib/quality';
import {
  AMINE_LEVEL_COLOR,
  AMINE_LEVEL_LABEL,
  AMINE_LOAD_COLOR,
  AMINE_LOAD_LABEL,
  amineBreakdown,
} from '../lib/biogenicAmines';
import { QualityBadge } from './QualityBadge';
import { MealEditor } from './MealEditor';
import { SymptomGrid, cycleIntensity } from './SymptomGrid';
import { TransitRow } from './TransitRow';
import { ContextRow } from './ContextRow';

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
  /** Aliments consommés récemment (aujourd'hui/hier/avant-hier) : proposés en tête. */
  recentFoods?: string[];
  /** Noms des aliments favoris : proposés en tête des suggestions. */
  favorites?: string[];
  /** Analyses IA des aliments (par nom normalisé) : colore les chips dynamiquement. */
  insights?: Map<string, FoodInsight>;
}

export function DayCard({ day, update, defaultEditing = false, onFoodInfo, onSymptomInfo, knownFoods, recentFoods, favorites, insights }: DayCardProps) {
  const [editing, setEditing] = useState(defaultEditing);
  const [tplOpen, setTplOpen] = useState(false);
  const [amineOpen, setAmineOpen] = useState(false);
  const templates = useMealTemplates();

  const suggested = useMemo(() => suggestDayQuality(day), [day]);
  const amine = useMemo(
    () => amineBreakdown(day.meals.flatMap((m) => m.foods.map((f) => f.name))),
    [day],
  );
  const amineLoad = amine.load;
  const effectiveQuality = day.quality ?? suggested;
  const isSuggested = day.quality == null && effectiveQuality != null;
  // Symptômes « généraux » (non rattachés à un repas) : affichés si présents ou s'il n'y a aucun repas.
  const hasGeneralSymptoms = SYMPTOM_ORDER.some((k) => day.symptoms[k] !== 'absent');
  const showGeneralSymptoms = day.meals.length === 0 || hasGeneralSymptoms;

  function setMeal(meal: Meal) {
    update((d) => syncSatietyNotes({ ...d, meals: d.meals.map((m) => (m.id === meal.id ? meal : m)) }, insights));
  }
  function removeMeal(id: string) {
    update((d) => syncSatietyNotes({ ...d, meals: d.meals.filter((m) => m.id !== id) }, insights));
  }
  function addMeal() {
    update((d) => {
      const time = DEFAULT_MEAL_TIMES[d.meals.length] ?? '12:00';
      return { ...d, meals: [...d.meals, makeMeal(time)] };
    });
  }
  function addMealFromTemplate(id: string) {
    const tpl = templates.find((t) => t.id === id);
    setTplOpen(false);
    if (!tpl) return;
    update((d) => {
      const time = tpl.time ?? DEFAULT_MEAL_TIMES[d.meals.length] ?? '12:00';
      return { ...d, meals: [...d.meals, mealFromTemplate(tpl, time)] };
    });
  }
  function saveMealAsTemplate(meal: Meal) {
    if (meal.foods.length === 0) return;
    const name = window.prompt('Nom du modèle de repas :', meal.foods[0]?.name ?? 'Mon repas');
    if (name?.trim()) void putMealTemplate(templateFromMeal(name.trim(), meal));
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
        <div className="flex items-center gap-2" data-tour="journal-edit">
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

      {/* Charge en amines biogènes (histamine) du jour — cliquable pour le détail */}
      {amineLoad.band !== 'faible' && (
        <div
          className="mt-3 rounded-xl border text-sm"
          style={{
            borderColor: AMINE_LOAD_COLOR[amineLoad.band],
            backgroundColor: `color-mix(in srgb, ${AMINE_LOAD_COLOR[amineLoad.band]} 10%, transparent)`,
          }}
        >
          <button
            type="button"
            onClick={() => setAmineOpen((o) => !o)}
            aria-expanded={amineOpen}
            className="flex w-full flex-wrap items-center gap-2 px-3 py-2 text-left"
            title="Pourquoi cette charge ? Toucher pour le détail (aliments concernés, freineurs de DAO)."
          >
            <span className="font-medium" style={{ color: AMINE_LOAD_COLOR[amineLoad.band] }}>
              Amines : {AMINE_LOAD_LABEL[amineLoad.band].replace('Charge ', '')}
            </span>
            {amineLoad.combo && (
              <span className="text-muted">· combinaison à risque (alcool + fromage/charcuterie/fermenté)</span>
            )}
            {!amineLoad.combo && amineLoad.daoBlockers > 0 && (
              <span className="text-muted">· {amineLoad.daoBlockers} freineur(s) de DAO</span>
            )}
            <ChevronDown
              size={16}
              className="ml-auto shrink-0 text-muted transition-transform"
              style={{ transform: amineOpen ? 'rotate(180deg)' : 'none' }}
            />
          </button>

          {amineOpen && (
            <div className="space-y-3 border-t px-3 py-3" style={{ borderColor: 'var(--color-border)' }}>
              <p className="leading-relaxed text-muted">
                Les amines biogènes (histamine, tyramine…) s'accumulent sur la journée. La réaction dépend de la
                quantité, des <strong>combinaisons</strong> et de la dégradation par la <strong>DAO</strong>.
              </p>

              {amine.contributors.length > 0 && (
                <AmineDetailGroup title="Pourquoi élevée — aliments concernés">
                  {amine.contributors.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: AMINE_LEVEL_COLOR[c.info.level] }}
                      />
                      <span className="text-ink">
                        {c.name}{' '}
                        <span className="text-muted">— {AMINE_LEVEL_LABEL[c.info.level].toLowerCase()}</span>
                        {c.info.note && <span className="text-muted"> · {c.info.note}</span>}
                      </span>
                    </li>
                  ))}
                </AmineDetailGroup>
              )}

              {amine.daoBlockers.length > 0 && (
                <AmineDetailGroup title="Freineurs de DAO (gênent la dégradation de l’histamine)">
                  {amine.daoBlockers.map((c, i) => (
                    <li key={i} className="text-ink">
                      {c.name}
                      {c.info.note && <span className="text-muted"> · {c.info.note}</span>}
                    </li>
                  ))}
                </AmineDetailGroup>
              )}

              {amine.liberators.length > 0 && (
                <AmineDetailGroup title="Histamino-libérateurs (libèrent l’histamine endogène)">
                  {amine.liberators.map((c, i) => (
                    <li key={i} className="text-ink">{c.name}</li>
                  ))}
                </AmineDetailGroup>
              )}

              {amineLoad.combo && (
                <p className="rounded-lg border border-border bg-surface-2 px-3 py-2 leading-relaxed text-ink">
                  ⚠️ Combinaison à risque détectée : <strong>alcool + fromage affiné / charcuterie / fermenté</strong>.
                  Ces associations déclenchent souvent, même si chaque aliment seul passe « à peu près ».
                </p>
              )}

              <p className="text-xs text-muted">
                Estimation indicative (la teneur réelle varie selon fraîcheur et affinage), non médicale.
              </p>
            </div>
          )}
        </div>
      )}

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
              recentFoods={recentFoods}
              favorites={favorites}
              insights={insights}
              onSaveAsTemplate={saveMealAsTemplate}
            />
          ))}
        </div>
        {editing && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addMeal}
              title="Ajouter un repas (heure + aliments + symptômes ressentis après)."
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm text-muted hover:text-ink"
            >
              <Plus size={15} /> Repas
            </button>
            {templates.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTplOpen((o) => !o)}
                  title="Ajouter un repas à partir d'un modèle enregistré."
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm text-muted hover:text-ink"
                >
                  <ClipboardList size={15} /> Depuis un modèle
                </button>
                {tplOpen && (
                  <ul className="absolute left-0 top-full z-10 mt-1 max-h-56 w-56 overflow-auto rounded-lg border border-border bg-surface-2 py-1 shadow-lg">
                    {templates.map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => addMealFromTemplate(t.id)}
                          className="block w-full px-3 py-1.5 text-left text-sm text-ink hover:bg-surface"
                        >
                          {t.name}
                          <span className="block truncate text-xs text-muted">
                            {t.foods.map((f) => f.name).join(', ')}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Symptômes généraux (hors repas) — n'apparaît que si pertinent ; repliée par défaut. */}
      {(showGeneralSymptoms || editing) && (
        <Section
          icon={<Sparkles size={15} />}
          title={day.meals.length === 0 ? 'Symptômes' : 'Symptômes (hors repas)'}
          collapsible
          defaultOpen={false}
          summary={
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 normal-case tracking-normal">
              {SYMPTOM_ORDER.filter((k) => day.symptoms[k] !== 'absent').length === 0 ? (
                <span className="font-normal text-muted">aucun</span>
              ) : (
                SYMPTOM_ORDER.filter((k) => day.symptoms[k] !== 'absent').map((k) => (
                  <span key={k} className="inline-flex items-center gap-1.5 font-normal text-ink">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: INTENSITY_COLOR[day.symptoms[k]] }}
                    />
                    {SYMPTOM_LABELS[k]}
                  </span>
                ))
              )}
            </span>
          }
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

      {/* Bien-être & contexte (stress, sommeil, cycle) */}
      <Section icon={<HeartPulse size={15} />} title="Bien-être & contexte">
        <ContextRow day={day} editing={editing} onChange={(patch) => update((d) => ({ ...d, ...patch }))} />
      </Section>
    </article>
  );
}

function Section({
  icon,
  title,
  suffix,
  collapsible = false,
  defaultOpen = true,
  summary,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  suffix?: React.ReactNode;
  /** Rend la section pliable (en-tête cliquable + chevron). */
  collapsible?: boolean;
  /** État initial si pliable (défaut : ouvert). */
  defaultOpen?: boolean;
  /** Aperçu affiché dans l'en-tête quand la section est repliée. */
  summary?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (!collapsible) {
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

  return (
    <section className="mt-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mb-3 flex w-full items-center gap-2 text-left text-xs font-semibold uppercase tracking-wider text-muted hover:text-ink"
      >
        <span className="text-muted">{icon}</span>
        {title}
        {suffix}
        {!open && summary}
        <ChevronDown
          size={14}
          className={`ml-auto shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && children}
    </section>
  );
}

/** Groupe titré du détail « amines » (liste à puces). */
function AmineDetailGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">{title}</p>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

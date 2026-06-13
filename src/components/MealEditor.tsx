import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { FoodCategory, Meal, SymptomKey } from '../types';
import { Chip } from './Chip';
import {
  CATEGORY_COLOR,
  CATEGORY_CYCLE,
  INTENSITY_COLOR,
  INTENSITY_LABEL,
  SYMPTOM_LABELS,
  SYMPTOM_ORDER,
} from '../lib/constants';
import { emptySymptoms, makeFood } from '../lib/factory';
import { SymptomGrid, cycleIntensity } from './SymptomGrid';

function nextCategory(c: FoodCategory): FoodCategory {
  return CATEGORY_CYCLE[(CATEGORY_CYCLE.indexOf(c) + 1) % CATEGORY_CYCLE.length];
}

interface MealEditorProps {
  meal: Meal;
  editing: boolean;
  onChange: (meal: Meal) => void;
  onRemove: () => void;
  /** En lecture, taper une chip ouvre l'analyse IA de l'aliment. */
  onFoodInfo?: (name: string) => void;
}

/** Un repas : heure (gris) + chips aliments qui s'enroulent. */
export function MealEditor({ meal, editing, onChange, onRemove, onFoodInfo }: MealEditorProps) {
  const [draft, setDraft] = useState('');

  function addFood() {
    const name = draft.trim();
    if (!name) return;
    onChange({ ...meal, foods: [...meal.foods, makeFood(name)] });
    setDraft('');
  }

  function cycleFood(id: string) {
    onChange({
      ...meal,
      foods: meal.foods.map((f) =>
        f.id === id ? { ...f, category: nextCategory(f.category) } : f,
      ),
    });
  }

  function removeFood(id: string) {
    onChange({ ...meal, foods: meal.foods.filter((f) => f.id !== id) });
  }

  const symptoms = meal.symptoms ?? emptySymptoms();
  const activeSymptoms = SYMPTOM_ORDER.filter((k) => symptoms[k] !== 'absent');

  function cycleSymptom(key: SymptomKey) {
    onChange({ ...meal, symptoms: { ...symptoms, [key]: cycleIntensity(symptoms[key]) } });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            type="time"
            value={meal.time}
            onChange={(e) => onChange({ ...meal, time: e.target.value })}
            title="Heure du repas. Sert aussi à situer les symptômes ressentis après."
            className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs text-muted [color-scheme:dark]"
          />
        ) : (
          <span className="text-xs text-muted">{formatTime(meal.time)}</span>
        )}
        {editing && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Supprimer le repas"
            className="text-muted hover:text-severe"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {meal.foods.map((food) => (
          <Chip
            key={food.id}
            color={CATEGORY_COLOR[food.category]}
            onClick={
              editing
                ? () => cycleFood(food.id)
                : onFoodInfo
                  ? () => onFoodInfo(food.name)
                  : undefined
            }
            title={editing ? 'Changer la catégorie' : onFoodInfo ? "Analyser avec l'IA" : undefined}
          >
            {food.name}
            {editing && (
              <X
                size={13}
                className="ml-0.5 opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFood(food.id);
                }}
              />
            )}
          </Chip>
        ))}

        {editing && (
          <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFood();
                }
              }}
              placeholder="ajouter un aliment…"
              title="Tapez un aliment puis Entrée. Sa catégorie (couleur) est devinée automatiquement, modifiable ensuite d'un toucher."
              className="w-36 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
            />
            <button type="button" onClick={addFood} aria-label="Ajouter" className="text-muted hover:text-leger">
              <Plus size={15} />
            </button>
          </span>
        )}
      </div>

      {/* Zone symptômes du repas */}
      {editing ? (
        <div className="rounded-lg border border-border/70 bg-surface-2/40 p-3">
          <p
            className="mb-2 text-xs font-medium uppercase tracking-wide text-muted"
            title="Symptômes ressentis dans les heures qui suivent ce repas. Touchez une pastille pour faire varier l'intensité."
          >
            Symptômes après ce repas
          </p>
          <SymptomGrid symptoms={symptoms} editing onCycle={cycleSymptom} />
        </div>
      ) : (
        activeSymptoms.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-1">
            {activeSymptoms.map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-1.5 text-xs text-ink"
                title={`${SYMPTOM_LABELS[k]} — ${INTENSITY_LABEL[symptoms[k]]}`}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: INTENSITY_COLOR[symptoms[k]] }}
                />
                {SYMPTOM_LABELS[k]}
              </span>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function formatTime(t: string): string {
  // "07:30" → "7 h 30", "16:00" → "16 h 00"
  const [h, m] = t.split(':');
  return `${Number(h)} h ${m}`;
}

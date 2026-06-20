import { useMemo, useState } from 'react';
import { ChevronDown, Plus, Scale, Star, Trash2, X } from 'lucide-react';
import type { FoodCategory, FoodInsight, FoodItem, FoodQuantity, Meal, SymptomKey } from '../types';
import { Chip } from './Chip';
import { FoodQuantityEditor } from './FoodQuantityEditor';
import { formatQuantity } from '../lib/quantity';
import {
  CATEGORY_COLOR,
  CATEGORY_CYCLE,
  INTENSITY_COLOR,
  INTENSITY_LABEL,
  SYMPTOM_LABELS,
  SYMPTOM_ORDER,
} from '../lib/constants';
import { emptySymptoms, makeFood } from '../lib/factory';
import { normalize } from '../lib/foodClassifier';
import { foodSuggestions } from '../lib/foodSuggestions';
import { FODMAP_LEVEL_LABEL, insightChipColor } from '../lib/ai/insightFormat';
import { SymptomGrid, cycleIntensity } from './SymptomGrid';

/** Nb de suggestions d'autocomplétion affichées au maximum. */
const MAX_SUGGESTIONS = 6;

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
  /** En lecture, taper un symptôme ouvre sa fiche (encyclopédie). */
  onSymptomInfo?: (key: SymptomKey) => void;
  /** Aliments déjà saisis ailleurs : proposés en autocomplétion (anti-doublon). */
  knownFoods?: string[];
  /** Noms des aliments favoris : proposés en tête des suggestions. */
  favorites?: string[];
  /** Analyses IA des aliments (par nom normalisé) : colore les chips dynamiquement. */
  insights?: Map<string, FoodInsight>;
}

/** Un repas : heure (gris) + chips aliments qui s'enroulent. */
export function MealEditor({ meal, editing, onChange, onRemove, onFoodInfo, onSymptomInfo, knownFoods = [], favorites = [], insights }: MealEditorProps) {
  const [draft, setDraft] = useState('');
  // Saisie d'aliment focalisée : permet d'afficher les favoris (ajout rapide) tant
  // que rien n'est tapé, sans laisser la liste ouverte au rendu initial.
  const [foodInputFocused, setFoodInputFocused] = useState(false);
  // Id de l'aliment dont le popover de quantité est ouvert (un seul à la fois).
  const [qtyOpen, setQtyOpen] = useState<string | null>(null);
  // La grille des symptômes du repas est repliée par défaut (la plupart des repas
  // n'en ont aucun) ; on la déplie à la demande pour gagner de la place.
  const [symptomsOpen, setSymptomsOpen] = useState(false);

  // En lecture, la couleur d'un aliment reflète son analyse IA (niveau FODMAP :
  // sévère / modéré / léger) dès qu'elle existe ; sinon sa catégorie saisie.
  // En édition, on garde la catégorie manuelle pour que le cycle de couleur reste visible.
  function foodColor(food: FoodItem): string {
    const insight = editing ? undefined : insights?.get(normalize(food.name));
    return insight ? insightChipColor(insight) : CATEGORY_COLOR[food.category];
  }
  function foodTitle(food: FoodItem): string | undefined {
    if (editing) return 'Changer la catégorie';
    if (!onFoodInfo) return undefined;
    const insight = insights?.get(normalize(food.name));
    return insight
      ? `Analyse IA — FODMAP ${FODMAP_LEVEL_LABEL[insight.fodmapLevel].toLowerCase()}. Toucher pour le détail.`
      : "Analyser avec l'IA";
  }

  // Suggestions d'aliments : favoris en tête (ajout rapide quand rien n'est tapé),
  // puis aliments déjà connus dès 3 caractères, hors aliments déjà dans ce repas.
  const suggestions = useMemo(
    () =>
      foodSuggestions({
        query: draft,
        favorites,
        knownFoods,
        exclude: new Set(meal.foods.map((f) => normalize(f.name))),
        limit: MAX_SUGGESTIONS,
      }),
    [draft, favorites, knownFoods, meal.foods],
  );
  // On affiche la liste seulement quand le champ a le focus (évite qu'elle reste
  // ouverte au rendu, notamment pour la liste des favoris à requête vide).
  const showSuggestions = foodInputFocused && suggestions.length > 0;

  function addFood(name = draft) {
    const trimmed = name.trim();
    if (!trimmed) return;
    onChange({ ...meal, foods: [...meal.foods, makeFood(trimmed)] });
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

  function setFoodQuantity(id: string, quantity: FoodQuantity | undefined) {
    onChange({
      ...meal,
      foods: meal.foods.map((f) => {
        if (f.id !== id) return f;
        if (!quantity) {
          const { quantity: _omit, ...rest } = f;
          return rest;
        }
        return { ...f, quantity };
      }),
    });
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
          <span key={food.id} className="relative inline-flex">
            <Chip
              color={foodColor(food)}
              onClick={
                editing
                  ? () => cycleFood(food.id)
                  : onFoodInfo
                    ? () => onFoodInfo(food.name)
                    : undefined
              }
              title={foodTitle(food)}
            >
              {food.quantity && (
                <span className="opacity-70">{formatQuantity(food.quantity)}</span>
              )}
              {food.name}
              {editing && (
                <>
                  {/* Balance = quantité de l'aliment à sa gauche. Zone tactile élargie
                      (padding + marges négatives) et séparée de la croix de suppression. */}
                  <span
                    role="button"
                    aria-label="Régler la quantité"
                    title="Régler la quantité (càc, càs, g…)"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQtyOpen((cur) => (cur === food.id ? null : food.id));
                    }}
                    className="-my-1.5 ml-1 flex cursor-pointer items-center rounded-full p-1.5 opacity-80 hover:bg-white/10 hover:opacity-100"
                  >
                    <Scale size={16} />
                  </span>
                  <span
                    role="button"
                    aria-label="Supprimer l'aliment"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFood(food.id);
                    }}
                    className="-my-1.5 -mr-1 ml-1.5 flex cursor-pointer items-center rounded-full border-l border-white/10 p-1.5 pl-2 opacity-70 hover:bg-white/10 hover:opacity-100"
                  >
                    <X size={15} />
                  </span>
                </>
              )}
            </Chip>
            {editing && qtyOpen === food.id && (
              <FoodQuantityEditor
                value={food.quantity}
                onChange={(q) => setFoodQuantity(food.id, q)}
                onClose={() => setQtyOpen(null)}
              />
            )}
          </span>
        ))}

        {editing && (
          <span className="relative inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-1">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onFocus={() => setFoodInputFocused(true)}
              // léger délai : laisse le clic sur une suggestion (onMouseDown) agir avant la fermeture.
              onBlur={() => setTimeout(() => setFoodInputFocused(false), 120)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFood();
                }
              }}
              placeholder="ajouter un aliment…"
              title="Tapez un aliment puis Entrée. Vos favoris (★) sont proposés en premier. La catégorie (couleur) est devinée automatiquement, modifiable ensuite d'un toucher."
              className="w-36 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
            />
            <button type="button" onClick={() => addFood()} aria-label="Ajouter" className="text-muted hover:text-leger">
              <Plus size={15} />
            </button>

            {showSuggestions && (
              <ul
                className="absolute left-0 top-full z-10 mt-1 max-h-56 w-56 overflow-auto rounded-lg border border-border bg-surface-2 py-1 shadow-lg"
                role="listbox"
                aria-label="Aliments suggérés (favoris d'abord)"
              >
                {suggestions.map((s) => (
                  <li key={s.name}>
                    <button
                      type="button"
                      // onMouseDown : agir avant le blur de l'input.
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addFood(s.name);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-ink hover:bg-surface"
                    >
                      {s.favorite && (
                        <Star size={13} fill="currentColor" className="shrink-0" style={{ color: 'var(--color-modere)' }} />
                      )}
                      <span className="truncate">{s.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </span>
        )}
      </div>

      {/* Zone symptômes du repas — repliée par défaut pour économiser l'espace. */}
      {editing ? (
        <div className="rounded-lg border border-border/70 bg-surface-2/40">
          <button
            type="button"
            onClick={() => setSymptomsOpen((o) => !o)}
            aria-expanded={symptomsOpen}
            title="Symptômes ressentis dans les heures qui suivent ce repas. Touchez pour déplier."
            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
          >
            <span className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">
                Symptômes après ce repas
              </span>
              {/* Replié : résumé des symptômes déjà saisis (s'il y en a). */}
              {!symptomsOpen &&
                activeSymptoms.map((k) => (
                  <span key={k} className="inline-flex items-center gap-1.5 text-xs text-ink">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: INTENSITY_COLOR[symptoms[k]] }} />
                    {SYMPTOM_LABELS[k]}
                  </span>
                ))}
            </span>
            <ChevronDown
              size={16}
              className={`shrink-0 text-muted transition-transform ${symptomsOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {symptomsOpen && (
            <div className="px-3 pb-3">
              <SymptomGrid symptoms={symptoms} editing onCycle={cycleSymptom} />
            </div>
          )}
        </div>
      ) : (
        activeSymptoms.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-1">
            {activeSymptoms.map((k) => {
              const dot = (
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: INTENSITY_COLOR[symptoms[k]] }} />
              );
              const title = `${SYMPTOM_LABELS[k]} — ${INTENSITY_LABEL[symptoms[k]]}`;
              if (onSymptomInfo) {
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => onSymptomInfo(k)}
                    title={`${title}\nToucher pour la fiche détaillée.`}
                    className="inline-flex items-center gap-1.5 text-xs text-ink"
                  >
                    {dot}
                    <span className="underline decoration-dotted decoration-muted underline-offset-2">
                      {SYMPTOM_LABELS[k]}
                    </span>
                  </button>
                );
              }
              return (
                <span key={k} className="inline-flex items-center gap-1.5 text-xs text-ink" title={title}>
                  {dot}
                  {SYMPTOM_LABELS[k]}
                </span>
              );
            })}
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

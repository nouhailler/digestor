import { useState } from 'react';
import { Check, ClipboardList, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { FoodCategory, MealTemplate, TemplateFood } from '../types';
import { Sheet } from './Sheet';
import { Chip } from './Chip';
import { useMealTemplates } from '../hooks/useMealTemplates';
import { deleteMealTemplate, putMealTemplate } from '../lib/db';
import { CATEGORY_COLOR, CATEGORY_CYCLE } from '../lib/constants';
import { classifyFood } from '../lib/foodClassifier';
import { uid } from '../lib/factory';

function nextCategory(c: FoodCategory): FoodCategory {
  return CATEGORY_CYCLE[(CATEGORY_CYCLE.indexOf(c) + 1) % CATEGORY_CYCLE.length];
}

export function MealTemplatesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const templates = useMealTemplates();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [foods, setFoods] = useState<TemplateFood[]>([]);
  const [draft, setDraft] = useState('');

  function reset() {
    setEditingId(null);
    setName('');
    setTime('');
    setFoods([]);
    setDraft('');
  }

  function addFood(n = draft) {
    const trimmed = n.trim();
    if (!trimmed) return;
    setFoods((f) => [...f, { name: trimmed, category: classifyFood(trimmed) }]);
    setDraft('');
  }

  function cycleFood(i: number) {
    setFoods((f) => f.map((x, j) => (j === i ? { ...x, category: nextCategory(x.category) } : x)));
  }

  function removeFood(i: number) {
    setFoods((f) => f.filter((_, j) => j !== i));
  }

  function save() {
    const n = name.trim();
    if (!n || foods.length === 0) return;
    const t: MealTemplate = {
      id: editingId ?? uid(),
      name: n,
      time: time || undefined,
      foods,
      updatedAt: new Date().toISOString(),
    };
    void putMealTemplate(t);
    reset();
  }

  function edit(t: MealTemplate) {
    setEditingId(t.id);
    setName(t.name);
    setTime(t.time ?? '');
    setFoods(t.foods);
    setDraft('');
  }

  function remove(id: string) {
    void deleteMealTemplate(id);
    if (editingId === id) reset();
  }

  return (
    <Sheet open={open} title="Modèles de repas" onClose={onClose}>
      <div className="space-y-5 text-sm">
        <p className="flex items-start gap-2 text-muted">
          <ClipboardList size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--color-leger)' }} />
          Enregistrez vos repas récurrents (« petit-déjeuner habituel »…) pour les ajouter au Journal en un
          geste. Vous pouvez aussi créer un modèle directement depuis un repas (bouton « modèle » en édition).
        </p>

        {/* Formulaire */}
        <div className="space-y-3 rounded-xl border border-border bg-surface-2 p-3">
          <div className="flex flex-wrap gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du modèle (ex. Petit-déj habituel)"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted"
            />
            <label className="flex items-center gap-1.5 text-muted">
              <span className="text-xs">heure</span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-ink [color-scheme:dark]"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {foods.map((f, i) => (
              <span key={i} className="inline-flex">
                <Chip color={CATEGORY_COLOR[f.category]} onClick={() => cycleFood(i)} title="Changer la catégorie">
                  {f.name}
                  <span
                    role="button"
                    aria-label="Retirer"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFood(i);
                    }}
                    className="-my-1 -mr-1 ml-1.5 flex cursor-pointer items-center rounded-full p-1 opacity-70 hover:opacity-100"
                  >
                    <X size={14} />
                  </span>
                </Chip>
              </span>
            ))}
            <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-1">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFood())}
                placeholder="ajouter un aliment…"
                className="w-36 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
              />
              <button type="button" onClick={() => addFood()} aria-label="Ajouter" className="text-muted hover:text-leger">
                <Plus size={15} />
              </button>
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!name.trim() || foods.length === 0}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
            >
              {editingId ? <Check size={16} /> : <Plus size={16} />}
              {editingId ? 'Enregistrer' : 'Créer le modèle'}
            </button>
            {editingId && (
              <button type="button" onClick={reset} className="rounded-lg border border-border px-3 py-2 text-muted hover:text-ink">
                Annuler
              </button>
            )}
          </div>
        </div>

        {/* Liste */}
        {templates.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-5 text-center text-muted">
            Aucun modèle enregistré.
          </p>
        ) : (
          <ul className="space-y-2">
            {templates.map((t) => (
              <li key={t.id} className="rounded-xl border border-border bg-surface px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink">{t.name}</span>
                      {t.time && <span className="text-xs text-muted">{t.time.replace(':', ' h ')}</span>}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {t.foods.map((f, i) => (
                        <Chip key={i} color={CATEGORY_COLOR[f.category]}>
                          {f.name}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button type="button" onClick={() => edit(t)} aria-label="Modifier" title="Modifier" className="text-muted hover:text-ink">
                      <Pencil size={15} />
                    </button>
                    <button type="button" onClick={() => remove(t.id)} aria-label="Supprimer" title="Supprimer" className="text-muted hover:text-severe">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Sheet>
  );
}

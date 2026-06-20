import { useState } from 'react';
import { Check, FlaskConical, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { Intensity, ReintroChallenge, ReintroDose, ReintroGroup, ReintroResult } from '../types';
import { Sheet } from './Sheet';
import { useReintroChallenges } from '../hooks/useReintroChallenges';
import { deleteReintroChallenge, putReintroChallenge } from '../lib/db';
import {
  REINTRO_GROUPS,
  REINTRO_GROUP_LABEL,
  REINTRO_RESULTS,
  REINTRO_RESULT_COLOR,
  REINTRO_RESULT_LABEL,
  sortReintro,
} from '../lib/reintro';
import { INTENSITY_COLOR, INTENSITY_CYCLE, INTENSITY_LABEL } from '../lib/constants';
import { uid } from '../lib/factory';
import { dateLabel, todayISO } from '../lib/dates';

interface FormState {
  foodName: string;
  group: ReintroGroup;
  startDate: string;
  result: ReintroResult;
  notes: string;
  doses: ReintroDose[];
}

function emptyForm(): FormState {
  return { foodName: '', group: 'fructose', startDate: todayISO(), result: 'en_cours', notes: '', doses: [] };
}

export function ReintroSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const challenges = useReintroChallenges();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [doseLabel, setDoseLabel] = useState('');
  const [doseSeverity, setDoseSeverity] = useState<Intensity>('absent');

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
    setDoseLabel('');
    setDoseSeverity('absent');
  }

  function addDose() {
    const label = doseLabel.trim();
    if (!label) return;
    set('doses', [...form.doses, { label, severity: doseSeverity }]);
    setDoseLabel('');
    setDoseSeverity('absent');
  }

  function removeDose(i: number) {
    set('doses', form.doses.filter((_, j) => j !== i));
  }

  function save() {
    const foodName = form.foodName.trim();
    if (!foodName) return;
    const c: ReintroChallenge = {
      id: editingId ?? uid(),
      foodName,
      group: form.group,
      startDate: form.startDate || todayISO(),
      result: form.result,
      doses: form.doses.length ? form.doses : undefined,
      notes: form.notes.trim() || undefined,
      endDate: form.result !== 'en_cours' ? (editById(editingId)?.endDate ?? todayISO()) : undefined,
    };
    void putReintroChallenge(c);
    resetForm();
  }

  function editById(id: string | null): ReintroChallenge | undefined {
    return id ? challenges.find((c) => c.id === id) : undefined;
  }

  function edit(c: ReintroChallenge) {
    setEditingId(c.id);
    setForm({
      foodName: c.foodName,
      group: c.group,
      startDate: c.startDate,
      result: c.result,
      notes: c.notes ?? '',
      doses: c.doses ?? [],
    });
  }

  function remove(id: string) {
    void deleteReintroChallenge(id);
    if (editingId === id) resetForm();
  }

  const sorted = sortReintro(challenges);

  return (
    <Sheet open={open} title="Réintroductions FODMAP" onClose={onClose}>
      <div className="space-y-5 text-sm">
        <p className="flex items-start gap-2 text-muted">
          <FlaskConical size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--color-leger)' }} />
          Phase de réintroduction : testez <strong className="text-ink">un aliment d'un groupe FODMAP à la fois</strong>,
          en augmentant la dose, et notez votre tolérance. Objectif : élargir votre alimentation sans relancer les symptômes.
        </p>

        {/* Formulaire */}
        <div className="space-y-3 rounded-xl border border-border bg-surface-2 p-3">
          <input
            value={form.foodName}
            onChange={(e) => set('foodName', e.target.value)}
            placeholder="Aliment testé (ex. Miel, Avocat, Lait…)"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted"
          />

          <div>
            <span className="mb-1.5 block text-xs text-muted">Groupe FODMAP testé</span>
            <div className="flex flex-wrap gap-1.5">
              {REINTRO_GROUPS.map((g) => {
                const on = form.group === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set('group', g)}
                    className="rounded-full border px-2.5 py-1 text-xs"
                    style={{
                      color: on ? 'var(--color-leger)' : 'var(--color-muted)',
                      borderColor: on ? 'var(--color-leger)' : 'var(--color-border)',
                      backgroundColor: on ? 'rgba(95,191,111,0.12)' : 'transparent',
                    }}
                  >
                    {REINTRO_GROUP_LABEL[g]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-xs text-muted">Verdict</span>
            <div className="flex flex-wrap gap-1.5">
              {REINTRO_RESULTS.map((r) => {
                const on = form.result === r;
                const color = REINTRO_RESULT_COLOR[r];
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set('result', r)}
                    className="rounded-full border px-2.5 py-1 text-xs"
                    style={{
                      color: on ? color : 'var(--color-muted)',
                      borderColor: on ? color : 'var(--color-border)',
                      backgroundColor: on ? `color-mix(in srgb, ${color} 14%, transparent)` : 'transparent',
                    }}
                  >
                    {REINTRO_RESULT_LABEL[r]}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block text-muted">
            <span className="mb-1 block text-xs">Date de début</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => set('startDate', e.target.value)}
              className="rounded-lg border border-border bg-surface px-2 py-1.5 text-ink [color-scheme:dark]"
            />
          </label>

          {/* Journal des doses */}
          <div>
            <span className="mb-1.5 block text-xs text-muted">Étapes de dose & réaction</span>
            {form.doses.length > 0 && (
              <ul className="mb-2 space-y-1">
                {form.doses.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-lg bg-surface px-2.5 py-1.5">
                    <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: INTENSITY_COLOR[d.severity] }} />
                    <span className="min-w-0 flex-1 truncate text-ink">{d.label}</span>
                    <span className="shrink-0 text-xs text-muted">{INTENSITY_LABEL[d.severity]}</span>
                    <button type="button" onClick={() => removeDose(i)} aria-label="Retirer l'étape" className="shrink-0 text-muted hover:text-severe">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center gap-2">
              <input
                value={doseLabel}
                onChange={(e) => setDoseLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDose())}
                placeholder="ex. Jour 1 : ¼ d'avocat"
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted"
              />
              <button
                type="button"
                onClick={() => setDoseSeverity((s) => INTENSITY_CYCLE[(INTENSITY_CYCLE.indexOf(s) + 1) % INTENSITY_CYCLE.length])}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-2 text-xs"
                title="Réaction observée — touchez pour changer"
              >
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: INTENSITY_COLOR[doseSeverity] }} />
                {INTENSITY_LABEL[doseSeverity]}
              </button>
              <button type="button" onClick={addDose} aria-label="Ajouter l'étape" className="shrink-0 text-muted hover:text-leger">
                <Plus size={18} />
              </button>
            </div>
          </div>

          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
            placeholder="Notes (seuil de tolérance, contexte…)"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!form.foodName.trim()}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
            >
              {editingId ? <Check size={16} /> : <Plus size={16} />}
              {editingId ? 'Enregistrer' : 'Ajouter le test'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-lg border border-border px-3 py-2 text-muted hover:text-ink">
                Annuler
              </button>
            )}
          </div>
        </div>

        {/* Liste */}
        {sorted.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-5 text-center text-muted">
            Aucun test de réintroduction enregistré.
          </p>
        ) : (
          <ul className="space-y-2">
            {sorted.map((c) => (
              <li key={c.id} className="rounded-xl border border-border bg-surface px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">{c.foodName}</span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                        {REINTRO_GROUP_LABEL[c.group]}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{ color: REINTRO_RESULT_COLOR[c.result], border: `1px solid ${REINTRO_RESULT_COLOR[c.result]}` }}
                      >
                        {REINTRO_RESULT_LABEL[c.result]}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      Débuté le {dateLabel(c.startDate)}
                      {c.doses?.length ? ` · ${c.doses.length} étape${c.doses.length > 1 ? 's' : ''}` : ''}
                    </p>
                    {c.doses?.length ? (
                      <ul className="mt-1 space-y-0.5">
                        {c.doses.map((d, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs text-ink">
                            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: INTENSITY_COLOR[d.severity] }} />
                            {d.label} <span className="text-muted">({INTENSITY_LABEL[d.severity].toLowerCase()})</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {c.notes && <p className="mt-0.5 text-xs text-ink">{c.notes}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button type="button" onClick={() => edit(c)} aria-label="Modifier" title="Modifier" className="text-muted hover:text-ink">
                      <Pencil size={15} />
                    </button>
                    <button type="button" onClick={() => remove(c.id)} aria-label="Supprimer" title="Supprimer" className="text-muted hover:text-severe">
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

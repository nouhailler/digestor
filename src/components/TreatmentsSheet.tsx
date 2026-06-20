import { useState } from 'react';
import { Check, CircleStop, Pencil, Pill, Plus, Trash2 } from 'lucide-react';
import type { Treatment, TreatmentKind } from '../types';
import { Sheet } from './Sheet';
import { useTreatments } from '../hooks/useTreatments';
import { deleteTreatment, putTreatment } from '../lib/db';
import { TREATMENT_KINDS, TREATMENT_KIND_LABEL, isTreatmentActive, sortTreatments } from '../lib/treatments';
import { uid } from '../lib/factory';
import { dateLabel, todayISO } from '../lib/dates';

interface FormState {
  name: string;
  kind: TreatmentKind;
  dose: string;
  frequency: string;
  startDate: string;
  endDate: string;
  notes: string;
}

function emptyForm(): FormState {
  return { name: '', kind: 'complement', dose: '', frequency: '', startDate: todayISO(), endDate: '', notes: '' };
}

export function TreatmentsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const treatments = useTreatments();
  const today = todayISO();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
  }

  function save() {
    const name = form.name.trim();
    if (!name) return;
    const t: Treatment = {
      id: editingId ?? uid(),
      name,
      kind: form.kind,
      dose: form.dose.trim() || undefined,
      frequency: form.frequency.trim() || undefined,
      startDate: form.startDate || today,
      endDate: form.endDate || undefined,
      notes: form.notes.trim() || undefined,
    };
    void putTreatment(t);
    resetForm();
  }

  function edit(t: Treatment) {
    setEditingId(t.id);
    setForm({
      name: t.name,
      kind: t.kind,
      dose: t.dose ?? '',
      frequency: t.frequency ?? '',
      startDate: t.startDate,
      endDate: t.endDate ?? '',
      notes: t.notes ?? '',
    });
  }

  function stop(t: Treatment) {
    void putTreatment({ ...t, endDate: today });
    if (editingId === t.id) resetForm();
  }

  function remove(id: string) {
    void deleteTreatment(id);
    if (editingId === id) resetForm();
  }

  const sorted = sortTreatments(treatments, today);

  return (
    <Sheet open={open} title="Traitements & compléments" onClose={onClose}>
      <div className="space-y-5 text-sm">
        <p className="flex items-start gap-2 text-muted">
          <Pill size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--color-leger)' }} />
          Suivez vos cures (antifongiques, antibiotiques, probiotiques, phytothérapie…) avec leurs dates :
          utile pour relier un traitement à l'évolution des symptômes et l'inclure dans le dossier médical.
        </p>

        {/* Formulaire ajout / édition */}
        <div className="space-y-3 rounded-xl border border-border bg-surface-2 p-3">
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Nom (ex. Nystatine, Berbérine, L. rhamnosus…)"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted"
          />

          <div className="flex flex-wrap gap-1.5">
            {TREATMENT_KINDS.map((k) => {
              const on = form.kind === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => set('kind', k)}
                  className="rounded-full border px-2.5 py-1 text-xs"
                  style={{
                    color: on ? 'var(--color-leger)' : 'var(--color-muted)',
                    borderColor: on ? 'var(--color-leger)' : 'var(--color-border)',
                    backgroundColor: on ? 'rgba(95,191,111,0.12)' : 'transparent',
                  }}
                >
                  {TREATMENT_KIND_LABEL[k]}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              value={form.dose}
              onChange={(e) => set('dose', e.target.value)}
              placeholder="Dose (ex. 500 mg)"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted"
            />
            <input
              value={form.frequency}
              onChange={(e) => set('frequency', e.target.value)}
              placeholder="Fréquence (ex. 2× / jour)"
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="text-muted">
              <span className="mb-1 block text-xs">Début</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-ink [color-scheme:dark]"
              />
            </label>
            <label className="text-muted">
              <span className="mb-1 block text-xs">Fin (vide = en cours)</span>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-ink [color-scheme:dark]"
              />
            </label>
          </div>

          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
            placeholder="Notes (objectif, effets ressentis…)"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink placeholder:text-muted"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!form.name.trim()}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
            >
              {editingId ? <Check size={16} /> : <Plus size={16} />}
              {editingId ? 'Enregistrer' : 'Ajouter'}
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
            Aucun traitement enregistré.
          </p>
        ) : (
          <ul className="space-y-2">
            {sorted.map((t) => {
              const active = isTreatmentActive(t, today);
              return (
                <li key={t.id} className="rounded-xl border border-border bg-surface px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-ink">{t.name}</span>
                        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                          {TREATMENT_KIND_LABEL[t.kind]}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs"
                          style={{
                            color: active ? 'var(--color-leger)' : 'var(--color-absent)',
                            border: `1px solid ${active ? 'var(--color-leger)' : 'var(--color-border)'}`,
                          }}
                        >
                          {active ? 'En cours' : 'Terminé'}
                        </span>
                      </div>
                      <p className="text-xs text-muted">
                        {[t.dose, t.frequency].filter(Boolean).join(' · ')}
                        {(t.dose || t.frequency) && ' — '}
                        {dateLabel(t.startDate)}
                        {t.endDate ? ` → ${dateLabel(t.endDate)}` : ' → en cours'}
                      </p>
                      {t.notes && <p className="mt-0.5 text-xs text-ink">{t.notes}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {active && (
                        <button type="button" onClick={() => stop(t)} aria-label="Marquer terminé aujourd'hui" title="Marquer terminé aujourd'hui" className="text-muted hover:text-modere">
                          <CircleStop size={16} />
                        </button>
                      )}
                      <button type="button" onClick={() => edit(t)} aria-label="Modifier" title="Modifier" className="text-muted hover:text-ink">
                        <Pencil size={15} />
                      </button>
                      <button type="button" onClick={() => remove(t.id)} aria-label="Supprimer" title="Supprimer" className="text-muted hover:text-severe">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Sheet>
  );
}

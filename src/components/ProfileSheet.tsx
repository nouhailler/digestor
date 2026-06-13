import { useEffect, useState } from 'react';
import { Check, Sparkles, User } from 'lucide-react';
import type { FodmapPhase, Profile, Sex } from '../types';
import { Sheet } from './Sheet';
import { MultiChipSelect } from './MultiChipSelect';
import { useProfile } from '../hooks/useProfile';
import {
  ALLERGY_OPTIONS,
  CONDITION_OPTIONS,
  FODMAP_PHASES,
  FODMAP_PHASE_LABEL,
  INTOLERANCE_OPTIONS,
  SEX_LABEL,
} from '../lib/profile';

const EMPTY: Profile = {
  patientName: 'exemple',
  conditions: [],
  fodmapPhase: 'aucune',
  intolerances: [],
  allergies: [],
  avoidedFoods: [],
  medicalHistory: '',
  medications: '',
  notes: '',
};

const SEXES: Sex[] = ['femme', 'homme', 'autre'];

export function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, save } = useProfile();
  const [form, setForm] = useState<Profile>(EMPTY);
  const [savedFlash, setSavedFlash] = useState(false);

  // Charge le profil dans le formulaire à l'ouverture.
  useEffect(() => {
    if (open && profile) setForm({ ...EMPTY, ...profile });
  }, [open, profile]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function handleSave() {
    save({ ...form, patientName: form.patientName.trim() || 'exemple' });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
    onClose();
  }

  return (
    <Sheet open={open} title="Profil santé" onClose={onClose}>
      <div className="space-y-5 text-sm">
        <p className="flex items-start gap-2 text-muted">
          <Sparkles size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--color-leger)' }} />
          Ces informations restent sur l'appareil et affinent les analyses d'aliments de l'IA
          (allergies signalées, intolérances et conditions prises en compte).
        </p>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-muted">
            <User size={15} /> Nom du patient
          </span>
          <input
            value={form.patientName}
            onChange={(e) => set('patientName', e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-ink"
          />
        </label>

        <div className="flex flex-wrap gap-4">
          <label className="block" title="Facultatif. Aide l'IA à contextualiser l'analyse (besoins, tolérance selon l'âge).">
            <span className="mb-1.5 block text-muted">Âge (facultatif)</span>
            <input
              type="number"
              min={0}
              max={120}
              value={form.age ?? ''}
              onChange={(e) => set('age', e.target.value === '' ? undefined : Number(e.target.value))}
              placeholder="ex. 35"
              className="w-28 rounded-lg border border-border bg-surface-2 px-3 py-2 text-ink placeholder:text-muted [color-scheme:dark]"
            />
          </label>

          <div title="Facultatif. Certains troubles digestifs varient selon le sexe ; n'est utilisé que pour affiner l'analyse.">
            <span className="mb-1.5 block text-muted">Sexe (facultatif)</span>
            <div className="flex flex-wrap gap-2">
              {SEXES.map((s) => {
                const on = form.sex === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set('sex', on ? undefined : s)}
                    className="rounded-full border px-3 py-1.5 text-sm"
                    style={{
                      color: on ? 'var(--color-leger)' : 'var(--color-muted)',
                      borderColor: on ? 'var(--color-leger)' : 'var(--color-border)',
                      backgroundColor: on ? 'rgba(95,191,111,0.12)' : 'transparent',
                    }}
                  >
                    {SEX_LABEL[s]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <MultiChipSelect
          label="Conditions / diagnostics"
          options={CONDITION_OPTIONS}
          selected={form.conditions ?? []}
          onChange={(v) => set('conditions', v)}
          color="var(--color-modere)"
        />

        <div>
          <span className="mb-2 block text-muted">Phase FODMAP</span>
          <div className="flex flex-wrap gap-2">
            {FODMAP_PHASES.map((p) => {
              const on = (form.fodmapPhase ?? 'aucune') === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('fodmapPhase', p as FodmapPhase)}
                  className="rounded-full border px-3 py-1.5 text-sm"
                  style={{
                    color: on ? 'var(--color-leger)' : 'var(--color-muted)',
                    borderColor: on ? 'var(--color-leger)' : 'var(--color-border)',
                    backgroundColor: on ? 'rgba(95,191,111,0.12)' : 'transparent',
                  }}
                >
                  {FODMAP_PHASE_LABEL[p]}
                </button>
              );
            })}
          </div>
        </div>

        <MultiChipSelect
          label="Intolérances"
          options={INTOLERANCE_OPTIONS}
          selected={form.intolerances ?? []}
          onChange={(v) => set('intolerances', v)}
          color="var(--color-modere)"
        />

        <MultiChipSelect
          label="Allergies"
          options={ALLERGY_OPTIONS}
          selected={form.allergies ?? []}
          onChange={(v) => set('allergies', v)}
          color="var(--color-severe)"
        />

        <MultiChipSelect
          label="Aliments à éviter"
          options={[]}
          selected={form.avoidedFoods ?? []}
          onChange={(v) => set('avoidedFoods', v)}
          color="var(--color-severe)"
          placeholder="ex. oignon"
        />

        <label
          className="block"
          title="Facultatif. Pathologies, chirurgies digestives, diagnostics passés… pris en compte par l'IA."
        >
          <span className="mb-1.5 block text-muted">Antécédents médicaux (facultatif)</span>
          <textarea
            value={form.medicalHistory ?? ''}
            onChange={(e) => set('medicalHistory', e.target.value)}
            rows={2}
            placeholder="ex. gastrite, ablation vésicule biliaire…"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-ink placeholder:text-muted"
          />
        </label>

        <label
          className="block"
          title="Facultatif. Indiquez les médicaments pris (certains influent sur la digestion et le microbiote)."
        >
          <span className="mb-1.5 block text-muted">Médicaments pris — lesquels (facultatif)</span>
          <textarea
            value={form.medications ?? ''}
            onChange={(e) => set('medications', e.target.value)}
            rows={2}
            placeholder="ex. IPP (oméprazole), antibiotique récent, probiotiques…"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-ink placeholder:text-muted"
          />
        </label>

        <label className="block" title="Facultatif. Tout autre contexte utile à l'analyse.">
          <span className="mb-1.5 block text-muted">Notes santé (facultatif)</span>
          <textarea
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
            placeholder="Contexte utile pour l'analyse…"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-ink placeholder:text-muted"
          />
        </label>

        <button
          type="button"
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium"
          style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
        >
          {savedFlash ? <Check size={16} /> : null}
          Enregistrer le profil
        </button>
      </div>
    </Sheet>
  );
}

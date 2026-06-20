import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Printer, Stethoscope, X } from 'lucide-react';
import type { CorrelationLevel } from '../lib/correlations';
import type { RecordFood, RecordSymptom } from '../lib/medicalRecord';
import { buildMedicalRecord } from '../lib/medicalRecord';
import { getAllDays } from '../lib/db';
import { useFoodInsightMap } from '../hooks/useFoodInsightMap';
import { useProfile } from '../hooks/useProfile';
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  HYDRATION_TARGET_L,
  INTENSITY_COLOR,
  INTENSITY_LABEL,
} from '../lib/constants';
import { FODMAP_PHASE_LABEL, SEX_LABEL } from '../lib/profile';
import { dateLabel, dayLongLabel } from '../lib/dates';

const CORRELATION_COLOR: Record<CorrelationLevel, string> = {
  defavorable: 'var(--color-severe)',
  surveiller: 'var(--color-modere)',
  favorable: 'var(--color-leger)',
  neutre: 'var(--color-absent)',
};

function joinList(arr?: string[]): string {
  return (arr ?? []).map((s) => s.trim()).filter(Boolean).join(', ');
}

/**
 * Dossier médical : synthèse complète de toutes les données du journal, à imprimer
 * ou enregistrer en PDF pour la remettre à un médecin. Plein écran (hors Sheet) car
 * l'impression cible spécifiquement `#dossier` (cf. règles d'impression du CSS).
 */
export function MedicalRecordSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const days = useLiveQuery(() => getAllDays(), []);
  const insights = useFoodInsightMap();
  const { profile } = useProfile();
  const record = useMemo(() => buildMedicalRecord(days ?? [], profile, insights), [days, profile, insights]);

  if (!open) return null;

  function handlePrint() {
    document.body.classList.add('printing-dossier');
    const cleanup = () => {
      document.body.classList.remove('printing-dossier');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  }

  const { period, profile: p } = record;
  const empty = period.recordedDays === 0;
  const profileEmpty =
    !(typeof p.age === 'number' && p.age > 0) &&
    !p.sex &&
    !joinList(p.conditions) &&
    (!p.fodmapPhase || p.fodmapPhase === 'aucune') &&
    !joinList(p.intolerances) &&
    !joinList(p.allergies) &&
    !joinList(p.avoidedFoods) &&
    !p.medicalHistory?.trim() &&
    !p.medications?.trim() &&
    !p.notes?.trim();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg">
      {/* Barre d'actions (non imprimée) */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
          <Stethoscope size={18} style={{ color: 'var(--color-leger)' }} /> Dossier médical
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            disabled={empty}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
          >
            <Printer size={15} /> Imprimer / PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full border border-border p-1.5 text-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div id="dossier" className="mx-auto max-w-3xl px-5 py-6 text-sm leading-relaxed text-ink">
        {/* En-tête du document */}
        <header className="mb-6 border-b border-border pb-4">
          <h1 className="text-xl font-bold text-ink">Dossier de suivi digestif</h1>
          <p className="text-muted">
            Patient : <span className="text-ink">{p.patientName || '—'}</span>
          </p>
          <p className="text-xs text-muted">
            Généré le {dateLabel(record.generatedAt)}
            {period.from && period.to && (
              <>
                {' · '}Période : du {dateLabel(period.from)} au {dateLabel(period.to)} ({period.recordedDays} jour
                {period.recordedDays > 1 ? 's' : ''} renseigné{period.recordedDays > 1 ? 's' : ''} sur {period.spanDays})
              </>
            )}
          </p>
        </header>

        {empty ? (
          <p className="rounded-xl border border-border bg-surface p-6 text-center text-muted">
            Aucune donnée enregistrée pour l'instant. Renseignez des repas et des symptômes dans le Journal,
            puis revenez générer le dossier.
          </p>
        ) : (
          <div className="space-y-7">
            {/* 1. Profil santé */}
            <Section title="Profil santé">
              {profileEmpty && (
                <p className="text-muted">Profil santé non renseigné (à compléter dans le menu ⋯ → Profil santé).</p>
              )}
              <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                <Field label="Âge" value={typeof p.age === 'number' && p.age > 0 ? `${p.age} ans` : ''} />
                <Field label="Sexe" value={p.sex ? SEX_LABEL[p.sex] : ''} />
                <Field label="Conditions" value={joinList(p.conditions)} wide />
                <Field
                  label="Phase FODMAP"
                  value={p.fodmapPhase && p.fodmapPhase !== 'aucune' ? FODMAP_PHASE_LABEL[p.fodmapPhase] : ''}
                />
                <Field label="Intolérances" value={joinList(p.intolerances)} />
                <Field label="Allergies" value={joinList(p.allergies)} />
                <Field label="Aliments évités" value={joinList(p.avoidedFoods)} wide />
                <Field label="Antécédents médicaux" value={p.medicalHistory?.trim() ?? ''} wide />
                <Field label="Médicaments" value={p.medications?.trim() ?? ''} wide />
                <Field label="Notes" value={p.notes?.trim() ?? ''} wide />
              </dl>
            </Section>

            {/* 2. Synthèse des symptômes */}
            <Section title="Synthèse des symptômes">
              {record.symptomStats.length === 0 ? (
                <p className="text-muted">Aucun symptôme renseigné sur la période.</p>
              ) : (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                      <th className="py-1.5 pr-2 font-medium">Symptôme</th>
                      <th className="py-1.5 px-2 font-medium">Jours présents</th>
                      <th className="py-1.5 px-2 font-medium">Dont sévères</th>
                      <th className="py-1.5 pl-2 font-medium">Intensité max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.symptomStats.map((s) => (
                      <tr key={s.key} className="border-b border-border/60">
                        <td className="py-1.5 pr-2 text-ink">{s.label}</td>
                        <td className="py-1.5 px-2 text-ink">
                          {s.daysPresent}/{period.recordedDays}
                        </td>
                        <td className="py-1.5 px-2 text-ink">{s.daysSevere}</td>
                        <td className="py-1.5 pl-2">
                          <Dot color={INTENSITY_COLOR[s.maxIntensity]} /> {INTENSITY_LABEL[s.maxIntensity]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Section>

            {/* 3. Transit & hydratation */}
            <Section title="Transit & hydratation">
              <ul className="space-y-1.5">
                <li>
                  Hydratation moyenne :{' '}
                  <strong className="text-ink">
                    {record.avgHydrationL != null ? `${record.avgHydrationL.toFixed(1)} L/j` : 'non renseignée'}
                  </strong>
                  {record.avgHydrationL != null && (
                    <span className="text-muted"> (cible {HYDRATION_TARGET_L} L)</span>
                  )}
                </li>
                <li>
                  Jours avec selle renseignée : <strong className="text-ink">{record.stoolDays}</strong>
                </li>
                {record.bristol.length > 0 && (
                  <li>
                    Répartition (échelle de Bristol) :
                    <ul className="mt-1 ml-4 list-disc space-y-0.5 text-muted">
                      {record.bristol.map((b) => (
                        <li key={b.type}>
                          <span className="text-ink">{b.label}</span> — {b.count} jour{b.count > 1 ? 's' : ''}
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
            </Section>

            {/* 4. Aliments */}
            <Section title="Aliments les plus fréquents">
              {record.topFoods.length === 0 ? (
                <p className="text-muted">Aucun aliment renseigné.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {record.topFoods.map((f) => (
                      <FoodLine key={f.name} food={f} />
                    ))}
                  </div>
                  {record.proFoods.length > 0 && (
                    <p className="mt-3 text-muted">
                      <strong style={{ color: 'var(--color-severe)' }}>Aliments défavorables fréquents</strong>{' '}
                      (pro-candidose / pro-SIBO) : {record.proFoods.map((f) => `${f.name} (×${f.count})`).join(', ')}.
                    </p>
                  )}
                </>
              )}
            </Section>

            {/* 5. Corrélations repérées */}
            <Section title="Corrélations repérées">
              {record.correlations.length === 0 ? (
                <p className="text-muted">
                  Pas encore assez de données pour dégager des corrélations fiables (détection conservatrice).
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {record.correlations.map((c) => (
                    <li key={c.text} className="flex items-start gap-2">
                      <Dot color={CORRELATION_COLOR[c.level]} />
                      <span className="text-ink">{c.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            {/* 6. Journal détaillé */}
            <Section title="Journal détaillé">
              <div className="space-y-4">
                {record.days.map((d) => (
                  <article key={d.date} className="break-inside-avoid rounded-lg border border-border p-3">
                    <h4 className="mb-1.5 font-semibold text-ink">{dayLongLabel(d.date)}</h4>
                    {d.meals.length === 0 && d.generalSymptoms.length === 0 ? (
                      <p className="text-muted">—</p>
                    ) : (
                      <div className="space-y-1.5">
                        {d.meals.map((m, i) => (
                          <div key={i}>
                            <span className="text-muted">{formatTime(m.time)} — </span>
                            {m.foods.length > 0 ? (
                              <span className="inline-flex flex-wrap gap-x-2">
                                {m.foods.map((f, j) => (
                                  <span key={j}>
                                    <Dot color={CATEGORY_COLOR[f.category]} />
                                    {f.quantity ? `${f.quantity} ` : ''}
                                    {f.name}
                                    {j < m.foods.length - 1 ? ',' : ''}
                                  </span>
                                ))}
                              </span>
                            ) : (
                              <span className="text-muted">(aucun aliment)</span>
                            )}
                            {m.symptoms.length > 0 && (
                              <span className="text-muted"> → {m.symptoms.map(symText).join(', ')}</span>
                            )}
                          </div>
                        ))}
                        {d.generalSymptoms.length > 0 && (
                          <p>
                            <span className="text-muted">Symptômes{d.symptomTiming ? ` (${d.symptomTiming})` : ''} : </span>
                            {d.generalSymptoms.map(symText).join(', ')}
                          </p>
                        )}
                        {(typeof d.hydrationL === 'number' || d.stool || typeof d.digestionDelayH === 'number') && (
                          <p className="text-muted">
                            {typeof d.hydrationL === 'number' && `Hydratation : ${d.hydrationL} L. `}
                            {d.stool && stoolText(d.stool)}
                            {typeof d.digestionDelayH === 'number' && `Délai digestion : ~${d.digestionDelayH} h.`}
                          </p>
                        )}
                        {d.notes?.trim() && (
                          <p>
                            <span className="text-muted">Notes : </span>
                            {d.notes.trim()}
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </Section>

            <footer className="border-t border-border pt-4 text-xs text-muted">
              Document généré par Digestor à partir de données d'auto-suivi. Outil de repérage de tendances,{' '}
              <strong className="text-ink">pas un dispositif de diagnostic</strong>. Le SIBO se confirme par test
              respiratoire, le SII par critères cliniques (Rome IV). À interpréter par un médecin / gastro-entérologue.
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid">
      <h3 className="mb-2 border-b border-border pb-1 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-leger)' }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  if (!value) return null;
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="inline text-muted">{label} : </dt>
      <dd className="inline text-ink">{value}</dd>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span className="mr-1 inline-block h-2 w-2 rounded-full align-middle" style={{ backgroundColor: color }} />;
}

function FoodLine({ food }: { food: RecordFood & { count?: number } }) {
  const count = (food as { count?: number }).count;
  return (
    <span className="inline-flex items-center" title={CATEGORY_LABEL[food.category]}>
      <Dot color={CATEGORY_COLOR[food.category]} />
      <span className="text-ink">{food.name}</span>
      {typeof count === 'number' && <span className="text-muted">&nbsp;×{count}</span>}
    </span>
  );
}

function symText(s: RecordSymptom): string {
  return `${s.label} (${INTENSITY_LABEL[s.intensity].toLowerCase()})`;
}

function stoolText(stool: { bristol?: number; count?: number; label?: string }): string {
  const parts: string[] = [];
  if (typeof stool.count === 'number') parts.push(`${stool.count} selle${stool.count > 1 ? 's' : ''}`);
  if (stool.label) parts.push(stool.label);
  else if (typeof stool.bristol === 'number') parts.push(`Bristol type ${stool.bristol}`);
  return parts.length ? `${parts.join(', ')}. ` : '';
}

function formatTime(t: string): string {
  const [h, m] = t.split(':');
  return `${Number(h)} h ${m}`;
}

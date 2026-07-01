import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Printer, Stethoscope, X } from 'lucide-react';
import type { RecordFood, RecordSymptom } from '../lib/medicalRecord';
import { buildMedicalRecord } from '../lib/medicalRecord';
import { getAllDays } from '../lib/db';
import { useFoodInsightMap } from '../hooks/useFoodInsightMap';
import { useProfile } from '../hooks/useProfile';
import { useTreatments } from '../hooks/useTreatments';
import { useReintroChallenges } from '../hooks/useReintroChallenges';
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  HYDRATION_TARGET_L,
  INTENSITY_COLOR,
  INTENSITY_LABEL,
} from '../lib/constants';
import { FODMAP_PHASE_LABEL, SEX_LABEL } from '../lib/profile';
import { TREATMENT_KIND_LABEL, isTreatmentActive } from '../lib/treatments';
import { REINTRO_GROUP_LABEL, REINTRO_RESULT_COLOR, REINTRO_RESULT_LABEL } from '../lib/reintro';
import { dateLabel, dayLongLabel, todayISO } from '../lib/dates';

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
  const treatments = useTreatments();
  const reintro = useReintroChallenges();
  const record = useMemo(
    () => buildMedicalRecord(days ?? [], profile, insights, treatments, reintro),
    [days, profile, insights, treatments, reintro],
  );

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

            {/* 1b. Traitements & compléments */}
            {record.treatments.length > 0 && (
              <Section title="Traitements & compléments">
                <ul className="space-y-1.5">
                  {record.treatments.map((t) => (
                    <li key={t.id} className="flex items-start gap-2">
                      <Dot color={isTreatmentActive(t, todayISO()) ? 'var(--color-leger)' : 'var(--color-absent)'} />
                      <span>
                        <strong className="text-ink">{t.name}</strong>{' '}
                        <span className="text-muted">({TREATMENT_KIND_LABEL[t.kind]})</span>
                        {(t.dose || t.frequency) && (
                          <span className="text-muted"> — {[t.dose, t.frequency].filter(Boolean).join(' · ')}</span>
                        )}
                        <span className="text-muted">
                          {' · '}
                          {dateLabel(t.startDate)}
                          {t.endDate ? ` → ${dateLabel(t.endDate)}` : ' → en cours'}
                        </span>
                        {t.notes && <span className="text-muted"> — {t.notes}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* 1c. Réintroductions FODMAP */}
            {record.reintro.length > 0 && (
              <Section title="Réintroductions FODMAP">
                <ul className="space-y-2">
                  {record.reintro.map((c) => (
                    <li key={c.id}>
                      <p>
                        <strong className="text-ink">{c.foodName}</strong>{' '}
                        <span className="text-muted">({REINTRO_GROUP_LABEL[c.group]})</span>{' '}
                        <span style={{ color: REINTRO_RESULT_COLOR[c.result] }}>— {REINTRO_RESULT_LABEL[c.result]}</span>
                        <span className="text-muted"> · débuté le {dateLabel(c.startDate)}</span>
                      </p>
                      {c.doses?.length ? (
                        <ul className="ml-4 list-disc text-muted">
                          {c.doses.map((d, i) => (
                            <li key={i}>
                              <span className="text-ink">{d.label}</span> ({INTENSITY_LABEL[d.severity].toLowerCase()})
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {c.notes && <p className="text-muted">{c.notes}</p>}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

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

            {/* 5. Corrélations personnalisées (données réelles) */}
            <Section title="Corrélations personnalisées (vos données)">
              {!record.personal.enoughData ? (
                <p className="text-muted">
                  Pas encore assez de jours renseignés ({record.personal.analyzedDays}) pour une analyse fiable.
                </p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-ink">Déclencheurs suspectés</p>
                    {record.personal.triggers.length === 0 ? (
                      <p className="text-muted">
                        Aucun déclencheur net détecté sur {record.personal.analyzedFoods} aliment
                        {record.personal.analyzedFoods > 1 ? 's' : ''} assez fréquent
                        {record.personal.analyzedFoods > 1 ? 's' : ''}.
                      </p>
                    ) : (
                      <ul className="mt-1 space-y-1">
                        {record.personal.triggers.map((t, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Dot color="var(--color-severe)" />
                            <span>
                              <strong className="text-ink">{t.food}</strong> → {t.symptomLabel} :{' '}
                              <span className="text-ink">{Math.round(t.rateWith * 100)} %</span> des jours avec (
                              {t.daysSymptomWithFood}/{t.daysWithFood}){' '}
                              <span className="text-muted">vs {Math.round(t.rateWithout * 100)} % sans</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {record.personal.safeFoods.length > 0 && (
                    <div>
                      <p className="font-medium text-ink">Aliments fréquents bien tolérés</p>
                      <p className="text-muted">
                        {record.personal.safeFoods.map((f) => `${f.food} (${f.daysEaten} j)`).join(', ')}.
                      </p>
                    </div>
                  )}
                  {record.context.links.length > 0 && (
                    <div>
                      <p className="font-medium text-ink">Facteurs contextuels</p>
                      <ul className="mt-1 space-y-1">
                        {record.context.links.map((l, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Dot color="var(--color-modere)" />
                            <span>
                              <strong className="text-ink">{l.label}</strong> →{' '}
                              <span className="text-ink">{Math.round(l.rateWith * 100)} %</span> de jours à symptômes{' '}
                              <span className="text-muted">vs {Math.round(l.rateWithout * 100)} % sinon</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-muted">
                    Détection conservatrice sur {record.personal.analyzedDays} jours (association le même jour) —
                    à confirmer médicalement, ce ne sont pas des certitudes.
                  </p>
                </div>
              )}
            </Section>

            {/* 5c. Amines biogènes (histamine) */}
            <Section title="Amines biogènes (histamine)">
              <div className="space-y-3">
                {!record.amine.enoughData ? (
                  <p className="text-muted">
                    Pas encore assez de jours renseignés ({record.amine.analyzedDays}) pour évaluer le lien
                    entre charge en amines et symptômes histaminiques.
                  </p>
                ) : record.amine.suspected ? (
                  <p className="flex items-start gap-2">
                    <Dot color="var(--color-severe)" />
                    <span>
                      <strong className="text-ink">Charge élevée en amines</strong> →{' '}
                      <span className="text-ink">{Math.round(record.amine.rateWithHigh * 100)} %</span> de jours à
                      symptômes histaminiques (urticaire, rougeurs, maux de tête…){' '}
                      <span className="text-muted">
                        vs {Math.round(record.amine.rateWithoutHigh * 100)} % sinon · sur{' '}
                        {record.amine.daysHighLoad} jour(s) chargés
                      </span>
                    </span>
                  </p>
                ) : (
                  <p className="text-muted">
                    Pas de lien net détecté entre charge en amines et symptômes histaminiques sur{' '}
                    {record.amine.analyzedDays} jours.
                  </p>
                )}

                {record.amineHighDays.length > 0 && (
                  <div>
                    <p className="font-medium text-ink">Jours à charge élevée en amines</p>
                    <ul className="mt-1 space-y-1">
                      {record.amineHighDays.map((d) => (
                        <li key={d.date} className="flex items-start gap-2">
                          <Dot color="var(--color-modere)" />
                          <span>
                            <strong className="text-ink">{dayLongLabel(d.date)}</strong>
                            {d.triggers.length > 0 && <span className="text-muted"> — {d.triggers.join(', ')}</span>}
                            {d.combo && <span className="text-severe"> · combinaison à risque</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-muted">
                  La teneur en amines varie selon fraîcheur et affinage : c'est un repère de risque, pas une
                  mesure. Détection conservatrice (association le même jour), à confirmer médicalement.
                </p>
              </div>
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
                        {((d.stress && d.stress !== 'absent') || typeof d.sleepH === 'number' || d.menstrual) && (
                          <p className="text-muted">
                            {d.stress && d.stress !== 'absent' && `Stress : ${INTENSITY_LABEL[d.stress].toLowerCase()}. `}
                            {typeof d.sleepH === 'number' && `Sommeil : ${d.sleepH} h. `}
                            {d.menstrual && 'Règles. '}
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

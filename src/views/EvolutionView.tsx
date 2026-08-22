import { useState } from 'react';
import { addDays } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend as ReLegend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { db, getLatestActiveDate } from '../lib/db';
import { emptyDay } from '../lib/factory';
import {
  amineLoadByDay,
  categoryCountsByDay,
  mealSymptomPoints,
  severityByDay,
  stoolBand,
  stoolByDay,
  topSymptoms,
  type MealSymptomPoint,
  type StoolBand,
} from '../lib/aggregates';
import { AMINE_LOAD_LABEL, amineBadge, type AmineLoadBand } from '../lib/biogenicAmines';
import { foodRecurrence, RECURRENCE_WINDOW_DAYS, type FoodRecurrenceRow } from '../lib/foodRecurrence';
import { CATEGORY_COLOR, CATEGORY_LABEL } from '../lib/constants';
import { aggregateImprovements, aggregateTriggers } from '../lib/dayAnalysisAggregate';
import { mealCorrelations } from '../lib/mealCorrelations';
import { CHECKPOINT_SHORT } from '../lib/satiety';
import {
  averageCurve,
  bucketByCategory,
  bucketByFodmap,
  collectSatietyMeals,
  MIN_SATIETY_MEALS,
  overallAverages,
} from '../lib/satietyCorrelation';
import { dayMonthLabel, dayShortLabel, fromISODate, toISODate } from '../lib/dates';
import { dayHasContent } from '../lib/aggregates';
import { TipBanner } from '../components/TipBanner';
import { PeriodReportSheet } from '../components/ai/PeriodReportSheet';
import { useFoodInsightMap } from '../hooks/useFoodInsightMap';
import { useTheme } from '../hooks/useTheme';
import { Sparkles } from 'lucide-react';

type Range = 'week' | '4weeks' | 'all';

const RANGE_LABEL: Record<Range, string> = { week: 'Semaine', '4weeks': '4 semaines', all: 'Tout' };

/** Lignes de récurrence affichées avant le bouton « voir tout ». */
const RECURRENCE_PREVIEW = 12;

// La palette sémantique est identique sur les deux thèmes (cf. index.css).
const COL = {
  severe: '#f0606a',
  modere: '#e8a13a',
  leger: '#5fbf6f',
  absent: '#6b6b70',
  pro: '#f0606a',
  beneficial: '#5fbf6f',
  neutral: '#6b6b70',
};

// Couleur des points de la courbe amines selon la bande de charge du jour
// (hex : Recharts ne lit pas les var CSS, cf. COL).
const AMINE_BAND_HEX: Record<AmineLoadBand, string> = {
  faible: '#5fbf6f',
  modere: '#e8a13a',
  eleve: '#f0606a',
};

// Couleur des points du graphe des selles selon la zone de Bristol.
const STOOL_BAND_HEX: Record<StoolBand, string> = {
  constipation: '#e8a13a',
  normal: '#5fbf6f',
  diarrhee: '#f0606a',
};

// Couleurs « chrome » (grille, axes, tooltip) : Recharts ne lit pas les var CSS,
// on les calque donc manuellement sur le thème courant.
const CHROME = {
  dark: { grid: '#2a2a2c', muted: '#8a8a8e', ink: '#ececec', surface: '#1c1c1e', cursor: 'rgba(255,255,255,0.04)' },
  light: { grid: '#d9dadf', muted: '#65656b', ink: '#1a1a1d', surface: '#ffffff', cursor: 'rgba(0,0,0,0.04)' },
} as const;

interface EvolutionViewProps {
  date: string;
  onOpenAiSettings: () => void;
}

export function EvolutionView({ date, onOpenAiSettings }: EvolutionViewProps) {
  const [range, setRange] = useState<Range>('4weeks');
  const [reportOpen, setReportOpen] = useState(false);
  const [allRecurrence, setAllRecurrence] = useState(false);
  const { theme } = useTheme();
  const insights = useFoodInsightMap();
  const chrome = CHROME[theme];
  const axisTick = { fill: chrome.muted, fontSize: 11 };
  const tooltip = {
    contentStyle: {
      background: chrome.surface,
      border: `1px solid ${chrome.grid}`,
      borderRadius: 12,
      color: chrome.ink,
      fontSize: 12,
    },
    labelStyle: { color: chrome.muted },
    cursor: { fill: chrome.cursor },
  } as const;
  const legendProps = { wrapperStyle: { fontSize: 12, color: chrome.muted } } as const;

  const days = useLiveQuery(async () => {
    if (range === 'all') {
      const all = await db.days.orderBy('date').toArray();
      return all;
    }
    const count = range === 'week' ? 7 : 28;
    // On ancre la fenêtre sur le dernier jour renseigné (sinon la date courante),
    // pour éviter d'afficher une période vide.
    const anchor = (await getLatestActiveDate()) ?? date;
    const end = fromISODate(anchor);
    const start = addDays(end, -(count - 1));
    const dates = Array.from({ length: count }, (_, i) => toISODate(addDays(start, i)));
    const rows = await db.days.bulkGet(dates);
    return dates.map((d, i) => rows[i] ?? emptyDay(d));
  }, [range, date]);

  // Analyses IA de journées en cache (petite table) : filtrées par période plus bas.
  const allAnalyses = useLiveQuery(() => db.dayAnalyses.toArray(), []);

  // Fenêtre fixe de 30 jours pour le tableau de récurrence des aliments
  // (indépendante du sélecteur de période, cf. titre de la carte).
  const recurrenceWindow = useLiveQuery(async () => {
    const anchor = (await getLatestActiveDate()) ?? date;
    const end = fromISODate(anchor);
    const start = addDays(end, -(RECURRENCE_WINDOW_DAYS - 1));
    const dates = Array.from({ length: RECURRENCE_WINDOW_DAYS }, (_, i) => toISODate(addDays(start, i)));
    const rows = await db.days.bulkGet(dates);
    return { from: dates[0], to: dates[dates.length - 1], days: rows.filter((d) => d !== undefined) };
  }, [date]);

  if (!days) return <div className="mx-auto max-w-3xl px-4 pt-10 text-center text-muted">Chargement…</div>;

  const hasData = days.some((d) => d.meals.length > 0 || Object.values(d.symptoms).some((v) => v !== 'absent'));

  const severity = severityByDay(days).map(withLabel);
  // Nuage « symptômes après les repas » : un point par repas (jour × heure).
  const mealPoints = mealSymptomPoints(days).map(withLabel);
  const hasMealSymptoms = mealPoints.some((p) => p.max !== null);
  const timeline = days.map((d) => ({ label: dayShortLabel(d.date) }));
  // Corrélations aliment ↔ symptôme au niveau du repas (récurrent + différentiel).
  const mealCorr = mealCorrelations(days);
  const amines = amineLoadByDay(days).map(withLabel);
  const stools = stoolByDay(days).map(withLabel);
  const hasStool = stools.some((s) => s.bristol !== null);
  const categories = categoryCountsByDay(days).map(withLabel);
  const tops = topSymptoms(days);

  // --- Synthèse des analyses IA de journées sauvegardées sur la période ---
  const dateSet = new Set(days.map((d) => d.date));
  const periodAnalyses = (allAnalyses ?? []).filter((a) => dateSet.has(a.date));
  const aiTriggers = aggregateTriggers(periodAnalyses);
  const aiImprovements = aggregateImprovements(periodAnalyses);

  // --- Satiété : courbe moyenne + corrélation avec la composition du repas ---
  const satietyMeals = collectSatietyMeals(days);
  const satietyCurve = averageCurve(satietyMeals).map((p) => ({
    label: CHECKPOINT_SHORT[p.checkpoint],
    hungerIntensity: p.hungerIntensity,
    energyLevel: p.energyLevel,
    sugarCraving: p.sugarCraving,
  }));
  const categoryGroups = bucketByCategory(satietyMeals).map((b) => {
    const a = overallAverages(b.meals);
    return { label: b.label, hungerIntensity: a.hungerIntensity, sugarCraving: a.sugarCraving };
  });
  const fodmapGroups = bucketByFodmap(satietyMeals, insights).map((b) => {
    const a = overallAverages(b.meals);
    return { label: b.label, hungerIntensity: a.hungerIntensity, sugarCraving: a.sugarCraving };
  });

  // --- Récurrence des aliments sur 30 jours (tableau factuel, sans conclusion) ---
  const recurrence = recurrenceWindow ? foodRecurrence(recurrenceWindow.days, recurrenceWindow.to) : [];
  const recurrenceShown = allRecurrence ? recurrence : recurrence.slice(0, RECURRENCE_PREVIEW);

  // Plage réelle (jours renseignés) pour la clé de cache du rapport de période.
  const recorded = days.filter(dayHasContent);
  const from = recorded[0]?.date ?? days[0]?.date ?? date;
  const to = recorded[recorded.length - 1]?.date ?? from;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-4 pb-28">
      <TipBanner tab="evolution" />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink">Évolution</h2>
        <div className="flex gap-1 rounded-full border border-border p-1 text-xs" data-tour="evo-range">
          {(['week', '4weeks', 'all'] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor: range === r ? 'var(--color-surface-2)' : 'transparent',
                color: range === r ? 'var(--color-ink)' : 'var(--color-muted)',
              }}
            >
              {r === 'week' ? 'Semaine' : r === '4weeks' ? '4 semaines' : 'Tout'}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setReportOpen(true)}
        disabled={!hasData}
        title="Bilan de la période : tendances calculées + synthèse IA (verdict, déclencheurs récurrents, pistes)."
        data-tour="evo-report"
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink hover:border-leger disabled:opacity-50"
      >
        <Sparkles size={15} style={{ color: 'var(--color-leger)' }} /> Rapport de la période ({RANGE_LABEL[range]})
      </button>

      {!hasData ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">
          Pas encore assez de données sur cette période.
        </div>
      ) : (
        <div className="space-y-6">
          <ChartCard title="Sévérité globale par jour">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={severity} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
                <XAxis dataKey="label" tick={axisTick} interval="preserveStartEnd" />
                <YAxis tick={axisTick} allowDecimals={false} />
                <Tooltip {...tooltip} />
                <ReLegend {...legendProps} />
                <Bar dataKey="severe" name="Sévère" stackId="s" fill={COL.severe} />
                <Bar dataKey="modere" name="Modéré" stackId="s" fill={COL.modere} />
                <Bar dataKey="leger" name="Léger" stackId="s" fill={COL.leger} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {hasMealSymptoms && (
            <ChartCard title="Symptômes après les repas (jour × heure)">
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={timeline} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
                  <XAxis
                    dataKey="label"
                    type="category"
                    allowDuplicatedCategory={false}
                    tick={axisTick}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    dataKey="hour"
                    type="number"
                    reversed
                    domain={[5, 22.5]}
                    ticks={[6, 9, 12, 15, 18, 21]}
                    tickFormatter={(v) => `${v} h`}
                    tick={axisTick}
                    width={48}
                  />
                  <Tooltip
                    cursor={{ fill: chrome.cursor }}
                    content={({ active, payload }) => (
                      <MealSymptomTooltip active={active} payload={payload} chrome={chrome} />
                    )}
                  />
                  <Scatter
                    data={mealPoints}
                    dataKey="hour"
                    name="Repas"
                    shape={(props: { key?: string; cx?: number; cy?: number; payload?: MealSymptomPoint }) => {
                      const { key, cx, cy, payload } = props;
                      if (cx == null || cy == null || !payload) return <g key={key} />;
                      if (!payload.max) {
                        // Repas sans symptôme : petit point neutre (contexte).
                        return <circle key={key} cx={cx} cy={cy} r={2.5} fill={COL.absent} fillOpacity={0.7} />;
                      }
                      const r = payload.max === 'severe' ? 7 : payload.max === 'modere' ? 5.5 : 4;
                      return <circle key={key} cx={cx} cy={cy} r={r} fill={COL[payload.max]} fillOpacity={0.9} />;
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="mt-2 text-xs text-muted">
                Chaque point est un repas, placé à son heure. Point vert / ambre / rouge (taille croissante) =
                symptômes légers / modérés / sévères après ce repas · petit point gris = repas sans symptôme.
              </p>
            </ChartCard>
          )}

          {hasMealSymptoms && (
            <ChartCard title="Aliment suspect par symptôme (après repas)">
              {mealCorr.links.length === 0 ? (
                <p className="text-sm text-muted">
                  {mealCorr.enoughData
                    ? 'Pas encore de corrélation nette : aucun aliment ne se distingue sur ces repas (repas ambigus ou échantillon trop petit par aliment).'
                    : `Pas encore assez de repas renseignés (${mealCorr.analyzedMeals}/6) pour désigner un aliment.`}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted">
                        <th className="pb-2 pr-2 font-medium">Symptôme</th>
                        <th className="pb-2 pr-2 font-medium">Aliment suspect</th>
                        <th className="pb-2 pr-2 font-medium" title="Repas suivis du symptôme / repas contenant l'aliment">
                          Repas
                        </th>
                        <th className="pb-2 pr-2 font-medium">Amines</th>
                        <th className="pb-2 font-medium">Fiabilité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mealCorr.links.map((l) => {
                        const badge = amineBadge(l.amine);
                        const notable =
                          l.amine.level === 'high' ||
                          l.amine.level === 'moderate' ||
                          l.amine.liberator ||
                          l.amine.daoBlocker ||
                          l.amine.maoInhibitor;
                        return (
                          <tr
                            key={`${l.food}|${l.symptom}`}
                            className="border-t border-border align-top"
                            title={`Avec « ${l.food} » : ${Math.round(l.rateWith * 100)} % des repas · sans : ${Math.round(l.rateWithout * 100)} % · jours : ${l.dates.join(', ')}`}
                          >
                            <td className="py-2 pr-2 text-ink">{l.symptomLabel}</td>
                            <td className="py-2 pr-2 font-medium text-ink">{l.food}</td>
                            <td className="py-2 pr-2 whitespace-nowrap text-muted">
                              {l.symptomMealsWithFood}/{l.mealsWithFood}
                            </td>
                            <td className="py-2 pr-2">
                              {notable ? (
                                <span className="inline-flex items-center gap-1 whitespace-nowrap" title={badge.title}>
                                  <span
                                    className="inline-block h-2 w-2 rounded-full"
                                    style={{ backgroundColor: badge.color }}
                                  />
                                  {/* « Amines élevé » → « Élevé » (l'en-tête de colonne dit déjà Amines) */}
                                  <span className="text-muted">{badge.label.replace(/^Amines /, '')}</span>
                                  {l.amineMatch && (
                                    <span
                                      style={{ color: 'var(--color-leger)' }}
                                      title="Le profil d'amines de cet aliment correspond à l'amine typique de ce symptôme (histamine/tyramine)."
                                    >
                                      ✓
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td className="py-2 whitespace-nowrap">
                              {l.kind === 'recurrent' ? (
                                <span style={{ color: 'var(--color-severe)' }}>récurrent</span>
                              ) : (
                                <span style={{ color: 'var(--color-modere)' }}>à confirmer</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-2 text-xs text-muted">
                « Récurrent » : l'aliment est souvent suivi de ce symptôme, nettement plus qu'en son absence.
                « À confirmer » : dans un repas symptomatique, vos aliments habituels (vus ailleurs sans ce
                symptôme) sont disculpés — l'aliment nouveau restant est suspecté. Repère indicatif, non médical.
              </p>
            </ChartCard>
          )}

          <ChartCard title="Tendance amines biogènes">
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={amines} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
                <XAxis dataKey="label" tick={axisTick} interval="preserveStartEnd" />
                <YAxis tick={axisTick} domain={[0, 'auto']} allowDecimals={false} width={48} />
                <Tooltip
                  {...tooltip}
                  formatter={(v, _name, item) => {
                    const band = (item?.payload as { band?: AmineLoadBand } | undefined)?.band;
                    return [`${v} pt${Number(v) > 1 ? 's' : ''}${band ? ` — ${AMINE_LOAD_LABEL[band]}` : ''}`, 'Charge amines'];
                  }}
                />
                <ReferenceLine
                  y={2}
                  stroke={COL.modere}
                  strokeDasharray="4 4"
                  label={{ value: 'modéré ≥ 2', fill: COL.modere, fontSize: 11, position: 'insideBottomRight' }}
                />
                <ReferenceLine
                  y={5}
                  stroke={COL.severe}
                  strokeDasharray="4 4"
                  label={{ value: 'élevé ≥ 5', fill: COL.severe, fontSize: 11, position: 'insideTopRight' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Charge amines"
                  stroke={COL.modere}
                  strokeWidth={2}
                  connectNulls
                  dot={(props: { key?: string; cx?: number; cy?: number; payload?: { band?: AmineLoadBand | null } }) => {
                    const { key, cx, cy, payload } = props;
                    // Jour sans repas : pas de point (le score est null).
                    if (cx == null || cy == null || !payload?.band) return <g key={key} />;
                    return <circle key={key} cx={cx} cy={cy} r={4} fill={AMINE_BAND_HEX[payload.band]} />;
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="mt-2 text-xs text-muted">
              Score du jour d'après le profil d'amines des aliments (modéré +1, élevé +3, mécanismes +1).
              Point vert / ambre / rouge = charge faible / modérée / élevée.
            </p>
          </ChartCard>

          {hasStool && (
            <ChartCard title="Évolution des selles (échelle de Bristol)">
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={stools} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
                  <XAxis dataKey="label" tick={axisTick} interval="preserveStartEnd" />
                  <YAxis
                    tick={axisTick}
                    domain={[0, 7]}
                    ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
                    tickFormatter={(v) => (v === 0 ? '∅' : String(v))}
                    width={48}
                  />
                  <Tooltip
                    {...tooltip}
                    formatter={(v, _name, item) => {
                      const p = item?.payload as { stoolLabel?: string; count?: number } | undefined;
                      const txt = p?.stoolLabel ?? (v === 0 ? 'Aucune selle' : `Type ${v}`);
                      return [p?.count ? `${txt} — ×${p.count}` : txt, 'Selles'];
                    }}
                  />
                  {/* Zones à surveiller : constipation en bas, diarrhée en haut. */}
                  <ReferenceArea
                    y1={0}
                    y2={2.5}
                    fill={COL.modere}
                    fillOpacity={0.08}
                    label={{ value: 'constipation', fill: COL.modere, fontSize: 11, position: 'insideBottomRight' }}
                  />
                  <ReferenceArea
                    y1={5.5}
                    y2={7}
                    fill={COL.severe}
                    fillOpacity={0.08}
                    label={{ value: 'diarrhée', fill: COL.severe, fontSize: 11, position: 'insideTopRight' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bristol"
                    name="Selles"
                    stroke={COL.absent}
                    strokeWidth={2}
                    connectNulls
                    dot={(props: { key?: string; cx?: number; cy?: number; payload?: { bristol: number | null } }) => {
                      const { key, cx, cy, payload } = props;
                      if (cx == null || cy == null || payload?.bristol == null) return <g key={key} />;
                      return <circle key={key} cx={cx} cy={cy} r={4} fill={STOOL_BAND_HEX[stoolBand(payload.bristol)]} />;
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="mt-2 text-xs text-muted">
                Types 1-2 : constipation · 3-5 : normal · 6-7 : diarrhée · ∅ : aucune selle.
              </p>
            </ChartCard>
          )}

          <ChartCard title="Catégories d'aliments par jour">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categories} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
                <XAxis dataKey="label" tick={axisTick} interval="preserveStartEnd" />
                <YAxis tick={axisTick} allowDecimals={false} />
                <Tooltip {...tooltip} />
                <ReLegend {...legendProps} />
                <Bar dataKey="pro" name="Pro" stackId="c" fill={COL.pro} />
                <Bar dataKey="neutral" name="Neutre" stackId="c" fill={COL.neutral} />
                <Bar dataKey="beneficial" name="Bénéfique" stackId="c" fill={COL.beneficial} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title={`Récurrence des aliments (${RECURRENCE_WINDOW_DAYS} derniers jours)`}
            tour="evo-recurrence"
          >
            {!recurrenceWindow ? (
              <p className="text-sm text-muted">Chargement…</p>
            ) : recurrence.length === 0 ? (
              <p className="text-sm text-muted">
                Aucun aliment renseigné sur les {RECURRENCE_WINDOW_DAYS} derniers jours.
              </p>
            ) : (
              <>
                <p className="mb-3 text-xs text-muted">
                  Du {dayMonthLabel(recurrenceWindow.from)} au {dayMonthLabel(recurrenceWindow.to)} —{' '}
                  {recurrence.length} aliment{recurrence.length > 1 ? 's' : ''} distinct
                  {recurrence.length > 1 ? 's' : ''} (indépendant du filtre de période ci-dessus).
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted">
                        <th className="pb-2 pr-2 font-medium">Aliment</th>
                        <th className="pb-2 pr-2 font-medium" title="Nombre de fois où l'aliment apparaît dans un repas">
                          Mentions
                        </th>
                        <th className="pb-2 pr-2 font-medium" title="Nombre de jours différents où l'aliment apparaît">
                          Jours
                        </th>
                        <th className="pb-2 pr-2 font-medium" title="Écart moyen entre deux jours de consommation">
                          Rythme
                        </th>
                        <th className="pb-2 font-medium">De … à …</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recurrenceShown.map((r) => (
                        <tr key={r.key} className="border-t border-border align-top" title={recurrenceTitle(r)}>
                          <td className="py-2 pr-2">
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className="inline-block h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: CATEGORY_COLOR[r.category] }}
                                title={CATEGORY_LABEL[r.category]}
                              />
                              <span className="font-medium text-ink">{r.name}</span>
                            </span>
                          </td>
                          <td className="py-2 pr-2 whitespace-nowrap text-ink">×{r.mentions}</td>
                          <td className="py-2 pr-2 whitespace-nowrap text-muted">{r.dates.length} j</td>
                          <td className="py-2 pr-2 whitespace-nowrap text-muted">
                            {r.avgIntervalDays === null ? '—' : `tous les ~${formatInterval(r.avgIntervalDays)} j`}
                          </td>
                          <td className="py-2 whitespace-nowrap text-muted">
                            {r.first === r.last
                              ? dayMonthLabel(r.first)
                              : `${dayMonthLabel(r.first)} → ${dayMonthLabel(r.last)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {recurrence.length > RECURRENCE_PREVIEW && (
                  <button
                    type="button"
                    onClick={() => setAllRecurrence((v) => !v)}
                    className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:border-leger hover:text-ink"
                  >
                    {allRecurrence
                      ? 'Réduire'
                      : `Voir les ${recurrence.length - RECURRENCE_PREVIEW} autres aliments`}
                  </button>
                )}
                <p className="mt-2 text-xs text-muted">
                  Simple décompte du journal : « ×4 · 3 j » = 4 mentions réparties sur 3 jours différents.
                  Les pluriels sont regroupés (« Tomate » / « Tomates »). Survolez une ligne pour voir toutes
                  les dates. Pastille : catégorie de l'aliment (rouge pro · gris neutre · vert bénéfique).
                </p>
              </>
            )}
          </ChartCard>

          <ChartCard title="Top symptômes sur la période">
            <ResponsiveContainer width="100%" height={Math.max(160, tops.length * 30)}>
              <BarChart
                layout="vertical"
                data={tops}
                margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} horizontal={false} />
                <XAxis type="number" tick={axisTick} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={axisTick} width={130} />
                <Tooltip {...tooltip} formatter={(v) => [`${v}`, 'Intensité cumulée']} />
                <Bar dataKey="weight" name="Intensité cumulée" fill={COL.severe} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {periodAnalyses.length > 0 && (aiTriggers.length > 0 || aiImprovements.length > 0) && (
            <>
              <h3 className="pt-2 text-base font-semibold text-ink">
                Synthèse des analyses IA ({periodAnalyses.length} journée{periodAnalyses.length > 1 ? 's' : ''} analysée{periodAnalyses.length > 1 ? 's' : ''})
              </h3>

              {aiTriggers.length > 0 && (
                <ChartCard title="Déclencheurs probables récurrents">
                  <div className="flex flex-wrap gap-2">
                    {aiTriggers.slice(0, 12).map((t) => (
                      <span
                        key={t.label}
                        className="rounded-full border px-3 py-1 text-xs"
                        style={{ borderColor: 'var(--color-severe)', color: 'var(--color-severe)' }}
                        title={`Cité les jours : ${t.dates.join(', ')}`}
                      >
                        {t.label}
                        {t.count > 1 && <span className="opacity-70"> ×{t.count}</span>}
                      </span>
                    ))}
                  </div>
                  {aiTriggers.length > 12 && (
                    <p className="mt-2 text-xs text-muted">+ {aiTriggers.length - 12} autres</p>
                  )}
                </ChartCard>
              )}

              {aiImprovements.length > 0 && (
                <ChartCard title="Pistes d'amélioration proposées">
                  <ul className="space-y-3">
                    {aiImprovements.slice(0, 8).map((i) => (
                      <li key={i.label} className="text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-ink">{i.label}</span>
                          {i.count > 1 && (
                            <span
                              className="shrink-0 rounded-full px-2 py-0.5 text-xs text-muted"
                              style={{ backgroundColor: 'var(--color-surface-2)' }}
                              title={`Proposée les jours : ${i.dates.join(', ')}`}
                            >
                              ×{i.count}
                            </span>
                          )}
                        </div>
                        {i.why && <p className="mt-0.5 text-xs text-muted">Pourquoi : {i.why}</p>}
                      </li>
                    ))}
                  </ul>
                  {aiImprovements.length > 8 && (
                    <p className="mt-2 text-xs text-muted">+ {aiImprovements.length - 8} autres</p>
                  )}
                </ChartCard>
              )}

              <p className="text-xs text-muted">
                Regroupement des analyses IA de journées déjà sauvegardées (aucun nouvel appel) —
                les variantes proches sont résumées, ×N = nombre de journées. Repère indicatif, non médical.
              </p>
            </>
          )}

          {satietyMeals.length > 0 && (
            <>
              <h3 className="pt-2 text-base font-semibold text-ink">Satiété après les repas</h3>

              {satietyMeals.length < MIN_SATIETY_MEALS ? (
                <div className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
                  Pas encore assez de repas suivis pour une corrélation fiable
                  ({satietyMeals.length}/{MIN_SATIETY_MEALS}). Continuez à renseigner votre satiété.
                </div>
              ) : (
                <>
                  <ChartCard title="Courbe de satiété moyenne (faim / énergie / envie de sucre)">
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={satietyCurve} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
                        <XAxis dataKey="label" tick={axisTick} />
                        <YAxis tick={axisTick} domain={[0, 100]} />
                        <Tooltip {...tooltip} />
                        <ReLegend {...legendProps} />
                        <Line type="monotone" dataKey="hungerIntensity" name="Faim" stroke={COL.severe} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                        <Line type="monotone" dataKey="energyLevel" name="Énergie" stroke={COL.leger} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                        <Line type="monotone" dataKey="sugarCraving" name="Envie de sucre" stroke={COL.modere} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  {categoryGroups.length >= 2 && (
                    <ChartCard title="Faim & envie de sucre selon la catégorie dominante du repas">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={categoryGroups} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
                          <XAxis dataKey="label" tick={axisTick} />
                          <YAxis tick={axisTick} domain={[0, 100]} />
                          <Tooltip {...tooltip} />
                          <ReLegend {...legendProps} />
                          <Bar dataKey="hungerIntensity" name="Faim (moy.)" fill={COL.severe} radius={[3, 3, 0, 0]} />
                          <Bar dataKey="sugarCraving" name="Sucre (moy.)" fill={COL.modere} radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  )}

                  {fodmapGroups.length >= 2 ? (
                    <ChartCard title="Faim & envie de sucre selon le niveau FODMAP du repas">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={fodmapGroups} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
                          <XAxis dataKey="label" tick={axisTick} />
                          <YAxis tick={axisTick} domain={[0, 100]} />
                          <Tooltip {...tooltip} />
                          <ReLegend {...legendProps} />
                          <Bar dataKey="hungerIntensity" name="Faim (moy.)" fill={COL.severe} radius={[3, 3, 0, 0]} />
                          <Bar dataKey="sugarCraving" name="Sucre (moy.)" fill={COL.modere} radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  ) : (
                    <p className="text-xs text-muted">
                      Analysez vos aliments avec l'IA (onglet Aliments) pour comparer aussi la satiété
                      par niveau FODMAP des repas.
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      <PeriodReportSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onOpenAiSettings={() => {
          setReportOpen(false);
          onOpenAiSettings();
        }}
        days={days}
        scope={range}
        from={from}
        to={to}
        label={RANGE_LABEL[range]}
      />
    </div>
  );
}

function withLabel<T extends { date: string }>(p: T): T & { label: string } {
  return { ...p, label: dayShortLabel(p.date) };
}

/** "19:30" → "19 h 30" (convention d'affichage des heures de repas). */
function formatMealTime(t: string): string {
  const [h, m] = t.split(':');
  return `${Number(h)} h ${m}`;
}

/** Tooltip du nuage « symptômes après les repas » : les repas du jour survolé. */
function MealSymptomTooltip({
  active,
  payload,
  chrome,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
  chrome: (typeof CHROME)[keyof typeof CHROME];
}) {
  if (!active || !payload?.length) return null;
  // Dédoublonne (le tooltip partagé peut répéter un point) puis trie par heure.
  const seen = new Set<string>();
  const meals: (MealSymptomPoint & { label: string })[] = [];
  for (const entry of payload) {
    const p = entry.payload as (MealSymptomPoint & { label: string }) | undefined;
    if (!p?.time) continue;
    const k = `${p.date} ${p.time}`;
    if (seen.has(k)) continue;
    seen.add(k);
    meals.push(p);
  }
  if (meals.length === 0) return null;
  meals.sort((a, b) => a.hour - b.hour);
  return (
    <div
      style={{
        background: chrome.surface,
        border: `1px solid ${chrome.grid}`,
        borderRadius: 12,
        color: chrome.ink,
        fontSize: 12,
        padding: '8px 10px',
        maxWidth: 260,
      }}
    >
      <div style={{ color: chrome.muted, marginBottom: 4 }}>{meals[0].label}</div>
      {meals.map((p) => (
        <div key={p.time} style={{ marginBottom: 4 }}>
          <div>Repas de {formatMealTime(p.time)}</div>
          {p.actifs.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {p.actifs.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : (
            <div style={{ color: chrome.muted }}>aucun symptôme</div>
          )}
        </div>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  tour,
  children,
}: {
  title: string;
  /** Ancre de visite guidée (`data-tour`), optionnelle. */
  tour?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4" data-tour={tour}>
      <h3 className="mb-3 text-sm font-medium text-ink">{title}</h3>
      {children}
    </div>
  );
}

/** "4" ou "3,5" (écart moyen entre deux consommations). */
function formatInterval(days: number): string {
  return days.toFixed(days < 10 && !Number.isInteger(days) ? 1 : 0).replace('.', ',');
}

/** Infobulle d'une ligne de récurrence : toutes les dates + dernière mention. */
function recurrenceTitle(r: FoodRecurrenceRow): string {
  const dates = r.dates.map(dayMonthLabel).join(', ');
  const last =
    r.daysSinceLast === 0
      ? 'dernière mention le dernier jour renseigné'
      : `dernière mention il y a ${r.daysSinceLast} jour${r.daysSinceLast > 1 ? 's' : ''}`;
  return `Mentionné les : ${dates} · ${last}`;
}

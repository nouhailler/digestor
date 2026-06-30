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
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { db, getLatestActiveDate } from '../lib/db';
import { emptyDay } from '../lib/factory';
import {
  categoryCountsByDay,
  hydrationByDay,
  severityByDay,
  topSymptoms,
} from '../lib/aggregates';
import { HYDRATION_TARGET_L } from '../lib/constants';
import { CHECKPOINT_SHORT } from '../lib/satiety';
import {
  averageCurve,
  bucketByCategory,
  bucketByFodmap,
  collectSatietyMeals,
  MIN_SATIETY_MEALS,
  overallAverages,
} from '../lib/satietyCorrelation';
import { dayShortLabel, fromISODate, toISODate } from '../lib/dates';
import { dayHasContent } from '../lib/aggregates';
import { TipBanner } from '../components/TipBanner';
import { PeriodReportSheet } from '../components/ai/PeriodReportSheet';
import { useFoodInsightMap } from '../hooks/useFoodInsightMap';
import { useTheme } from '../hooks/useTheme';
import { Sparkles } from 'lucide-react';

type Range = 'week' | '4weeks' | 'all';

const RANGE_LABEL: Record<Range, string> = { week: 'Semaine', '4weeks': '4 semaines', all: 'Tout' };

// La palette sémantique est identique sur les deux thèmes (cf. index.css).
const COL = {
  severe: '#f0606a',
  modere: '#e8a13a',
  leger: '#5fbf6f',
  absent: '#6b6b70',
  pro: '#f0606a',
  beneficial: '#5fbf6f',
  neutral: '#6b6b70',
  hydration: '#5fbf6f',
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

  if (!days) return <div className="mx-auto max-w-3xl px-4 pt-10 text-center text-muted">Chargement…</div>;

  const hasData = days.some((d) => d.meals.length > 0 || Object.values(d.symptoms).some((v) => v !== 'absent'));

  const severity = severityByDay(days).map(withLabel);
  const hydration = hydrationByDay(days).map(withLabel);
  const categories = categoryCountsByDay(days).map(withLabel);
  const tops = topSymptoms(days);

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

          <ChartCard title="Tendance hydratation">
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={hydration} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
                <XAxis dataKey="label" tick={axisTick} interval="preserveStartEnd" />
                <YAxis tick={axisTick} domain={[0, 'auto']} unit=" L" width={48} />
                <Tooltip {...tooltip} formatter={(v) => [`${v} L`, 'Hydratation']} />
                <ReferenceLine
                  y={HYDRATION_TARGET_L}
                  stroke={COL.modere}
                  strokeDasharray="4 4"
                  label={{ value: 'cible 1,5 L', fill: COL.modere, fontSize: 11, position: 'insideTopRight' }}
                />
                <Line
                  type="monotone"
                  dataKey="hydration"
                  name="Hydratation"
                  stroke={COL.hydration}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-medium text-ink">{title}</h3>
      {children}
    </div>
  );
}

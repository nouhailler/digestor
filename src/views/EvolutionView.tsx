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
import { dayShortLabel, fromISODate, toISODate } from '../lib/dates';
import { TipBanner } from '../components/TipBanner';

type Range = 'week' | '4weeks' | 'all';

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

interface EvolutionViewProps {
  date: string;
}

export function EvolutionView({ date }: EvolutionViewProps) {
  const [range, setRange] = useState<Range>('4weeks');

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

  return (
    <div className="mx-auto max-w-3xl px-4 pt-4 pb-28">
      <TipBanner tab="evolution" />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink">Évolution</h2>
        <div className="flex gap-1 rounded-full border border-border p-1 text-xs">
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

      {!hasData ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">
          Pas encore assez de données sur cette période.
        </div>
      ) : (
        <div className="space-y-6">
          <ChartCard title="Sévérité globale par jour">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={severity} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2c" vertical={false} />
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
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2c" vertical={false} />
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
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2c" vertical={false} />
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
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2c" horizontal={false} />
                <XAxis type="number" tick={axisTick} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={axisTick} width={130} />
                <Tooltip {...tooltip} formatter={(v) => [`${v}`, 'Intensité cumulée']} />
                <Bar dataKey="weight" name="Intensité cumulée" fill={COL.severe} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function withLabel<T extends { date: string }>(p: T): T & { label: string } {
  return { ...p, label: dayShortLabel(p.date) };
}

const axisTick = { fill: '#8a8a8e', fontSize: 11 };

const tooltip = {
  contentStyle: {
    background: '#1c1c1e',
    border: '1px solid #2a2a2c',
    borderRadius: 12,
    color: '#ececec',
    fontSize: 12,
  },
  labelStyle: { color: '#8a8a8e' },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
} as const;

const legendProps = { wrapperStyle: { fontSize: 12, color: '#8a8a8e' } } as const;

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-medium text-ink">{title}</h3>
      {children}
    </div>
  );
}

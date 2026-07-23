import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend as ReLegend,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DayEntry } from '../types';
import { dayHasContent, fillDayRange, severityByDay, stoolBand, stoolByDay, type StoolBand } from '../lib/aggregates';
import { dayMonthLabel } from '../lib/dates';
import { useTheme } from '../hooks/useTheme';

// Hex littéraux : Recharts ne lit pas les var CSS (cf. EvolutionView).
// À l'impression, `index.css` force le texte/la grille des SVG en sombre sur blanc.
const COL = { severe: '#f0606a', modere: '#e8a13a', leger: '#5fbf6f', absent: '#6b6b70' };
const STOOL_BAND_HEX: Record<StoolBand, string> = {
  constipation: '#e8a13a',
  normal: '#5fbf6f',
  diarrhee: '#f0606a',
};
const CHROME = {
  dark: { grid: '#2a2a2c', muted: '#8a8a8e', ink: '#ececec', surface: '#1c1c1e' },
  light: { grid: '#d9dadf', muted: '#65656b', ink: '#1a1a1d', surface: '#ffffff' },
} as const;

/**
 * Graphes du dossier médical : sévérité des symptômes et transit sur la période
 * complète. Les jours épars sont comblés par `fillDayRange` pour un axe temporel
 * honnête (un trou de saisie reste visible comme un trou, pas comme un jour contigu).
 * Animations coupées : le document doit être imprimable dès l'ouverture.
 */
export function MedicalRecordCharts({ days }: { days: DayEntry[] }) {
  const { theme } = useTheme();
  const chrome = CHROME[theme];
  // Borné aux jours renseignés : un jour vide autosauvé en base ne doit pas étirer
  // l'axe ; les trous internes sont recréés par fillDayRange.
  const filled = fillDayRange(days.filter(dayHasContent));
  if (filled.length < 2) {
    return <p className="text-muted">Période trop courte pour tracer une évolution (un seul jour renseigné).</p>;
  }

  const severity = severityByDay(filled).map((p) => ({ ...p, label: dayMonthLabel(p.date) }));
  const stools = stoolByDay(filled).map((p) => ({ ...p, label: dayMonthLabel(p.date) }));
  const hasSymptoms = severity.some((p) => p.total > 0);
  const hasStool = stools.some((s) => s.bristol !== null);
  if (!hasSymptoms && !hasStool) {
    return <p className="text-muted">Aucun symptôme ni transit renseigné à tracer sur la période.</p>;
  }

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
  } as const;

  return (
    <div className="space-y-4">
      {hasSymptoms && (
        <figure className="break-inside-avoid">
          <figcaption className="mb-1 font-medium text-ink">Sévérité des symptômes par jour</figcaption>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={severity} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
              <XAxis dataKey="label" tick={axisTick} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip {...tooltip} />
              <ReLegend wrapperStyle={{ fontSize: 12, color: chrome.muted }} />
              <Bar dataKey="severe" name="Sévère" stackId="s" fill={COL.severe} isAnimationActive={false} />
              <Bar dataKey="modere" name="Modéré" stackId="s" fill={COL.modere} isAnimationActive={false} />
              <Bar
                dataKey="leger"
                name="Léger"
                stackId="s"
                fill={COL.leger}
                radius={[3, 3, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </figure>
      )}

      {hasStool && (
        <figure className="break-inside-avoid">
          <figcaption className="mb-1 font-medium text-ink">Transit (échelle de Bristol)</figcaption>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={stools} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chrome.grid} vertical={false} />
              <XAxis dataKey="label" tick={axisTick} interval="preserveStartEnd" minTickGap={24} />
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
                isAnimationActive={false}
                dot={(props: { key?: string; cx?: number; cy?: number; payload?: { bristol: number | null } }) => {
                  const { key, cx, cy, payload } = props;
                  if (cx == null || cy == null || payload?.bristol == null) return <g key={key} />;
                  return <circle key={key} cx={cx} cy={cy} r={4} fill={STOOL_BAND_HEX[stoolBand(payload.bristol)]} />;
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </figure>
      )}

      <p className="text-xs text-muted">
        Axe temporel continu du premier au dernier jour renseigné : les jours sans saisie apparaissent vides.
      </p>
    </div>
  );
}

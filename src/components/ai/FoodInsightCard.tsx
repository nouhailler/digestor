import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { FodmapGroups, FoodInsight } from '../../types';
import {
  FODMAP_GROUP_LABEL,
  FODMAP_LEVEL_COLOR,
  FODMAP_LEVEL_LABEL,
  VERDICT_COLOR,
  VERDICT_LABEL,
} from '../../lib/ai/insightFormat';
import {
  AMINE_LEVEL_COLOR,
  AMINE_LEVEL_LABEL,
  AMINE_TOLERANCE_LABEL,
  AMINE_TYPE_LABEL,
  AMINE_TYPES,
  amineTolerance,
} from '../../lib/biogenicAmines';

const GROUP_KEYS = Object.keys(FODMAP_GROUP_LABEL) as (keyof FodmapGroups)[];

export function FoodInsightCard({ insight }: { insight: FoodInsight }) {
  return (
    <div className="space-y-4 text-sm">
      {/* Niveau FODMAP global + verdicts */}
      <div className="flex flex-wrap gap-2">
        <Badge
          label={`FODMAP : ${FODMAP_LEVEL_LABEL[insight.fodmapLevel]}`}
          color={FODMAP_LEVEL_COLOR[insight.fodmapLevel]}
        />
        <Badge label={`SIBO : ${VERDICT_LABEL[insight.sibo.verdict]}`} color={VERDICT_COLOR[insight.sibo.verdict]} />
        <Badge
          label={`Candidose : ${VERDICT_LABEL[insight.candida.verdict]}`}
          color={VERDICT_COLOR[insight.candida.verdict]}
        />
        {insight.amines && (
          <Badge
            label={`Amines : ${AMINE_LEVEL_LABEL[insight.amines.level]}`}
            color={AMINE_LEVEL_COLOR[insight.amines.level]}
          />
        )}
      </div>

      {insight.summary && <p className="leading-relaxed text-ink">{insight.summary}</p>}

      {/* Détail FODMAP par groupe */}
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Détail FODMAP
        </h4>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {GROUP_KEYS.map((g) => (
            <div
              key={g}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-1.5"
            >
              <span className="text-ink">{FODMAP_GROUP_LABEL[g]}</span>
              <span className="inline-flex items-center gap-1.5 text-muted">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: FODMAP_LEVEL_COLOR[insight.fodmaps[g]] }}
                />
                {FODMAP_LEVEL_LABEL[insight.fodmaps[g]]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes par condition */}
      {(insight.sibo.note || insight.candida.note) && (
        <div className="space-y-2">
          {insight.sibo.note && <Note title="SIBO" text={insight.sibo.note} color={VERDICT_COLOR[insight.sibo.verdict]} />}
          {insight.candida.note && (
            <Note title="Candidose" text={insight.candida.note} color={VERDICT_COLOR[insight.candida.verdict]} />
          )}
        </div>
      )}

      {insight.amines &&
        (() => {
          const a = insight.amines;
          const tol = amineTolerance(a);
          // Détail par amine renseigné (histamine / tyramine / putrescine-cadavérine).
          const details = AMINE_TYPES.filter((t) => a[t] && a[t] !== 'unknown');
          // Mécanismes en toutes lettres.
          const mechanisms = [
            a.liberator ? 'histamino-libérateur' : '',
            a.daoBlocker ? 'freine la DAO' : '',
            a.maoInhibitor ? 'inhibe la MAO (tyramine)' : '',
            a.fermented ? 'fermenté / affiné' : '',
            a.freshnessDependent ? 'dépend de la fraîcheur' : '',
          ].filter(Boolean);
          const text = [
            a.note,
            tol ? `Consommation : ${AMINE_TOLERANCE_LABEL[tol.level].toLowerCase()}${tol.note ? ` (${tol.note})` : ''}.` : '',
          ]
            .filter(Boolean)
            .join(' ');
          if (!text && !details.length && !mechanisms.length) return null;
          return (
            <div className="rounded-lg border border-border bg-surface-2 px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: AMINE_LEVEL_COLOR[a.level] }}>
                Amines biogènes
              </span>
              {details.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  {details.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1.5 text-xs text-muted">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: AMINE_LEVEL_COLOR[a[t]!] }} />
                      {AMINE_TYPE_LABEL[t]} : {AMINE_LEVEL_LABEL[a[t]!].toLowerCase()}
                    </span>
                  ))}
                </div>
              )}
              {mechanisms.length > 0 && <p className="mt-1.5 text-xs text-muted">{capitalize(mechanisms.join(' · '))}.</p>}
              {text && <p className="mt-1 text-ink">{text}</p>}
            </div>
          );
        })()}

      {insight.safePortion && (
        <p className="text-muted">
          Portion généralement tolérée : <span className="text-ink">{insight.safePortion}</span>
        </p>
      )}

      {insight.tips.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Conseils</h4>
          <ul className="space-y-1.5">
            {insight.tips.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-ink">
                <span
                  className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: 'var(--color-leger)' }}
                />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="border-t border-border/60 pt-3 text-xs text-muted">
        Généré par {insight.model} · {format(new Date(insight.updatedAt), 'd MMM yyyy à HH:mm', { locale: fr })}.
        Repère indicatif, non médical.
      </p>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="rounded-full border px-3 py-1 text-xs"
      style={{ color, borderColor: color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
    >
      {label}
    </span>
  );
}

function Note({ title, text, color }: { title: string; text: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2">
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        {title}
      </span>
      <p className="mt-0.5 text-ink">{text}</p>
    </div>
  );
}

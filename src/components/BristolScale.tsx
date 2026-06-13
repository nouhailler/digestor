/** Échelle de Bristol illustrée : 7 types, glyphe + couleur + description. */

type Tone = 'severe' | 'modere' | 'leger';

interface Row {
  type: number;
  tone: Tone;
  label: string;
  desc: string;
}

const TONE: Record<Tone, string> = {
  severe: 'var(--color-severe)',
  modere: 'var(--color-modere)',
  leger: 'var(--color-leger)',
};

const ROWS: Row[] = [
  { type: 1, tone: 'severe', label: 'Billes dures séparées', desc: 'Constipation sévère' },
  { type: 2, tone: 'modere', label: 'En saucisse, grumeleuse', desc: 'Légère constipation' },
  { type: 3, tone: 'leger', label: 'Saucisse craquelée', desc: 'Normal' },
  { type: 4, tone: 'leger', label: 'Saucisse lisse et molle', desc: 'Idéal' },
  { type: 5, tone: 'modere', label: 'Morceaux mous, bords nets', desc: 'Tendance molle' },
  { type: 6, tone: 'severe', label: 'Morceaux floconneux déchiquetés', desc: 'Légère diarrhée' },
  { type: 7, tone: 'severe', label: 'Entièrement liquide', desc: 'Diarrhée' },
];

/** Petit glyphe représentant l'aspect des selles d'un type donné. */
function Glyph({ type, color }: { type: number; color: string }) {
  const common = { fill: color };
  return (
    <svg viewBox="0 0 60 22" width="60" height="22" aria-hidden="true">
      {type === 1 && [6, 20, 34, 48].map((x) => <circle key={x} cx={x + 3} cy={11} r={4} {...common} />)}
      {type === 2 && (
        <g {...common}>
          <rect x="6" y="5" width="48" height="12" rx="6" />
          {[14, 24, 34, 44].map((x) => <circle key={x} cx={x} cy={6} r={3} />)}
        </g>
      )}
      {type === 3 && (
        <g {...common}>
          <rect x="6" y="6" width="48" height="10" rx="5" />
          {[18, 30, 42].map((x) => <rect key={x} x={x} y="6" width="1.6" height="10" fill="#0e0e0f" opacity="0.5" />)}
        </g>
      )}
      {type === 4 && <rect x="6" y="7" width="48" height="9" rx="4.5" {...common} />}
      {type === 5 && (
        <g {...common}>
          <ellipse cx="16" cy="11" rx="9" ry="6" />
          <ellipse cx="34" cy="11" rx="7" ry="5" />
          <ellipse cx="48" cy="11" rx="5" ry="4" />
        </g>
      )}
      {type === 6 && (
        <path
          d="M10 12c-3-6 4-8 7-5 2-4 9-3 9 1 4-3 9 1 6 5 4 1 3 7-2 6-1 4-8 4-9 0-3 3-9 1-8-4-4 1-7-1-3-4z"
          {...common}
        />
      )}
      {type === 7 && (
        <g stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M6 8c6-4 12 4 18 0s12-4 18 0 12 4 12 4" />
          <path d="M6 15c6-4 12 4 18 0s12-4 18 0 12 4 12 4" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}

export function BristolScale() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <h4 className="mb-1 text-sm font-semibold text-ink">Échelle de Bristol</h4>
      <p className="mb-3 text-xs text-muted">Référence visuelle de la consistance des selles (type 1 à 7).</p>
      <ul className="space-y-2">
        {ROWS.map((r) => (
          <li key={r.type} className="flex items-center gap-3" title={`Type ${r.type} — ${r.label} (${r.desc})`}>
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{ color: TONE[r.tone], border: `1.5px solid ${TONE[r.tone]}` }}
            >
              {r.type}
            </span>
            <span className="shrink-0" style={{ width: 60 }}>
              <Glyph type={r.type} color={TONE[r.tone]} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm text-ink">{r.label}</span>
              <span className="block text-xs text-muted">{r.desc}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

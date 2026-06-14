/**
 * Guide illustré du système digestif (sous-onglet de l'écran Repères).
 * Mélange une planche anatomique libre (Wikimedia, domaine public) et des
 * schémas SVG « maison » (transit + microbiote) cohérents avec le thème sombre.
 * 100 % offline : l'image est embarquée dans `public/anatomy/`.
 */

type Tone = 'severe' | 'modere' | 'leger';

const TONE: Record<Tone, string> = {
  severe: 'var(--color-severe)',
  modere: 'var(--color-modere)',
  leger: 'var(--color-leger)',
};

/* ------------------------------------------------------------------ Transit */

interface Stage {
  n: number;
  organ: string;
  duration: string;
  tone: Tone;
  text: string;
}

const STAGES: Stage[] = [
  {
    n: 1,
    organ: 'Bouche',
    duration: 'quelques minutes',
    tone: 'leger',
    text: "La digestion commence dès la bouche : la mastication broie les aliments et la salive (amylase) attaque déjà l'amidon. Bien mâcher allège tout le reste du trajet.",
  },
  {
    n: 2,
    organ: 'Œsophage',
    duration: '~10 secondes',
    tone: 'leger',
    text: "Le bol alimentaire descend vers l'estomac, poussé par des contractions musculaires (péristaltisme) — pas par la gravité.",
  },
  {
    n: 3,
    organ: 'Estomac',
    duration: '2 à 4 heures',
    tone: 'modere',
    text: "Brassage mécanique + acide chlorhydrique et pepsine : les protéines sont découpées et une grande partie des microbes ingérés est neutralisée. Il en sort une bouillie acide, le « chyme ».",
  },
  {
    n: 4,
    organ: 'Intestin grêle',
    duration: '3 à 5 heures',
    tone: 'leger',
    text: "Duodénum, jéjunum, iléon (~6-7 m). La bile (foie/vésicule) émulsionne les graisses et les enzymes du pancréas finissent la découpe. C'est ici que se fait l'essentiel de l'absorption des nutriments (≈ 90 %).",
  },
  {
    n: 5,
    organ: 'Gros intestin (côlon)',
    duration: '12 à 48 heures',
    tone: 'modere',
    text: "L'eau et les minéraux sont réabsorbés, et le microbiote fermente les fibres non digérées (→ gaz et acides gras bénéfiques). Les selles se forment et se déshydratent peu à peu.",
  },
  {
    n: 6,
    organ: 'Rectum & anus',
    duration: 'évacuation',
    tone: 'leger',
    text: "Le rectum stocke les selles jusqu'à l'évacuation. Au total, un repas met en moyenne 24 à 72 h pour traverser tout le tube digestif.",
  },
];

function TransitTimeline() {
  return (
    <ol className="relative ml-3 space-y-4">
      {/* Ligne verticale reliant les étapes */}
      <span
        aria-hidden="true"
        className="absolute left-[11px] top-2 bottom-2 w-px"
        style={{ background: 'var(--color-border)' }}
      />
      {STAGES.map((s) => (
        <li key={s.n} className="relative pl-8">
          <span
            className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
            style={{ color: TONE[s.tone], border: `1.5px solid ${TONE[s.tone]}`, background: 'var(--color-bg)' }}
          >
            {s.n}
          </span>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-medium text-ink">{s.organ}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[11px]"
              style={{ color: TONE[s.tone], border: `1px solid ${TONE[s.tone]}` }}
            >
              {s.duration}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

/* ----------------------------------------------------------------- Microbiote */

type Dot = { x: number; y: number; tone: Tone };

/** Place `greens/ambers/reds` pastilles sur une grille 6×4, mélangées de façon déterministe. */
function gutDots(greens: number, ambers: number, reds: number): Dot[] {
  const tones: Tone[] = [
    ...Array<Tone>(greens).fill('leger'),
    ...Array<Tone>(ambers).fill('modere'),
    ...Array<Tone>(reds).fill('severe'),
  ];
  const cols = 6;
  const n = tones.length; // 24 → permutation car pgcd(11, 24) = 1
  const dots: Dot[] = [];
  for (let i = 0; i < n; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const jx = ((i * 37) % 9) - 4;
    const jy = ((i * 53) % 9) - 4;
    dots.push({ x: 22 + c * 23 + jx, y: 24 + r * 26 + jy, tone: tones[(i * 11) % n] });
  }
  return dots;
}

const EUBIOSE = gutDots(18, 3, 3);
const DYSBIOSE = gutDots(7, 6, 11);

function GutPanel({ title, subtitle, dots, accent }: { title: string; subtitle: string; dots: Dot[]; accent: Tone }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3">
      <div className="mb-2">
        <span className="text-sm font-semibold" style={{ color: TONE[accent] }}>
          {title}
        </span>
        <span className="block text-xs text-muted">{subtitle}</span>
      </div>
      <svg viewBox="0 0 160 120" className="w-full" role="img" aria-label={`${title} : ${subtitle}`}>
        <rect
          x="4"
          y="4"
          width="152"
          height="112"
          rx="16"
          fill="var(--color-surface-2)"
          stroke="var(--color-border)"
        />
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.tone === 'leger' ? 5 : 4.5} fill={TONE[d.tone]} opacity={0.9} />
        ))}
      </svg>
    </div>
  );
}

const MICROBIOTE_ROLES = [
  'Fermentent les fibres → acides gras à chaîne courte (butyrate) qui nourrissent la paroi du côlon.',
  'Synthétisent des vitamines (K, certaines vitamines B).',
  'Forment une barrière qui freine les microbes pathogènes et les levures (dont le Candida).',
  "Éduquent le système immunitaire (≈ 70 % des défenses sont au niveau de l'intestin).",
];

/* ------------------------------------------------------------------- Sections */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>
      {children}
    </section>
  );
}

export function DigestiveGuide() {
  return (
    <div>
      <p className="text-sm text-muted">
        Comprendre le trajet des aliments et le rôle du microbiote aide à mieux lire ses symptômes. Voici un
        survol illustré, étape par étape.
      </p>

      <Section title="Anatomie du tube digestif">
        <figure className="rounded-2xl border border-border bg-surface p-3">
          {/* Fond clair : la planche a des libellés noirs, illisibles sur le thème sombre. */}
          <div className="rounded-xl bg-white p-3">
            <img
              src="/anatomy/digestive-system-fr.svg"
              alt="Schéma anatomique du système digestif humain, organes annotés en français"
              loading="lazy"
              className="mx-auto block h-auto w-full max-w-[320px]"
            />
          </div>
          <figcaption className="mt-2 text-xs text-muted">
            De la bouche à l'anus, le tube digestif mesure ~7 à 9 m. Foie, vésicule biliaire, pancréas et
            glandes salivaires sont des organes « annexes » qui sécrètent sucs et enzymes sans que les aliments
            les traversent.
          </figcaption>
        </figure>
      </Section>

      <Section title="Le transit, étape par étape">
        <TransitTimeline />
      </Section>

      <Section title="Le microbiote intestinal">
        <p className="mb-3 text-sm text-muted">
          Le côlon héberge environ <strong className="text-ink">100 000 milliards</strong> de micro-organismes
          (surtout des bactéries), soit 1 à 2 kg : c'est le microbiote. Bien équilibré, c'est un allié essentiel.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <GutPanel
            title="Équilibre (eubiose)"
            subtitle="Bactéries utiles majoritaires"
            dots={EUBIOSE}
            accent="leger"
          />
          <GutPanel
            title="Déséquilibre (dysbiose)"
            subtitle="Pathogènes & levures en excès"
            dots={DYSBIOSE}
            accent="severe"
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <Legend tone="leger" label="Bactéries utiles" />
          <Legend tone="modere" label="Neutres / opportunistes" />
          <Legend tone="severe" label="Pathogènes / levures" />
        </div>

        <ul className="mt-3 space-y-1.5 text-sm text-muted">
          {MICROBIOTE_ROLES.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: TONE.leger }} />
              <span>{r}</span>
            </li>
          ))}
        </ul>

        <p className="mt-3 text-sm text-muted">
          Quand cet équilibre se rompt (antibiotiques répétés, excès de sucres rapides, stress, alimentation
          pauvre en fibres), on parle de <strong className="text-ink">dysbiose</strong>. Des bactéries peuvent
          alors proliférer au mauvais endroit — dans l'intestin grêle (piste du <strong className="text-ink">SIBO</strong>) —
          ou laisser la levure <em>Candida</em> prendre le dessus. D'où ballonnements, gaz et inconfort.
        </p>
        <p className="mt-2 text-sm text-muted">
          Ce qui aide le microbiote : des <strong className="text-ink">fibres variées</strong> (prébiotiques), des
          aliments fermentés, et de la diversité dans l'assiette. C'est tout l'intérêt de noter ce que vous
          mangez et ce que vous ressentez.
        </p>
      </Section>

      <p className="mt-6 border-t border-border pt-3 text-xs text-muted">
        Schéma anatomique : Mariana Ruiz (LadyofHats), Jmarchn — traduction française Moez. Domaine public, via
        Wikimedia Commons. Schémas du transit et du microbiote : Digestor. Contenu informatif, non diagnostique.
      </p>
    </div>
  );
}

function Legend({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: TONE[tone] }} />
      {label}
    </span>
  );
}

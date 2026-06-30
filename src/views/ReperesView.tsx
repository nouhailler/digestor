import { useState } from 'react';
import { BookOpen, HeartPulse, Info, Table2 } from 'lucide-react';
import { TipBanner } from '../components/TipBanner';
import { SymptomDetailSheet } from '../components/SymptomDetailSheet';
import { EncyclopediaList } from '../components/EncyclopediaList';
import { DigestiveGuide } from '../components/DigestiveGuide';
import { findManifestation } from '../lib/encyclopedia';

interface Cell {
  label: string;
  hint: string;
}

const ROWS: [Cell, Cell][] = [
  [
    {
      label: 'Envie compulsive de sucre',
      hint: 'Le Candida se nourrit de sucre : une envie intense et répétée de sucré est un signal fréquemment rapporté.',
    },
    {
      label: 'Ballonnements dans les 1-2 h après repas',
      hint: "Ballonnement rapide après le repas : les bactéries en excès dans l'intestin grêle fermentent vite les glucides — typique du SIBO.",
    },
  ],
  [
    {
      label: 'Démangeaisons, mycoses',
      hint: 'Mycoses (cutanées, buccales, vaginales) et démangeaisons : possibles signes d’une prolifération fongique.',
    },
    {
      label: 'Gaz excessifs (surtout hydrogène = SIBO H2)',
      hint: 'Production de gaz élevée. Un excès d’hydrogène (H2) au test respiratoire oriente vers un SIBO à hydrogène.',
    },
  ],
  [
    {
      label: 'Brouillard mental persistant',
      hint: 'Difficultés de concentration durables, parfois attribuées aux sous-produits fongiques (lien encore débattu).',
    },
    {
      label: 'Alternance diarrhée / constipation',
      hint: 'Transit instable alternant selles molles et constipation : profil fréquent du SII (forme mixte).',
    },
  ],
  [
    {
      label: 'Fatigue chronique',
      hint: 'Fatigue persistante non expliquée par le manque de sommeil.',
    },
    {
      label: 'Selles mal formées (Bristol 6-7 ou 1-2)',
      hint: 'Selles aux extrêmes de l’échelle de Bristol : types 1-2 (dures, constipation) ou 6-7 (molles à liquides).',
    },
  ],
  [
    {
      label: 'Enduit lingual blanc',
      hint: 'Dépôt blanchâtre sur la langue (muguet), évocateur d’une candidose buccale.',
    },
    {
      label: 'Douleurs qui soulagent après évacuation',
      hint: 'Douleur abdominale soulagée par la défécation : critère évocateur du SII (critères de Rome IV).',
    },
  ],
];

interface ReperesViewProps {
  onAbout: () => void;
  onOpenAiSettings: () => void;
}

type SubTab = 'reperes' | 'encyclopedie' | 'systeme';

export function ReperesView({ onAbout, onOpenAiSettings }: ReperesViewProps) {
  const [tab, setTab] = useState<SubTab>('reperes');
  const [selected, setSelected] = useState<Cell | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-4 pb-28">
      <h2 className="mb-3 text-xl font-semibold text-ink">Repères</h2>

      {/* Sous-onglets */}
      <div className="mb-4 inline-flex rounded-full border border-border p-1 text-sm">
        <SubTabButton active={tab === 'reperes'} onClick={() => setTab('reperes')} icon={<Table2 size={15} />}>
          Repères
        </SubTabButton>
        <SubTabButton active={tab === 'encyclopedie'} onClick={() => setTab('encyclopedie')} icon={<BookOpen size={15} />}>
          Encyclopédie
        </SubTabButton>
        <SubTabButton active={tab === 'systeme'} onClick={() => setTab('systeme')} icon={<HeartPulse size={15} />}>
          Système digestif
        </SubTabButton>
      </div>

      <TipBanner tab="reperes" />

      {tab === 'reperes' ? (
        <>
          <p className="mb-3 text-sm text-muted">
            Symptômes discriminants — touchez-en un pour sa fiche détaillée. Outil de repérage, non diagnostique.
          </p>

          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-surface-2 text-left">
                  <th className="w-1/2 border-b border-border px-4 py-3 font-semibold text-ink">Candidose</th>
                  <th className="w-1/2 border-b border-l border-border px-4 py-3 font-semibold text-ink">SIBO / SII</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([candida, sibo], i) => (
                  <tr key={i} className="align-top">
                    <SymptomCell cell={candida} dot="var(--color-severe)" onClick={() => setSelected(candida)} />
                    <SymptomCell cell={sibo} dot="var(--color-modere)" bordered onClick={() => setSelected(sibo)} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab('encyclopedie')}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
              style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
            >
              <BookOpen size={15} /> Plus d'informations
            </button>

            <button
              type="button"
              onClick={() => setTab('systeme')}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted hover:text-ink"
            >
              <HeartPulse size={15} /> Comprendre la digestion
            </button>

            <button
              type="button"
              onClick={onAbout}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted hover:text-ink"
            >
              <Info size={16} /> À propos & avertissement médical
            </button>
          </div>

          <AmineExplainer />
        </>
      ) : tab === 'encyclopedie' ? (
        <EncyclopediaList
          onOpenAiSettings={onOpenAiSettings}
          onSelectSymptom={(name, hint) => setSelected({ label: name, hint })}
        />
      ) : (
        <DigestiveGuide onOpenAiSettings={onOpenAiSettings} />
      )}

      <SymptomDetailSheet
        open={selected !== null}
        name={selected?.label ?? ''}
        staticHint={selected?.hint}
        onClose={() => setSelected(null)}
        onOpenAiSettings={() => {
          setSelected(null);
          onOpenAiSettings();
        }}
        onSelectRelated={(name) => setSelected({ label: name, hint: findManifestation(name) ?? '' })}
      />
    </div>
  );
}

/** Fiche explicative sur les amines biogènes (intolérance à l'histamine). */
function AmineExplainer() {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-5 text-sm">
      <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-ink">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--color-severe)' }} />
        Amines biogènes (histamine)
      </h3>
      <p className="mb-3 leading-relaxed text-muted">
        Le corps dégrade ces molécules via une enzyme (la DAO). Si l'apport alimentaire est trop élevé ou la
        dégradation insuffisante, elles s'accumulent et peuvent provoquer : démangeaisons / urticaire, rougeurs,
        maux de tête, troubles digestifs, fatigue après repas. Outre l'histamine : tyramine, putrescine, cadavérine.
      </p>
      <div className="space-y-2">
        <AmineRow color="var(--color-severe)" title="Élevé (souvent problématiques)">
          fromages affinés (parmesan, comté, roquefort), charcuteries sèches, vin / bière / cidre, choucroute,
          miso, sauce soja, kombucha ; poissons à risque (thon, maquereau, sardine, anchois — surtout mal conservés
          ou en boîte) ; banane / avocat très mûrs.
        </AmineRow>
        <AmineRow color="var(--color-modere)" title="Modéré (variable)">
          épinards, tomate (mûre), aubergine, chocolat, café, thé noir, pain au levain, jus de fruits industriels,
          fraise / agrumes / ananas (histamino-libérateurs).
        </AmineRow>
        <AmineRow color="var(--color-leger)" title="Faible (généralement bien tolérés)">
          viandes fraîches, poisson très frais ou congelé aussitôt, œufs, courgette, carotte, brocoli, salade,
          concombre, pomme, poire, raisin, melon, riz, quinoa, pomme de terre.
        </AmineRow>
      </div>
      <p className="mt-3 rounded-lg border border-border bg-surface-2 px-3 py-2 leading-relaxed text-ink">
        ⚠️ L'effet dépend de l'<strong>accumulation</strong> sur la journée et des <strong>combinaisons</strong> :
        alcool + charcuterie + fromage + fermenté déclenchent souvent, même si chaque aliment seul passe « à peu
        près ». Certains aliments libèrent l'histamine ou freinent sa dégradation (DAO).
      </p>
      <p className="mt-2 text-xs text-muted">
        La teneur en histamine varie beaucoup (fraîcheur, affinage). Repère indicatif, non médical.
      </p>
    </div>
  );
}

function AmineRow({ color, title, children }: { color: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-3 py-2">
      <span className="inline-flex items-center gap-2 font-medium" style={{ color }}>
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {title}
      </span>
      <p className="mt-0.5 text-ink">{children}</p>
    </div>
  );
}

function SubTabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
      style={{
        backgroundColor: active ? 'var(--color-surface-2)' : 'transparent',
        color: active ? 'var(--color-ink)' : 'var(--color-muted)',
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function SymptomCell({
  cell,
  dot,
  bordered,
  onClick,
}: {
  cell: Cell;
  dot: string;
  bordered?: boolean;
  onClick: () => void;
}) {
  return (
    <td className={`border-b ${bordered ? 'border-l ' : ''}border-border bg-surface px-4 py-3`}>
      <button type="button" onClick={onClick} className="flex items-start gap-2 text-left" title={cell.hint}>
        <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />
        <span className="text-ink underline decoration-dotted decoration-muted underline-offset-4">
          {cell.label}
        </span>
      </button>
    </td>
  );
}

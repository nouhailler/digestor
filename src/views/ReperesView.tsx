import { useState } from 'react';
import { BookOpen, Info, Sparkles } from 'lucide-react';
import { TipBanner } from '../components/TipBanner';
import { SymptomDetailSheet } from '../components/SymptomDetailSheet';
import { EncyclopediaSheet } from '../components/EncyclopediaSheet';

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

export function ReperesView({ onAbout, onOpenAiSettings }: ReperesViewProps) {
  const [selected, setSelected] = useState<Cell | null>(null);
  const [encyclopediaOpen, setEncyclopediaOpen] = useState(false);
  const [autoEnrich, setAutoEnrich] = useState(false);

  const openEncyclopedia = (enrich: boolean) => {
    setAutoEnrich(enrich);
    setEncyclopediaOpen(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-4 pb-28">
      <h2 className="mb-1 text-xl font-semibold text-ink">Repères</h2>
      <p className="mb-4 text-sm text-muted">
        Symptômes discriminants — touchez-en un pour sa fiche détaillée. Outil de repérage, non diagnostique.
      </p>

      <TipBanner tab="reperes" />

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

      {/* Sous le tableau : encyclopédie + enrichissement IA */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => openEncyclopedia(false)}
          title="Ouvre l'encyclopédie : tous les symptômes digestifs classés par catégorie."
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
        >
          <BookOpen size={15} /> Plus d'informations
        </button>
        <button
          type="button"
          onClick={() => openEncyclopedia(true)}
          title="Demande à l'IA des symptômes supplémentaires, ajoutés à l'encyclopédie."
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted hover:text-ink"
        >
          <Sparkles size={15} style={{ color: 'var(--color-leger)' }} /> Enrichir avec l'IA
        </button>
      </div>

      <button
        type="button"
        onClick={onAbout}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted hover:text-ink"
      >
        <Info size={16} /> À propos & avertissement médical
      </button>

      <SymptomDetailSheet
        open={selected !== null}
        name={selected?.label ?? ''}
        staticHint={selected?.hint}
        onClose={() => setSelected(null)}
        onOpenAiSettings={() => {
          setSelected(null);
          onOpenAiSettings();
        }}
      />

      <EncyclopediaSheet
        open={encyclopediaOpen}
        autoEnrich={autoEnrich}
        onClose={() => setEncyclopediaOpen(false)}
        onOpenAiSettings={() => {
          setEncyclopediaOpen(false);
          onOpenAiSettings();
        }}
        onSelectSymptom={(name, hint) => {
          setEncyclopediaOpen(false);
          setSelected({ label: name, hint });
        }}
      />
    </div>
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

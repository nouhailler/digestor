import { useState } from 'react';
import { AlertTriangle, Check, ChevronDown, ClipboardCopy, Sparkles } from 'lucide-react';
import { Sheet } from './Sheet';
import { Chip } from './Chip';
import { dayLongLabel } from '../lib/dates';
import { getDay, putDay } from '../lib/db';
import { emptyDay } from '../lib/factory';
import { CHECKPOINT_LABEL, SATIETY_TYPE_LABEL } from '../lib/satiety';
import { CLAUDE_WEB_SATIETY_PROMPT } from '../lib/satietyImportPrompt';
import {
  applySatietyToDay,
  countSatietyImport,
  parseSatietyImport,
  type ParsedSatietyImport,
} from '../lib/satietyImport';

interface SatietyImportSheetProps {
  open: boolean;
  defaultDate: string; // jour courant du Journal
  onClose: () => void;
  onImported: (date: string) => void;
}

export function SatietyImportSheet({ open, defaultDate, onClose, onImported }: SatietyImportSheetProps) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ParsedSatietyImport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  function reset() {
    setText('');
    setParsed(null);
    setError(null);
  }

  function preview() {
    setError(null);
    try {
      setParsed(parseSatietyImport(text, defaultDate));
    } catch (e) {
      setParsed(null);
      setError(e instanceof Error ? e.message : 'JSON invalide.');
    }
  }

  async function apply() {
    if (!parsed) return;
    let firstDate = defaultDate;
    for (let i = 0; i < parsed.sets.length; i++) {
      const set = parsed.sets[i];
      const date = set.date ?? defaultDate;
      if (i === 0) firstDate = date;
      const existing = (await getDay(date)) ?? emptyDay(date);
      const { day } = applySatietyToDay(existing, set);
      await putDay(day);
    }
    reset();
    onClose();
    onImported(firstDate);
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(CLAUDE_WEB_SATIETY_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard indisponible */
    }
  }

  const counts = parsed ? countSatietyImport(parsed) : null;

  return (
    <Sheet open={open} title="Importer la satiété" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <p className="text-muted">
          Décrivez votre satiété à Claude (web), puis collez ici le JSON généré. Chaque relevé sera
          rattaché au repas correspondant (par sa date et son heure).
        </p>

        {/* Aide : prompt à copier */}
        <div className="rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setShowPrompt((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-2 text-muted hover:text-ink"
          >
            <span className="inline-flex items-center gap-2">
              <Sparkles size={15} /> Comment générer ce JSON ?
            </span>
            <ChevronDown size={16} className={showPrompt ? 'rotate-180 transition' : 'transition'} />
          </button>
          {showPrompt && (
            <div className="space-y-2 border-t border-border px-3 py-3">
              <p className="text-muted">
                Créez un Projet sur claude.ai, collez le prompt ci-dessous comme instructions, puis
                décrivez votre ressenti après un repas à voix haute. Copiez sa réponse JSON ici.
              </p>
              <button
                type="button"
                onClick={copyPrompt}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-ink"
              >
                {copied ? <Check size={15} style={{ color: 'var(--color-leger)' }} /> : <ClipboardCopy size={15} />}
                {copied ? 'Copié !' : 'Copier le prompt'}
              </button>
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-surface-2 p-3 text-xs text-muted">
                {CLAUDE_WEB_SATIETY_PROMPT}
              </pre>
            </div>
          )}
        </div>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setParsed(null);
            setError(null);
          }}
          rows={5}
          placeholder='Collez ici le JSON, ex. { "app": "digestor", "type": "satiety", "sets": [ … ] }'
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-ink placeholder:text-muted"
        />

        {error && (
          <p className="rounded-lg px-3 py-2" style={{ color: 'var(--color-severe)', background: 'rgba(240,96,106,0.08)' }}>
            {error}
          </p>
        )}

        {!parsed ? (
          <button
            type="button"
            onClick={preview}
            disabled={!text.trim()}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-ink disabled:opacity-50"
          >
            Prévisualiser
          </button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {parsed.sets.map((s, si) => (
                <div key={si} className="rounded-xl border border-border bg-surface-2 p-3">
                  <h4 className="mb-2 text-ink">
                    {dayLongLabel(s.date ?? defaultDate)}
                    {s.mealTime ? ` · repas de ${s.mealTime}` : ' · dernier repas'}
                  </h4>
                  <div className="space-y-2">
                    {s.checks.map((c, ci) => (
                      <div key={ci} className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-medium text-muted">{CHECKPOINT_LABEL[c.checkpoint]}</span>
                        <Chip color="var(--color-severe)">Faim {c.hungerIntensity}</Chip>
                        <Chip color="var(--color-leger)">Énergie {c.energyLevel}</Chip>
                        <Chip color="var(--color-modere)">Sucre {c.sugarCraving}</Chip>
                        {c.satietyType && <Chip color="var(--color-absent)">{SATIETY_TYPE_LABEL[c.satietyType]}</Chip>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {counts && (
              <p className="text-xs text-muted">
                {counts.sets} repas ciblé{counts.sets > 1 ? 's' : ''} · {counts.checks} relevé
                {counts.checks > 1 ? 's' : ''}.
              </p>
            )}

            {parsed.warnings.length > 0 && (
              <div className="rounded-lg border border-border px-3 py-2">
                <p className="mb-1 inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-modere)' }}>
                  <AlertTriangle size={13} /> {parsed.warnings.length} avertissement(s)
                </p>
                <ul className="space-y-0.5 text-xs text-muted">
                  {parsed.warnings.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setParsed(null)}
                className="rounded-lg border border-border px-3 py-2.5 text-muted hover:text-ink"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={apply}
                className="flex-1 rounded-lg px-3 py-2.5 font-medium"
                style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
              >
                Importer
              </button>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}

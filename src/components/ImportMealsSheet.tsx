import { useState } from 'react';
import { AlertTriangle, Check, ChevronDown, ClipboardCopy, Sparkles } from 'lucide-react';
import { Sheet } from './Sheet';
import { Chip } from './Chip';
import {
  CATEGORY_COLOR,
  INTENSITY_COLOR,
  INTENSITY_LABEL,
  SYMPTOM_LABELS,
} from '../lib/constants';
import type { SymptomKey } from '../types';
import { classifyFood } from '../lib/foodClassifier';
import { dayLongLabel } from '../lib/dates';
import { getDay, putDay, putFoodInsight } from '../lib/db';
import { emptyDay } from '../lib/factory';
import { CLAUDE_WEB_PROMPT } from '../lib/mealImportPrompt';
import {
  collectInsights,
  countImport,
  mergeImportedDay,
  parseMealsImport,
  type MergeMode,
  type ParsedMealsImport,
} from '../lib/mealsImport';

interface ImportMealsSheetProps {
  open: boolean;
  defaultDate: string; // jour courant du Journal
  onClose: () => void;
  onImported: (date: string) => void;
}

export function ImportMealsSheet({ open, defaultDate, onClose, onImported }: ImportMealsSheetProps) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ParsedMealsImport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<MergeMode>('append');
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
      setParsed(parseMealsImport(text, defaultDate));
    } catch (e) {
      setParsed(null);
      setError(e instanceof Error ? e.message : 'JSON invalide.');
    }
  }

  async function apply() {
    if (!parsed) return;
    let firstDate = defaultDate;
    for (let i = 0; i < parsed.days.length; i++) {
      const d = parsed.days[i];
      const date = d.date ?? defaultDate;
      if (i === 0) firstDate = date;
      const existing = (await getDay(date)) ?? emptyDay(date);
      await putDay(mergeImportedDay(existing, d, mode));
    }
    // Met en cache les fiches FODMAP/SIBO/candidose fournies par l'import.
    for (const insight of collectInsights(parsed)) await putFoodInsight(insight);
    reset();
    onClose();
    onImported(firstDate);
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(CLAUDE_WEB_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard indisponible */
    }
  }

  const counts = parsed ? countImport(parsed) : null;

  return (
    <Sheet open={open} title="Importer un repas" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <p className="text-muted">
          Dictez vos repas à Claude (web), puis collez ici le JSON généré. Les repas seront ajoutés
          à la journée correspondante.
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
                décrivez vos repas à voix haute. Copiez sa réponse JSON ici.
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
                {CLAUDE_WEB_PROMPT}
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
          placeholder='Collez ici le JSON, ex. { "app": "digestor", "days": [ … ] }'
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
            {/* Mode */}
            <div className="flex gap-2">
              {(['append', 'replace'] as MergeMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  style={{
                    color: mode === m ? 'var(--color-leger)' : 'var(--color-muted)',
                    borderColor: mode === m ? 'var(--color-leger)' : 'var(--color-border)',
                    background: mode === m ? 'rgba(95,191,111,0.1)' : 'transparent',
                  }}
                >
                  {m === 'append' ? 'Ajouter aux repas' : 'Remplacer les repas'}
                </button>
              ))}
            </div>

            {/* Aperçu */}
            <div className="space-y-3">
              {parsed.days.map((d, di) => (
                <div key={di} className="rounded-xl border border-border bg-surface-2 p-3">
                  <h4 className="mb-2 text-ink">{dayLongLabel(d.date ?? defaultDate)}</h4>
                  <div className="space-y-2">
                    {d.meals.map((m, mi) => (
                      <div key={mi}>
                        <span className="text-xs text-muted">{m.time}</span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {m.foods.map((f, fi) => (
                            <Chip key={fi} color={CATEGORY_COLOR[f.category ?? classifyFood(f.name)]}>
                              {f.name}
                              {f.insight && <span className="ml-1 opacity-70">✦</span>}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {d.symptoms && Object.keys(d.symptoms).length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs uppercase tracking-wide text-muted">
                        Symptômes{d.symptomTiming ? ` (${d.symptomTiming})` : ''}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {(Object.entries(d.symptoms) as [SymptomKey, NonNullable<typeof d.symptoms>[SymptomKey]][]).map(
                          ([k, v]) => (
                            <span key={k} className="inline-flex items-center gap-1.5 text-xs text-ink">
                              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: INTENSITY_COLOR[v!] }} />
                              {SYMPTOM_LABELS[k]} · {INTENSITY_LABEL[v!].toLowerCase()}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {(d.hydrationL !== undefined || d.stool || d.digestionDelayH !== undefined) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {d.hydrationL !== undefined && (
                        <Chip color="var(--color-leger)">{d.hydrationL} L d'eau</Chip>
                      )}
                      {d.stool && (
                        <Chip color="var(--color-modere)">
                          {d.stool.label ?? 'Selles'}
                          {d.stool.count ? ` (×${d.stool.count})` : ''}
                          {d.stool.bristol ? ` · Bristol ${d.stool.bristol}` : ''}
                        </Chip>
                      )}
                      {d.digestionDelayH !== undefined && (
                        <Chip color="var(--color-absent)">Digestion ~{d.digestionDelayH} h</Chip>
                      )}
                    </div>
                  )}

                  {d.quality && <p className="mt-2 text-xs text-muted">Qualité : {d.quality}</p>}
                  {d.notes && <p className="mt-2 text-xs text-muted">Note : {d.notes}</p>}
                </div>
              ))}
            </div>

            {counts && (
              <p className="text-xs text-muted">
                {counts.meals} repas · {counts.foods} aliments
                {counts.insights > 0 ? ` · ${counts.insights} fiche(s) FODMAP` : ''}
                {counts.symptomDays > 0 ? ` · symptômes` : ''}
                {parsed.days.length > 1 ? ` · ${parsed.days.length} jours` : ''}.
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

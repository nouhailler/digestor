import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Sheet } from './Sheet';
import { getAllFoodInsights, putFoodInsight } from '../lib/db';
import {
  mergeFoodReference,
  parseFoodReference,
  type ParsedFoodReference,
  type ReferenceMergeResult,
} from '../lib/foodReferenceImport';

interface ImportFoodReferenceSheetProps {
  open: boolean;
  onClose: () => void;
  onImported?: (result: ReferenceMergeResult) => void;
}

/**
 * Importe un « référentiel d'aliments » (JSON `type: "food-reference"`), exporté
 * depuis Digestor puis complété (amines / FODMAP…), et le fusionne dans le cache
 * des fiches. Ne remplace jamais une analyse en place par des « inconnus ».
 */
export function ImportFoodReferenceSheet({ open, onClose, onImported }: ImportFoodReferenceSheetProps) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ParsedFoodReference | null>(null);
  const [preview, setPreview] = useState<{ added: number; updated: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<ReferenceMergeResult | null>(null);

  function reset() {
    setText('');
    setParsed(null);
    setPreview(null);
    setError(null);
    setDone(null);
  }

  async function doPreview() {
    setError(null);
    setDone(null);
    try {
      const p = parseFoodReference(text);
      const existing = await getAllFoodInsights();
      const { added, updated } = mergeFoodReference(existing, p.insights);
      setParsed(p);
      setPreview({ added, updated });
    } catch (e) {
      setParsed(null);
      setPreview(null);
      setError(e instanceof Error ? e.message : 'JSON invalide.');
    }
  }

  async function apply() {
    if (!parsed) return;
    setBusy(true);
    try {
      const existing = await getAllFoodInsights();
      const result = mergeFoodReference(existing, parsed.insights);
      for (const insight of result.merged) await putFoodInsight(insight);
      setDone(result);
      setParsed(null);
      setPreview(null);
      setText('');
      onImported?.(result);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} title="Importer un référentiel d'aliments" onClose={() => { reset(); onClose(); }}>
      <div className="space-y-4 text-sm">
        <p className="text-muted">
          Collez ici le JSON d'un référentiel d'aliments (exporté depuis Digestor puis complété, par
          ex. avec les profils d'amines biogènes). Les fiches sont <strong className="text-ink">fusionnées</strong> :
          les valeurs renseignées de l'import complètent l'existant, sans écraser une analyse déjà en place.
        </p>

        {done ? (
          <div className="space-y-3">
            <p className="rounded-lg px-3 py-2" style={{ color: 'var(--color-leger)', background: 'rgba(95,191,111,0.1)' }}>
              Import terminé : {done.added} aliment(s) ajouté(s), {done.updated} mis à jour.
            </p>
            <button
              type="button"
              onClick={() => { reset(); onClose(); }}
              className="w-full rounded-lg px-3 py-2.5 font-medium"
              style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setParsed(null);
                setPreview(null);
                setError(null);
              }}
              rows={6}
              placeholder='Collez ici le JSON, ex. { "type": "food-reference", "foods": [ … ] }'
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
                onClick={doPreview}
                disabled={!text.trim()}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-ink disabled:opacity-50"
              >
                Prévisualiser
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-muted">
                  {parsed.insights.length} aliment(s) lu(s)
                  {parsed.withAmines > 0 ? ` · ${parsed.withAmines} avec profil amines` : ''}
                  {preview ? ` · ${preview.added} nouveau(x), ${preview.updated} à mettre à jour` : ''}.
                </p>

                {parsed.warnings.length > 0 && (
                  <div className="rounded-lg border border-border px-3 py-2">
                    <p className="mb-1 inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-modere)' }}>
                      <AlertTriangle size={13} /> {parsed.warnings.length} avertissement(s)
                    </p>
                    <ul className="space-y-0.5 text-xs text-muted">
                      {parsed.warnings.slice(0, 12).map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                      {parsed.warnings.length > 12 && <li>… (+{parsed.warnings.length - 12})</li>}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setParsed(null); setPreview(null); }}
                    className="rounded-lg border border-border px-3 py-2.5 text-muted hover:text-ink"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={apply}
                    disabled={busy}
                    className="flex-1 rounded-lg px-3 py-2.5 font-medium disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
                  >
                    {busy ? 'Import…' : 'Importer'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Sheet>
  );
}

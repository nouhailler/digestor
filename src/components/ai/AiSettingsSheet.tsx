import { useEffect, useState } from 'react';
import { Check, ExternalLink, KeyRound, Loader2, Search } from 'lucide-react';
import { Sheet } from '../Sheet';
import { useAiConfig } from '../../hooks/useAiConfig';
import { fetchFreeModels, type FreeModel } from '../../lib/ai/openrouter';

export function AiSettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { config, save } = useAiConfig();
  const [key, setKey] = useState('');
  const [models, setModels] = useState<FreeModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  // Synchronise le champ avec la config chargée à l'ouverture.
  useEffect(() => {
    if (open && config) setKey(config.apiKey);
  }, [open, config]);

  if (!config) return null;

  async function searchModels() {
    const apiKey = key.trim();
    setLoading(true);
    setError(null);
    try {
      const list = await fetchFreeModels(apiKey);
      setModels(list);
      // Persiste la clé en même temps que la recherche réussit.
      save({ apiKey, modelId: config!.modelId });
      if (list.length === 0) setError('Aucun modèle gratuit trouvé.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec de la récupération des modèles.');
    } finally {
      setLoading(false);
    }
  }

  function saveKey() {
    save({ apiKey: key.trim(), modelId: config!.modelId });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  function selectModel(id: string) {
    save({ apiKey: key.trim() || config!.apiKey, modelId: id });
  }

  return (
    <Sheet open={open} title="Assistant IA (OpenRouter)" onClose={onClose}>
      <div className="space-y-5 text-sm">
        <p className="text-muted">
          Digestor peut interroger un modèle d'IA via{' '}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 underline"
            style={{ color: 'var(--color-leger)' }}
          >
            OpenRouter <ExternalLink size={12} />
          </a>{' '}
          pour analyser des aliments. Votre clé est <strong className="text-ink">stockée uniquement
          sur cet appareil</strong> et n'est envoyée qu'à OpenRouter.
        </p>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-muted">
            <KeyRound size={15} /> Clé API OpenRouter
          </span>
          <div className="flex gap-2">
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-or-v1-…"
              autoComplete="off"
              className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-ink placeholder:text-muted"
            />
            <button
              type="button"
              onClick={saveKey}
              className="rounded-lg border border-border px-3 text-muted hover:text-ink"
            >
              {savedFlash ? <Check size={16} style={{ color: 'var(--color-leger)' }} /> : 'OK'}
            </button>
          </div>
        </label>

        <button
          type="button"
          onClick={searchModels}
          disabled={loading || !key.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-ink disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Rechercher les modèles gratuits (:free)
        </button>

        {error && (
          <p
            className="rounded-lg px-3 py-2"
            style={{ color: 'var(--color-severe)', background: 'rgba(240,96,106,0.08)' }}
          >
            {error}
          </p>
        )}

        {models.length > 0 && (
          <div>
            <p className="mb-2 text-muted">
              {models.length} modèle{models.length > 1 ? 's' : ''} gratuit
              {models.length > 1 ? 's' : ''} — sélectionnez-en un :
            </p>
            <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {models.map((m) => {
                const selected = m.id === config.modelId;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => selectModel(m.id)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left"
                      style={{
                        borderColor: selected ? 'var(--color-leger)' : 'var(--color-border)',
                        background: selected ? 'rgba(95,191,111,0.08)' : 'transparent',
                      }}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-ink">{m.name}</span>
                        <span className="block truncate text-xs text-muted">{m.id}</span>
                      </span>
                      {selected && (
                        <Check size={16} className="shrink-0" style={{ color: 'var(--color-leger)' }} />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {config.modelId && (
          <p className="rounded-lg bg-surface-2 px-3 py-2 text-muted">
            Modèle actif : <span className="text-ink">{config.modelId}</span>
          </p>
        )}
      </div>
    </Sheet>
  );
}

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Check,
  Loader2,
  Plus,
  RefreshCw,
  Settings2,
  Shuffle,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { Sheet } from '../Sheet';
import { AiBusy } from './AiBusy';
import { Chip } from '../Chip';
import { CATEGORY_COLOR } from '../../lib/constants';
import { classifyFood } from '../../lib/foodClassifier';
import { dayLongLabel } from '../../lib/dates';
import { getDay, putDay } from '../../lib/db';
import { emptyDay, makeMeal } from '../../lib/factory';
import { buildProfileContext, hasHealthInfo } from '../../lib/profile';
import { useAiConfig } from '../../hooks/useAiConfig';
import { useProfile } from '../../hooks/useProfile';
import { useMealSuggestions } from '../../hooks/useMealSuggestions';

interface MealSuggestionsSheetProps {
  open: boolean;
  targetDate: string; // jour du Journal où ajouter
  onClose: () => void;
  onOpenAiSettings: () => void;
  onOpenJournal: () => void;
}

/** Devine une heure de repas d'après le titre de la suggestion. */
function guessTime(title: string): string {
  const t = title.toLowerCase();
  if (/petit[- ]?d|matin|déjeuner du matin|breakfast/.test(t)) return '08:00';
  if (/déjeuner|midi|lunch/.test(t)) return '12:30';
  if (/goûter|gouter|collation|snack/.test(t)) return '16:00';
  if (/dîner|diner|soir|dinner/.test(t)) return '19:30';
  return '12:00';
}

export function MealSuggestionsSheet({
  open,
  targetDate,
  onClose,
  onOpenAiSettings,
  onOpenJournal,
}: MealSuggestionsSheetProps) {
  const { config, ready } = useAiConfig();
  const { profile } = useProfile();
  const { set, loading, busyIndex, error, generate, more, regenerate } = useMealSuggestions();
  const [added, setAdded] = useState<Set<number>>(new Set());

  // Réinitialise les marqueurs « ajouté » quand le jeu change ou à l'ouverture.
  useEffect(() => {
    setAdded(new Set());
  }, [set?.updatedAt, open]);

  const ctx = () => buildProfileContext(profile);

  async function addToJournal(index: number) {
    const s = set?.suggestions[index];
    if (!s) return;
    const day = (await getDay(targetDate)) ?? emptyDay(targetDate);
    await putDay({ ...day, meals: [...day.meals, makeMeal(guessTime(s.title), s.foods)] });
    setAdded((prev) => new Set(prev).add(index));
  }

  return (
    <Sheet open={open} title="Idées de repas adaptées" onClose={onClose}>
      {!set && !ready ? (
        <div className="space-y-4 text-sm">
          <p className="text-muted">
            Pour générer des idées de repas, configurez une clé OpenRouter et un modèle gratuit.
          </p>
          <button
            type="button"
            onClick={onOpenAiSettings}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-ink"
          >
            <Settings2 size={16} /> Ouvrir les paramètres IA
          </button>
        </div>
      ) : (
        <div className="space-y-4 text-sm">
          {!set && (
            <p className="text-muted">
              Générez des idées de repas pauvres en FODMAP adaptées à votre profil
              {hasHealthInfo(profile) ? ' (allergies et intolérances prises en compte)' : ''}.
            </p>
          )}

          {set && (
            <ul className="space-y-3">
              {set.suggestions.map((s, i) => (
                <li key={i} className="rounded-xl border border-border bg-surface-2 p-3">
                  <h4 className="mb-2 flex items-center gap-2 text-ink">
                    <UtensilsCrossed size={15} className="text-muted" />
                    {s.title}
                  </h4>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {s.foods.map((f, j) => (
                      <Chip key={j} color={CATEGORY_COLOR[classifyFood(f)]}>
                        {f}
                      </Chip>
                    ))}
                  </div>
                  {s.why && <p className="mb-3 text-muted">{s.why}</p>}

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addToJournal(i)}
                      disabled={added.has(i)}
                      title={`Ajoute ce repas au Journal du ${dayLongLabel(targetDate).toLowerCase()}.`}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium disabled:opacity-60"
                      style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
                    >
                      {added.has(i) ? <Check size={14} /> : <Plus size={14} />}
                      {added.has(i) ? 'Ajouté' : 'Ajouter au journal'}
                    </button>
                    {ready && (
                      <button
                        type="button"
                        onClick={() => config && regenerate(config, ctx(), i)}
                        disabled={loading}
                        title="Remplace cette idée par une autre proposition générée par l'IA."
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-ink disabled:opacity-50"
                      >
                        {loading && busyIndex === i ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Shuffle size={13} />
                        )}
                        Autre idée
                      </button>
                    )}
                    {added.has(i) && (
                      <button type="button" onClick={onOpenJournal} className="text-xs underline" style={{ color: 'var(--color-leger)' }}>
                        Voir le Journal
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Actions globales */}
          {ready ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => config && (set ? more(config, ctx()) : generate(config, ctx()))}
                disabled={loading}
                title={set ? "Demande à l'IA d'autres idées, sans effacer les actuelles." : 'Génère un premier jeu d’idées.'}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
              >
                {loading && busyIndex === null ? <AiBusy active /> : <Sparkles size={16} />}
                {loading && busyIndex === null
                  ? 'Génération…'
                  : set
                    ? "Générer plus d'idées (IA)"
                    : 'Générer des idées'}
              </button>
              {set && (
                <button
                  type="button"
                  onClick={() => config && generate(config, ctx())}
                  disabled={loading}
                  title="Remplace toutes les idées par un nouveau jeu."
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted hover:text-ink disabled:opacity-50"
                >
                  <RefreshCw size={15} /> Tout régénérer
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAiSettings}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted hover:text-ink"
            >
              <Settings2 size={15} /> Configurer l'IA pour générer plus d'idées
            </button>
          )}

          {error && <p style={{ color: 'var(--color-severe)' }}>{error}</p>}

          {set && (
            <p className="text-xs text-muted">
              Généré par {set.model} · {format(new Date(set.updatedAt), 'd MMM à HH:mm', { locale: fr })}.
              Repère indicatif, non médical.
            </p>
          )}
        </div>
      )}
    </Sheet>
  );
}

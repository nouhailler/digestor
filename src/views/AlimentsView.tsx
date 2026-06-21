import { useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ChefHat,
  Copy,
  Eraser,
  Loader2,
  ScanLine,
  Search,
  Settings2,
  Sparkles,
  Star,
  StopCircle,
  Trash2,
  Wand2,
} from 'lucide-react';
import type { FoodInsight } from '../types';
import {
  addFavorite,
  db,
  deleteFoodEverywhere,
  deleteFoodInsight,
  getAllFoodInsights,
  putFoodInsight,
  toggleFavorite,
} from '../lib/db';
import { CATEGORY_COLOR } from '../lib/constants';
import { dateLabel } from '../lib/dates';
import { FODMAP_LEVEL_COLOR, FODMAP_LEVEL_LABEL } from '../lib/ai/insightFormat';
import { classifyFood, dictionaryFoods, looseKey, normalize } from '../lib/foodClassifier';
import { analyzeFood } from '../lib/ai/foodInsight';
import { runAiTask } from '../lib/ai/aiActivity';
import { buildProfileContext } from '../lib/profile';
import { useAiConfig } from '../hooks/useAiConfig';
import { useProfile } from '../hooks/useProfile';
import { useFavorites } from '../hooks/useFavorites';
import { useAiActivity } from '../hooks/useAiActivity';
import { FoodInsightSheet } from '../components/ai/FoodInsightSheet';
import { MealSuggestionsSheet } from '../components/ai/MealSuggestionsSheet';
import { ScanProductSheet } from '../components/ScanProductSheet';
import { TipBanner } from '../components/TipBanner';

interface AlimentsViewProps {
  onOpenAiSettings: () => void;
  date: string; // jour courant du Journal (cible des ajouts de repas)
  onOpenDay: (iso: string) => void;
}

interface FoodRow {
  key: string;
  name: string;
  insight?: FoodInsight;
  scannedAt?: string; // renseigné pour les favoris issus d'un scan
}

/** Met une majuscule initiale aux noms du dictionnaire (clés normalisées). */
function prettyName(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/** Préfixe des libellés de tâche IA pour une analyse d'aliment (cf. runAiTask). */
const FOOD_TASK_PREFIX = 'Aliment · ';

export function AlimentsView({ onOpenAiSettings, date, onOpenDay }: AlimentsViewProps) {
  const { config, ready } = useAiConfig();
  const { profile } = useProfile();
  const days = useLiveQuery(() => db.days.toArray(), []);
  const insights = useLiveQuery(() => getAllFoodInsights(), []);
  const favorites = useFavorites();
  const { labels } = useAiActivity();

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  // Contexte produit (ingrédients/marque) d'un aliment scanné, injecté à l'analyse IA.
  const [selectedDetails, setSelectedDetails] = useState<string | undefined>(undefined);
  const [scanOpen, setScanOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [scope, setScope] = useState<'repas' | 'catalogue' | 'favoris'>('catalogue');
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [bulk, setBulk] = useState<{ done: number; total: number } | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const stopRef = useRef(false);

  // Aliments des repas + fiches analysées.
  const mealRows = useMemo<FoodRow[]>(() => {
    const byKey = new Map<string, FoodRow>();
    const insightByKey = new Map((insights ?? []).map((i) => [i.key, i]));
    for (const d of days ?? [])
      for (const m of d.meals)
        for (const f of m.foods) {
          const key = normalize(f.name);
          if (key && !byKey.has(key)) byKey.set(key, { key, name: f.name, insight: insightByKey.get(key) });
        }
    for (const i of insights ?? []) if (!byKey.has(i.key)) byKey.set(i.key, { key: i.key, name: i.name, insight: i });
    return [...byKey.values()];
  }, [days, insights]);

  // Catalogue complet : dictionnaire embarqué + repas + analyses.
  const catalogueRows = useMemo<FoodRow[]>(() => {
    const byKey = new Map<string, FoodRow>(mealRows.map((r) => [r.key, r]));
    for (const f of dictionaryFoods()) {
      const key = normalize(f.name);
      if (key && !byKey.has(key)) byKey.set(key, { key, name: prettyName(f.name) });
    }
    return [...byKey.values()];
  }, [mealRows]);

  // Favoris : peuvent inclure des produits scannés absents des repas/catalogue.
  const favoriteKeys = new Set(favorites.map((f) => f.key));
  const favoriteRows = useMemo<FoodRow[]>(() => {
    const insightByKey = new Map((insights ?? []).map((i) => [i.key, i]));
    return favorites.map((f) => ({
      key: f.key,
      name: f.name,
      insight: insightByKey.get(f.key),
      scannedAt: f.scannedAt,
    }));
  }, [favorites, insights]);

  const sortByName = (a: FoodRow, b: FoodRow) => a.name.localeCompare(b.name, 'fr');
  const scopeRows = scope === 'favoris' ? favoriteRows : scope === 'catalogue' ? catalogueRows : mealRows;
  const baseRows = scopeRows.slice().sort(sortByName);

  // Aliments en cours de génération (toutes provenances : analyse en masse, fiche,
  // recherche). On les fait remonter en haut de la liste le temps de la génération,
  // pour confirmer visuellement qu'ils ont bien été lancés / créés.
  const generating = useMemo(() => {
    const out: FoodRow[] = [];
    const seen = new Set<string>();
    const byKey = new Map(baseRows.map((r) => [r.key, r]));
    for (const label of labels) {
      if (!label.startsWith(FOOD_TASK_PREFIX)) continue;
      const name = label.slice(FOOD_TASK_PREFIX.length).trim();
      const key = normalize(name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(byKey.get(key) ?? { key, name });
    }
    return out;
  }, [labels, baseRows]);
  const generatingKeys = new Set(generating.map((r) => r.key));

  const rows = [...generating, ...baseRows.filter((r) => !generatingKeys.has(r.key))];
  const unanalyzed = rows.filter((r) => !r.insight);

  // Clés présentes dans les repas du journal (pour étiqueter la provenance et
  // savoir si une suppression doit aussi nettoyer l'historique).
  const mealKeys = useMemo(() => new Set(mealRows.map((r) => r.key)), [mealRows]);

  // Un aliment n'est supprimable « définitivement » que s'il a une trace
  // effaçable : analyse en cache, favori, ou occurrence dans un repas. Les
  // entrées issues uniquement du dictionnaire embarqué ne le sont pas.
  const isDeletable = (r: FoodRow) => !!r.insight || favoriteKeys.has(r.key) || mealKeys.has(r.key);

  // Étiquettes de provenance d'un aliment, pour aider à choisir lequel garder.
  const sourceTags = (r: FoodRow): string[] => {
    const tags: string[] = [];
    if (mealKeys.has(r.key)) tags.push('journal');
    if (r.insight) tags.push('analysé');
    if (favoriteKeys.has(r.key)) tags.push('favori');
    if (tags.length === 0) tags.push('catalogue');
    return tags;
  };

  // Quasi-doublons de la portée courante : variantes proches (pluriel, accents,
  // espaces) regroupées par clé relâchée. On ne garde que les groupes de ≥ 2.
  const duplicateGroups = useMemo(() => {
    const byLoose = new Map<string, FoodRow[]>();
    for (const r of baseRows) {
      const lk = looseKey(r.name);
      if (!lk) continue;
      const arr = byLoose.get(lk);
      if (arr) arr.push(r);
      else byLoose.set(lk, [r]);
    }
    return [...byLoose.values()]
      .filter((g) => g.length >= 2)
      .sort((a, b) => a[0].name.localeCompare(b[0].name, 'fr'));
  }, [baseRows]);
  const duplicateCount = duplicateGroups.reduce((n, g) => n + g.length, 0);

  async function forgetFood(r: FoodRow) {
    const inMeals = mealKeys.has(r.key);
    const msg = inMeals
      ? `Supprimer définitivement « ${r.name} » ?\n\nCela retire son analyse, son favori ET toutes ses occurrences dans vos repas du journal. Action irréversible (cela modifie l'historique).`
      : `Supprimer définitivement « ${r.name} » ?\n\nCela retire son analyse et son favori. Action irréversible.`;
    if (!confirm(msg)) return;
    await deleteFoodEverywhere(r.key);
  }

  // Recherche combobox : préfixe à partir de 3 lettres, sur tout le catalogue.
  const q = normalize(query);
  const matches = q.length >= 3 ? catalogueRows.filter((r) => r.key.startsWith(q)).sort(sortByName).slice(0, 10) : [];
  const isNewFood = query.trim().length > 0 && !catalogueRows.some((r) => r.key === q);

  // Ouvre la fiche d'analyse d'un aliment ; `details` (ingrédients d'un produit
  // scanné) enrichit l'analyse IA. Réinitialisé pour les ouvertures non scannées.
  function openInsight(name: string, details?: string) {
    setSelectedDetails(details);
    setSelected(name);
  }

  async function runBulk() {
    if (!config) return;
    const targets = rows.filter((r) => !r.insight);
    if (targets.length === 0) return;
    if (
      targets.length > 20 &&
      !confirm(
        `Analyser ${targets.length} aliments d'affilée ? Cela enchaîne ${targets.length} requêtes IA et peut prendre du temps.`,
      )
    )
      return;
    stopRef.current = false;
    setBulkError(null);
    setBulk({ done: 0, total: targets.length });
    const ctx = buildProfileContext(profile);
    for (let i = 0; i < targets.length; i++) {
      if (stopRef.current) break;
      try {
        await runAiTask(`Aliment · ${targets[i].name}`, (signal) =>
          analyzeFood(targets[i].name, config, { profileContext: ctx, signal }).then(putFoodInsight),
        );
      } catch (e) {
        setBulkError(`« ${targets[i].name} » : ${e instanceof Error ? e.message : 'échec'}`);
        break;
      }
      setBulk({ done: i + 1, total: targets.length });
    }
    setBulk(null);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-4 pb-28">
      <h2 className="mb-1 text-xl font-semibold text-ink">Aliments</h2>
      <p className="mb-3 text-sm text-muted">
        Aliments de vos repas et catalogue embarqué, avec leur analyse FODMAP / SIBO / candidose
        (mise en cache localement).
      </p>

      {/* Portée : mes repas vs catalogue complet */}
      <div className="mb-3 inline-flex rounded-full border border-border p-1 text-xs">
        <button
          type="button"
          onClick={() => setScope('repas')}
          className="rounded-full px-3 py-1"
          style={{
            backgroundColor: scope === 'repas' ? 'var(--color-surface-2)' : 'transparent',
            color: scope === 'repas' ? 'var(--color-ink)' : 'var(--color-muted)',
          }}
        >
          De mes repas ({mealRows.length})
        </button>
        <button
          type="button"
          onClick={() => setScope('catalogue')}
          className="rounded-full px-3 py-1"
          style={{
            backgroundColor: scope === 'catalogue' ? 'var(--color-surface-2)' : 'transparent',
            color: scope === 'catalogue' ? 'var(--color-ink)' : 'var(--color-muted)',
          }}
        >
          Catalogue ({catalogueRows.length})
        </button>
        <button
          type="button"
          onClick={() => setScope('favoris')}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1"
          style={{
            backgroundColor: scope === 'favoris' ? 'var(--color-surface-2)' : 'transparent',
            color: scope === 'favoris' ? 'var(--color-ink)' : 'var(--color-muted)',
          }}
        >
          <Star size={12} fill={scope === 'favoris' ? 'currentColor' : 'none'} style={{ color: 'var(--color-modere)' }} />
          Favoris ({favorites.length})
        </button>
      </div>

      <TipBanner tab="aliments" />

      {!ready && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-sm">
          <Settings2 size={18} className="mt-0.5 shrink-0 text-muted" />
          <div className="flex-1">
            <p className="text-ink">Assistant IA non configuré.</p>
            <p className="text-muted">Ajoutez une clé OpenRouter et un modèle gratuit pour lancer des analyses.</p>
            <button
              type="button"
              onClick={onOpenAiSettings}
              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-ink"
            >
              <Settings2 size={15} /> Paramètres IA
            </button>
          </div>
        </div>
      )}

      {/* Recherche combobox dynamique */}
      <div className="relative mb-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3">
          <Search size={16} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un aliment (3 lettres min.) ou en analyser un nouveau…"
            title="Tapez au moins 3 lettres : la liste se filtre sur les aliments qui commencent par ce que vous tapez."
            className="w-full bg-transparent py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-muted hover:text-ink" aria-label="Effacer">
              ✕
            </button>
          )}
        </div>
        {(matches.length > 0 || (isNewFood && q.length >= 3)) && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
            {matches.map((r) => (
              <li key={r.key}>
                <button
                  type="button"
                  onClick={() => {
                    openInsight(r.name);
                    setQuery('');
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-2"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: CATEGORY_COLOR[r.insight?.category ?? classifyFood(r.name)] }} />
                  <span className="flex-1 truncate text-ink">{r.name}</span>
                  {r.insight ? (
                    <span className="text-xs" style={{ color: FODMAP_LEVEL_COLOR[r.insight.fodmapLevel] }}>
                      {FODMAP_LEVEL_LABEL[r.insight.fodmapLevel]}
                    </span>
                  ) : (
                    <span className="text-xs text-muted">non analysé</span>
                  )}
                </button>
              </li>
            ))}
            {isNewFood && q.length >= 3 && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    openInsight(query.trim());
                    setQuery('');
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-surface-2"
                >
                  <Sparkles size={14} style={{ color: 'var(--color-leger)' }} /> Analyser « {query.trim()} »
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Scanner un produit emballé (code-barres → Open Food Facts → analyse IA) */}
      <button
        type="button"
        onClick={() => setScanOpen(true)}
        title="Scannez le code-barres d'un produit pour savoir s'il est déconseillé (FODMAP, SIBO, candidose)."
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-ink hover:border-leger"
      >
        <ScanLine size={16} className="text-muted" /> Scanner un produit (code-barres)
      </button>

      {/* Actions : idées de repas + analyse en masse */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSuggestionsOpen(true)}
          title="Génère, via l'IA, des idées de repas pauvres en FODMAP adaptées à votre profil (allergies et intolérances respectées). Nécessite une clé OpenRouter."
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
        >
          <ChefHat size={15} /> Idées de repas adaptées
        </button>
        {unanalyzed.length > 0 &&
          (bulk ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink">
              <Loader2 size={15} className="animate-spin" /> Analyse {bulk.done}/{bulk.total}…
              <button type="button" onClick={() => (stopRef.current = true)} className="text-muted hover:text-severe" title="Arrêter">
                <StopCircle size={16} />
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={ready ? runBulk : onOpenAiSettings}
              title={ready ? 'Analyse séquentielle de tous les aliments non encore analysés.' : 'Configurez l’IA d’abord.'}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
              style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
            >
              <Wand2 size={15} /> Analyser les {unanalyzed.length} aliments non analysés
            </button>
          ))}
        <button
          type="button"
          onClick={() => setShowDuplicates((v) => !v)}
          title="Repère les aliments en double (variantes de pluriel, d'accents ou d'orthographe) pour faire le ménage."
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
          style={{
            borderColor: showDuplicates ? 'var(--color-modere)' : 'var(--color-border)',
            color: showDuplicates ? 'var(--color-modere)' : 'var(--color-ink)',
            backgroundColor: showDuplicates ? 'rgba(232,161,58,0.08)' : 'var(--color-surface-2)',
          }}
        >
          <Copy size={15} /> Trouver les doublons{duplicateCount > 0 ? ` (${duplicateCount})` : ''}
        </button>
      </div>

      {/* Panneau des doublons (variantes proches regroupées) */}
      {showDuplicates && (
        <div className="mb-5 rounded-2xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm text-muted">
            {duplicateGroups.length === 0
              ? `Aucun doublon repéré dans « ${scope === 'favoris' ? 'Favoris' : scope === 'catalogue' ? 'Catalogue' : 'De mes repas'} ». Les variantes proches (pluriel, accents, orthographe) seraient regroupées ici.`
              : `${duplicateGroups.length} groupe${duplicateGroups.length > 1 ? 's' : ''} de doublons. Gardez l'entrée à conserver et supprimez les autres.`}
          </p>
          <ul className="space-y-3">
            {duplicateGroups.map((group) => (
              <li key={looseKey(group[0].name)} className="rounded-xl border border-border bg-surface-2 p-2">
                <ul className="space-y-1.5">
                  {group.map((r) => (
                    <li key={r.key} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                      <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLOR[r.insight?.category ?? classifyFood(r.name)] }}
                      />
                      <button type="button" onClick={() => openInsight(r.name)} className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-ink">{r.name}</span>
                        <span className="block truncate text-xs text-muted">{sourceTags(r).join(' · ')}</span>
                      </button>
                      {isDeletable(r) ? (
                        <button
                          type="button"
                          onClick={() => forgetFood(r)}
                          aria-label="Supprimer définitivement"
                          title="Supprimer définitivement (analyse, favori et occurrences dans les repas)"
                          className="shrink-0 text-muted hover:text-severe"
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : (
                        <span className="shrink-0 text-xs text-muted" title="Entrée du dictionnaire embarqué : non supprimable">
                          intégré
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {bulkError && (
        <p className="mb-3 rounded-lg px-3 py-2 text-sm" style={{ color: 'var(--color-severe)', background: 'rgba(240,96,106,0.08)' }}>
          {bulkError}
        </p>
      )}

      {/* Liste de tous les aliments */}
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
          {scope === 'favoris'
            ? 'Aucun favori pour l’instant. Touchez l’étoile d’un aliment pour l’ajouter, ou scannez un produit (favori automatique).'
            : "Aucun aliment pour l'instant. Ajoutez des repas dans le Journal, ou analysez un aliment via la recherche."}
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => {
            const isGenerating = generatingKeys.has(r.key);
            const isFavorite = favoriteKeys.has(r.key);
            const subtitle = isGenerating
              ? 'Génération en cours…'
              : r.insight
                ? r.insight.summary || 'Analysé'
                : 'Non analysé — touchez pour analyser';
            return (
            <li key={r.key}>
              <div
                className="flex items-center gap-3 rounded-xl border bg-surface px-3 py-2.5"
                style={{ borderColor: isGenerating ? 'var(--color-leger)' : 'var(--color-border)' }}
              >
                {isGenerating ? (
                  <Loader2 size={14} className="shrink-0 animate-spin" style={{ color: 'var(--color-leger)' }} />
                ) : (
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLOR[r.insight?.category ?? classifyFood(r.name)] }}
                    title={r.insight ? 'Catégorie issue de l’analyse' : 'Catégorie estimée (non analysé)'}
                  />
                )}
                <button type="button" onClick={() => openInsight(r.name)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-ink">{r.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {r.scannedAt && (
                      <span style={{ color: 'var(--color-modere)' }}>Scanné le {dateLabel(r.scannedAt)} · </span>
                    )}
                    {subtitle}
                  </span>
                </button>
                {isGenerating ? (
                  <span
                    className="shrink-0 rounded-full border px-2 py-0.5 text-xs"
                    style={{ color: 'var(--color-leger)', borderColor: 'var(--color-leger)' }}
                  >
                    Génération…
                  </span>
                ) : r.insight ? (
                  <span
                    className="shrink-0 rounded-full border px-2 py-0.5 text-xs"
                    style={{ color: FODMAP_LEVEL_COLOR[r.insight.fodmapLevel], borderColor: FODMAP_LEVEL_COLOR[r.insight.fodmapLevel] }}
                    title="Niveau FODMAP global"
                  >
                    {FODMAP_LEVEL_LABEL[r.insight.fodmapLevel]}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted">
                    à analyser
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggleFavorite(r.name)}
                  aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  className="shrink-0 hover:opacity-80"
                  style={{ color: isFavorite ? 'var(--color-modere)' : 'var(--color-muted)' }}
                >
                  <Star size={15} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                {r.insight && (
                  <button
                    type="button"
                    onClick={() => deleteFoodInsight(r.key)}
                    aria-label="Effacer l'analyse"
                    title="Effacer l'analyse en cache (l'aliment reste, ré-analysable)"
                    className="shrink-0 text-muted hover:text-severe"
                  >
                    <Eraser size={15} />
                  </button>
                )}
                {isDeletable(r) && (
                  <button
                    type="button"
                    onClick={() => forgetFood(r)}
                    aria-label="Supprimer définitivement"
                    title="Supprimer définitivement (analyse, favori et occurrences dans les repas)"
                    className="shrink-0 text-muted hover:text-severe"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </li>
            );
          })}
        </ul>
      )}

      <FoodInsightSheet
        open={selected !== null}
        name={selected ?? ''}
        details={selectedDetails}
        onClose={() => setSelected(null)}
        onOpenAiSettings={() => {
          setSelected(null);
          onOpenAiSettings();
        }}
      />

      <ScanProductSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onPick={(name, details) => {
          setScanOpen(false);
          // Un produit scanné devient automatiquement favori, avec sa date de scan.
          void addFavorite(name, { scannedAt: new Date().toISOString() });
          openInsight(name, details);
        }}
      />

      <MealSuggestionsSheet
        open={suggestionsOpen}
        targetDate={date}
        onClose={() => setSuggestionsOpen(false)}
        onOpenAiSettings={() => {
          setSuggestionsOpen(false);
          onOpenAiSettings();
        }}
        onOpenJournal={() => {
          setSuggestionsOpen(false);
          onOpenDay(date);
        }}
      />
    </div>
  );
}

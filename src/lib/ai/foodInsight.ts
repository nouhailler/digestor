import type {
  AiConfig,
  FodmapGroups,
  FodmapLevel,
  FoodCategory,
  FoodInsight,
  Verdict,
} from '../../types';
import { normalize } from '../foodClassifier';
import { chatJSON } from './openrouter';

const FODMAP_LEVELS: FodmapLevel[] = ['low', 'moderate', 'high', 'unknown'];
const VERDICTS: Verdict[] = ['favorable', 'attention', 'eviter', 'inconnu'];

const SYSTEM_PROMPT = `Tu es un assistant nutrition francophone spécialisé dans l'alimentation pauvre en FODMAP, le SIBO (pullulation bactérienne de l'intestin grêle) et la candidose intestinale.
Tu réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, sans balises Markdown.
Tu es prudent et factuel : si tu n'es pas sûr, utilise la valeur "unknown" / "inconnu" plutôt que d'inventer.
Tu ne donnes pas de diagnostic médical ; tes notes restent des repères généraux.`;

function userPrompt(name: string, profileContext?: string, details?: string): string {
  return `Analyse l'aliment suivant : « ${name} ».
${details ? `\nInformations produit (issues de l'emballage, à prendre en compte pour juger les FODMAP/sucres/additifs) : ${details}\n` : ''}
Renvoie STRICTEMENT cet objet JSON (mêmes clés, mêmes valeurs autorisées) :
{
  "name": "nom court et normalisé de l'aliment, en français",
  "fodmapLevel": "low | moderate | high",
  "fodmaps": {
    "fructose": "low | moderate | high",
    "lactose": "low | moderate | high",
    "fructans": "low | moderate | high",
    "gos": "low | moderate | high",
    "polyols": "low | moderate | high"
  },
  "sibo": { "verdict": "favorable | attention | eviter", "note": "1 phrase max, en français" },
  "candida": { "verdict": "favorable | attention | eviter", "note": "1 phrase max, en français" },
  "safePortion": "portion habituellement tolérée en phase pauvre en FODMAP (ex. « 1/2 tasse, 75 g »), ou \\"\\" si non pertinent",
  "summary": "synthèse en 1 à 2 phrases, en français",
  "tips": ["1 à 3 conseils courts en français"]
}
${profileContext ? `\nContexte du profil de la personne (à prendre en compte dans les notes et conseils) : ${profileContext}` : ''}`;
}

// ---- Validation / coercition ----

function coerceLevel(v: unknown): FodmapLevel {
  return FODMAP_LEVELS.includes(v as FodmapLevel) ? (v as FodmapLevel) : 'unknown';
}

function coerceVerdict(v: unknown): Verdict {
  return VERDICTS.includes(v as Verdict) ? (v as Verdict) : 'inconnu';
}

function coerceString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function coerceGroups(v: unknown): FodmapGroups {
  const g = (v ?? {}) as Record<string, unknown>;
  return {
    fructose: coerceLevel(g.fructose),
    lactose: coerceLevel(g.lactose),
    fructans: coerceLevel(g.fructans),
    gos: coerceLevel(g.gos),
    polyols: coerceLevel(g.polyols),
  };
}

/** Catégorie de chip dérivée de l'analyse (pro / beneficial / neutral). */
export function deriveCategory(
  fodmapLevel: FodmapLevel,
  sibo: Verdict,
  candida: Verdict,
): FoodCategory {
  const avoid = fodmapLevel === 'high' || sibo === 'eviter' || candida === 'eviter';
  if (avoid) return 'pro';
  const good = fodmapLevel === 'low' && sibo === 'favorable' && candida === 'favorable';
  if (good) return 'beneficial';
  return 'neutral';
}

interface RawInsight {
  name?: unknown;
  fodmapLevel?: unknown;
  fodmaps?: unknown;
  sibo?: { verdict?: unknown; note?: unknown };
  candida?: { verdict?: unknown; note?: unknown };
  safePortion?: unknown;
  summary?: unknown;
  tips?: unknown;
}

/**
 * Construit une fiche `FoodInsight` normalisée à partir d'un objet brut
 * (réponse IA OU données fournies par un import). Tolérant : coerce chaque champ.
 */
export function buildFoodInsight(rawInput: unknown, fallbackName: string, model: string): FoodInsight {
  const raw = (rawInput ?? {}) as RawInsight;
  const fodmapLevel = coerceLevel(raw.fodmapLevel);
  const sibo = {
    verdict: coerceVerdict(raw.sibo?.verdict),
    note: coerceString(raw.sibo?.note),
  };
  const candida = {
    verdict: coerceVerdict(raw.candida?.verdict),
    note: coerceString(raw.candida?.note),
  };
  const name = coerceString(raw.name) || fallbackName;
  const tips = Array.isArray(raw.tips)
    ? raw.tips.map(coerceString).filter(Boolean).slice(0, 3)
    : [];

  return {
    key: normalize(fallbackName),
    name,
    category: deriveCategory(fodmapLevel, sibo.verdict, candida.verdict),
    fodmapLevel,
    fodmaps: coerceGroups(raw.fodmaps),
    sibo,
    candida,
    safePortion: coerceString(raw.safePortion) || undefined,
    summary: coerceString(raw.summary),
    tips,
    model,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Analyse un aliment via l'IA et renvoie une fiche normalisée.
 * Ne met pas en cache lui-même (la couche appelante décide).
 */
export async function analyzeFood(
  rawName: string,
  config: AiConfig,
  opts: { profileContext?: string; details?: string; signal?: AbortSignal } = {},
): Promise<FoodInsight> {
  const name = rawName.trim();
  if (!name) throw new Error('Nom d’aliment vide.');
  if (!config.apiKey.trim() || !config.modelId) {
    throw new Error('Configurez d’abord la clé OpenRouter et un modèle dans les paramètres IA.');
  }

  const raw = await chatJSON<RawInsight>({
    apiKey: config.apiKey,
    model: config.modelId,
    system: SYSTEM_PROMPT,
    user: userPrompt(name, opts.profileContext, opts.details),
    signal: opts.signal,
  });

  return buildFoodInsight(raw, name, config.modelId);
}

import type {
  AiConfig,
  AmineGroup,
  AmineInfo,
  AmineLevel,
  AmineTolerance,
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
const AMINE_LEVELS: AmineLevel[] = ['low', 'moderate', 'high', 'unknown'];
const AMINE_GROUPS: AmineGroup[] = ['alcool', 'fromage', 'charcuterie', 'fermente', 'poisson', 'autre'];
const AMINE_TOLERANCES: AmineTolerance[] = ['free', 'moderate', 'avoid'];

const SYSTEM_PROMPT = `Tu es un assistant nutrition francophone spécialisé dans l'alimentation pauvre en FODMAP, le SIBO (pullulation bactérienne de l'intestin grêle) et la candidose intestinale.
Tu réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, sans balises Markdown.
Tu es prudent et factuel : si tu n'es pas sûr, utilise la valeur "unknown" / "inconnu" plutôt que d'inventer.
Tu ne donnes pas de diagnostic médical ; tes notes restent des repères généraux.`;

function userPrompt(name: string, profileContext?: string, details?: string): string {
  return `Analyse l'aliment suivant : « ${name} ».
${details ? `\nInformations produit (issues de l'emballage : ingrédients, marque). À exploiter pour juger les FODMAP/sucres/additifs ET les amines biogènes — repère dans les ingrédients tout ce qui est fermenté/affiné (fromage affiné, charcuterie, sauce soja, miso, choucroute, vinaigre, levure ou extrait de levure), le poisson (surtout semi-conserve/conserve), l'alcool, le cacao, et les additifs/arômes histamino-libérateurs, pour renseigner le bloc "amines" : ${details}\n` : ''}
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
  "amines": { "level": "low | moderate | high (niveau global d'amines biogènes)", "histamine": "low | moderate | high (teneur en histamine)", "tyramine": "low | moderate | high (teneur en tyramine)", "putrescineCadaverine": "low | moderate | high (putrescine/cadavérine, potentialisent la DAO)", "histamineLiberator": true/false (déclenche la libération d'histamine endogène, même sans en contenir), "daoInhibitor": true/false (freine la DAO, l'enzyme qui dégrade l'histamine), "maoInhibitor": true/false (freine la MAO, favorise l'accumulation de tyramine), "fermented": true/false (fermenté ou affiné), "freshnessDependent": true/false (teneur dépendante de la fraîcheur/conservation), "tolerance": "free | moderate | avoid (quelle proportion une personne sensible peut consommer sans effet notable)", "toleranceNote": "précision de portion tolérée, ex. « 1 tranche fine », « ½ tomate mûre », ou \\"\\" si non pertinent", "note": "amines biogènes, 1 phrase ; précise quelle amine est en cause et tiens compte de la fermentation/affinage et de la fraîcheur" },
  "safePortion": "portion habituellement tolérée (ex. « 1/2 tasse, 75 g »), ou \\"\\" si non pertinent",
  "summary": "synthèse en 1 à 2 phrases, en français",
  "tips": ["1 à 3 conseils courts en français"]
}
IMPORTANT : si l'aliment est riche en amines biogènes, histamino-libérateur, ou inhibiteur de la DAO ou de la MAO, alors "safePortion", "summary" et "tips" DOIVENT en tenir compte (mentionner l'amine concernée, la portion prudente, la fraîcheur).${profileContext ? `\nContexte du profil de la personne (à prendre en compte dans les notes et conseils) : ${profileContext}` : ''}`;
}

// ---- Validation / coercition ----

function coerceLevel(v: unknown): FodmapLevel {
  return FODMAP_LEVELS.includes(v as FodmapLevel) ? (v as FodmapLevel) : 'unknown';
}

function coerceVerdict(v: unknown): Verdict {
  return VERDICTS.includes(v as Verdict) ? (v as Verdict) : 'inconnu';
}

function coerceAmineLevel(v: unknown): AmineLevel {
  return AMINE_LEVELS.includes(v as AmineLevel) ? (v as AmineLevel) : 'unknown';
}

/** Niveau par amine : ajouté seulement s'il parse en low/moderate/high (jamais 'unknown'). */
function coerceAmineDetail(v: unknown): AmineLevel | undefined {
  const lvl = coerceAmineLevel(v);
  return lvl === 'unknown' ? undefined : lvl;
}

/**
 * Coerce un bloc amines biogènes ; renvoie undefined si rien d'exploitable.
 * Le schéma « public » (prompts / import / export) nomme les flags
 * `histamineLiberator` / `daoInhibitor` ; le stockage interne garde
 * `liberator` / `daoBlocker`. On accepte donc les deux (alias).
 */
function coerceAmines(v: unknown): AmineInfo | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const info: AmineInfo = { level: coerceAmineLevel(o.level) };
  // Détail par amine
  const histamine = coerceAmineDetail(o.histamine);
  if (histamine) info.histamine = histamine;
  const tyramine = coerceAmineDetail(o.tyramine);
  if (tyramine) info.tyramine = tyramine;
  const putrescineCadaverine = coerceAmineDetail(o.putrescineCadaverine);
  if (putrescineCadaverine) info.putrescineCadaverine = putrescineCadaverine;
  // Mécanismes (alias publics acceptés)
  if (o.liberator === true || o.histamineLiberator === true) info.liberator = true;
  if (o.daoBlocker === true || o.daoInhibitor === true) info.daoBlocker = true;
  if (o.maoInhibitor === true) info.maoInhibitor = true;
  if (o.fermented === true) info.fermented = true;
  if (o.freshnessDependent === true) info.freshnessDependent = true;
  if (AMINE_GROUPS.includes(o.group as AmineGroup)) info.group = o.group as AmineGroup;
  if (AMINE_TOLERANCES.includes(o.tolerance as AmineTolerance)) info.tolerance = o.tolerance as AmineTolerance;
  const toleranceNote = coerceString(o.toleranceNote);
  if (toleranceNote) info.toleranceNote = toleranceNote;
  const note = coerceString(o.note);
  if (note) info.note = note;
  // Rien d'utile (niveau inconnu et aucun détail/flag/note) → on n'ajoute pas le bloc.
  if (
    info.level === 'unknown' &&
    !info.histamine &&
    !info.tyramine &&
    !info.putrescineCadaverine &&
    !info.liberator &&
    !info.daoBlocker &&
    !info.maoInhibitor &&
    !info.fermented &&
    !info.freshnessDependent &&
    !info.group &&
    !info.tolerance &&
    !info.toleranceNote &&
    !info.note
  ) {
    return undefined;
  }
  return info;
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
  amines?: unknown;
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
    amines: coerceAmines(raw.amines),
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

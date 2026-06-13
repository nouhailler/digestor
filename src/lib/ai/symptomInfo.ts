import type { AiConfig, EncyclopediaExtra, EncyclopediaExtraItem, SymptomInfo } from '../../types';
import { normalize } from '../foodClassifier';
import { chatJSON } from './openrouter';

// ---- Fiche détaillée d'un symptôme ----

const DETAIL_SYSTEM = `Tu es un assistant pédagogique francophone en santé digestive (FODMAP, SIBO, SII, candidose).
Tu expliques un symptôme de façon claire, factuelle et prudente, pour un usage de repérage (non diagnostique).
Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte ni Markdown autour.`;

function detailPrompt(name: string, profileContext?: string): string {
  return `Explique le symptôme digestif : « ${name} ».
${profileContext ? `Contexte de la personne (à prendre en compte avec prudence) : ${profileContext}\n` : ''}
Renvoie STRICTEMENT cet objet JSON :
{
  "origine": "d'où cela vient, mécanismes plausibles (2-3 phrases, en français)",
  "manifestation": "comment cela se manifeste concrètement (1-2 phrases)",
  "effets": ["principaux effets / conséquences (1 à 4 éléments)"],
  "conseils": ["pistes concrètes pour l'éviter ou l'atténuer (1 à 5 éléments)"],
  "related": ["2 à 4 symptômes digestifs liés, en français (noms courts)"]
}`;
}

function strArray(v: unknown, max: number): string[] {
  return Array.isArray(v)
    ? v.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean).slice(0, max)
    : [];
}

interface RawDetail {
  origine?: unknown;
  manifestation?: unknown;
  effets?: unknown;
  conseils?: unknown;
  related?: unknown;
}

export function toSymptomInfo(raw: RawDetail, name: string, model: string): SymptomInfo {
  return {
    key: normalize(name),
    name,
    origine: typeof raw.origine === 'string' ? raw.origine.trim() : '',
    manifestation: typeof raw.manifestation === 'string' ? raw.manifestation.trim() : '',
    effets: strArray(raw.effets, 4),
    conseils: strArray(raw.conseils, 5),
    related: strArray(raw.related, 4),
    model,
    updatedAt: new Date().toISOString(),
  };
}

export async function explainSymptom(
  name: string,
  config: AiConfig,
  opts: { profileContext?: string; signal?: AbortSignal } = {},
): Promise<SymptomInfo> {
  if (!config.apiKey.trim() || !config.modelId)
    throw new Error('Configurez d’abord la clé OpenRouter et un modèle dans les paramètres IA.');
  const raw = await chatJSON<RawDetail>({
    apiKey: config.apiKey,
    model: config.modelId,
    system: DETAIL_SYSTEM,
    user: detailPrompt(name, opts.profileContext),
    signal: opts.signal,
  });
  return toSymptomInfo(raw, name, config.modelId);
}

// ---- Enrichissement de l'encyclopédie ----

const ENRICH_SYSTEM = `Tu es un assistant pédagogique francophone en santé digestive.
Tu proposes des symptômes digestifs supplémentaires, classés par catégorie, avec une manifestation
courte chacun. Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte ni Markdown autour.`;

function enrichPrompt(existing: string[]): string {
  return `Propose 6 à 10 symptômes digestifs supplémentaires (non déjà listés) utiles à une personne
suivant candidose / SIBO / SII, avec leur manifestation.
Déjà listés (à ne PAS répéter) : ${existing.join(' ; ')}.
Utilise des catégories parmi : « Œsophage & estomac (digestif haut) », « Intestin & côlon (digestif bas) »,
« Selles & transit », « Signes systémiques / extra-digestifs », « Signes d’alarme (consulter un médecin) ».
Renvoie STRICTEMENT cet objet JSON :
{
  "items": [
    { "category": "une des catégories ci-dessus", "name": "nom du symptôme", "manifestation": "1 phrase" }
  ]
}`;
}

function coerceItems(v: unknown): EncyclopediaExtraItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x): EncyclopediaExtraItem | null => {
      const o = (x ?? {}) as Record<string, unknown>;
      const name = typeof o.name === 'string' ? o.name.trim() : '';
      const category = typeof o.category === 'string' ? o.category.trim() : '';
      const manifestation = typeof o.manifestation === 'string' ? o.manifestation.trim() : '';
      if (!name || !category) return null;
      return { category, name, manifestation };
    })
    .filter((x): x is EncyclopediaExtraItem => x !== null)
    .slice(0, 12);
}

interface RawEnrich {
  items?: unknown;
}

export function toEncyclopediaExtra(raw: RawEnrich, model: string): EncyclopediaExtra {
  return { items: coerceItems(raw.items), model, updatedAt: new Date().toISOString() };
}

export async function enrichEncyclopedia(
  config: AiConfig,
  existing: string[],
  opts: { signal?: AbortSignal } = {},
): Promise<EncyclopediaExtra> {
  if (!config.apiKey.trim() || !config.modelId)
    throw new Error('Configurez d’abord la clé OpenRouter et un modèle dans les paramètres IA.');
  const raw = await chatJSON<RawEnrich>({
    apiKey: config.apiKey,
    model: config.modelId,
    system: ENRICH_SYSTEM,
    user: enrichPrompt(existing),
    signal: opts.signal,
  });
  const extra = toEncyclopediaExtra(raw, config.modelId);
  if (extra.items.length === 0) throw new Error('Aucun symptôme exploitable. Réessayez.');
  return extra;
}

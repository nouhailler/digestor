import type { AiConfig, MealSuggestion, MealSuggestionSet } from '../../types';
import { chatJSON } from './openrouter';

const SYSTEM_PROMPT = `Tu es un assistant nutrition francophone spécialisé FODMAP, SIBO et candidose intestinale.
Tu proposes des idées de repas simples, adaptées et pauvres en FODMAP, en respectant strictement
les allergies et intolérances indiquées. Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte
ni Markdown autour. Tu ne poses pas de diagnostic.`;

function userPrompt(count: number, profileContext?: string, avoid: string[] = []): string {
  const variety =
    count === 1
      ? "1 idée de repas adaptée (différente de celles déjà proposées)."
      : `${count} idées de repas adaptées (variées : matin / midi / soir / collation).`;
  return `Propose ${variety}
${profileContext ? `Profil de la personne (à respecter, surtout les allergies) : ${profileContext}\n` : ''}${
    avoid.length
      ? `Ne repropose PAS ces repas déjà suggérés, trouve des idées différentes : ${avoid.join(' ; ')}.\n`
      : ''
  }Renvoie STRICTEMENT cet objet JSON :
{
  "suggestions": [
    {
      "title": "titre court du repas, en français",
      "foods": ["aliment 1", "aliment 2", "…"],
      "why": "pourquoi c'est adapté (1 phrase, en français)"
    }
  ]
}`;
}

function coerceSuggestions(v: unknown): MealSuggestion[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((s): MealSuggestion | null => {
      const o = (s ?? {}) as Record<string, unknown>;
      const title = typeof o.title === 'string' ? o.title.trim() : '';
      const why = typeof o.why === 'string' ? o.why.trim() : '';
      const foods = Array.isArray(o.foods)
        ? o.foods.map((f) => (typeof f === 'string' ? f.trim() : '')).filter(Boolean)
        : [];
      if (!title && foods.length === 0) return null;
      return { title: title || 'Repas', foods, why };
    })
    .filter((x): x is MealSuggestion => x !== null)
    .slice(0, 8);
}

interface RawSuggestions {
  suggestions?: unknown;
}

export function toSuggestionSet(raw: RawSuggestions, model: string): MealSuggestionSet {
  return {
    suggestions: coerceSuggestions(raw.suggestions),
    model,
    updatedAt: new Date().toISOString(),
  };
}

export async function suggestMeals(
  config: AiConfig,
  opts: { profileContext?: string; signal?: AbortSignal; count?: number; avoid?: string[] } = {},
): Promise<MealSuggestionSet> {
  if (!config.apiKey.trim() || !config.modelId) {
    throw new Error('Configurez d’abord la clé OpenRouter et un modèle dans les paramètres IA.');
  }
  const raw = await chatJSON<RawSuggestions>({
    apiKey: config.apiKey,
    model: config.modelId,
    system: SYSTEM_PROMPT,
    user: userPrompt(opts.count ?? 4, opts.profileContext, opts.avoid),
    signal: opts.signal,
  });
  const set = toSuggestionSet(raw, config.modelId);
  if (set.suggestions.length === 0) throw new Error('Aucune suggestion exploitable. Réessayez.');
  return set;
}

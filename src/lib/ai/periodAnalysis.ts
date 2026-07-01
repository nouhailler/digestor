import type { AiConfig, DayEntry, DayImprovement, PeriodAnalysis, Verdict } from '../../types';
import { describePeriod } from '../periodReport';
import { chatJSON } from './openrouter';

const VERDICTS: Verdict[] = ['favorable', 'attention', 'eviter', 'inconnu'];

export type PeriodScope = PeriodAnalysis['scope'];

const SYSTEM_PROMPT = `Tu es un assistant nutrition francophone spécialisé FODMAP, SIBO et candidose intestinale.
On te fournit le RÉSUMÉ d'une période (plusieurs jours) d'un journal alimentaire et symptomatique :
fréquence des symptômes, aliments défavorables fréquents, tendances chiffrées entre le début et la fin.
Tu dégages, avec prudence, les tendances marquantes, les déclencheurs récurrents et des pistes concrètes.
Si le résumé signale une charge en amines biogènes (histamine) élevée sur plusieurs jours ET des symptômes
histaminiques (urticaire, rougeurs/bouffées, démangeaisons, maux de tête, nausées, fatigue après repas),
envisage ce lien parmi les tendances/déclencheurs et propose une piste adaptée (réduire les aliments riches
en amines, éviter les combinaisons alcool + fromage/charcuterie/fermenté, privilégier le frais).
Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte ni Markdown autour.
Tu ne poses pas de diagnostic ; tes remarques sont des repères généraux.`;

/** Clé de cache stable pour une période. */
export function periodKey(scope: PeriodScope, from: string, to: string): string {
  return scope === 'all' ? 'all' : `${scope}:${from}:${to}`;
}

function userPrompt(description: string, profileContext?: string): string {
  return `Analyse cette période :

${description}
${profileContext ? `\nProfil de la personne : ${profileContext}\n` : ''}
Renvoie STRICTEMENT cet objet JSON :
{
  "verdict": "favorable | attention | eviter",
  "summary": "synthèse de la période en 2 à 3 phrases, en français, mentionnant l'évolution",
  "trends": ["tendances marquantes observées (0 à 4 éléments, ex. « les ballonnements diminuent »)"],
  "likelyTriggers": ["aliments ou habitudes récurrents probablement en cause (0 à 4 éléments)"],
  "improvements": [
    { "action": "piste concrète", "why": "bénéfice attendu / mécanisme en 1 phrase claire" }
  ]
}
La clé "improvements" contient 1 à 4 éléments ; chaque "why" doit être renseigné.`;
}

function coerceVerdict(v: unknown): Verdict {
  return VERDICTS.includes(v as Verdict) ? (v as Verdict) : 'inconnu';
}

function coerceStringArray(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean).slice(0, max);
}

function coerceImprovements(v: unknown, max: number): DayImprovement[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x): DayImprovement | null => {
      if (typeof x === 'string') {
        const action = x.trim();
        return action ? { action, why: '' } : null;
      }
      if (x && typeof x === 'object') {
        const o = x as Record<string, unknown>;
        const action = typeof o.action === 'string' ? o.action.trim() : '';
        const why = typeof o.why === 'string' ? o.why.trim() : '';
        return action ? { action, why } : null;
      }
      return null;
    })
    .filter((x): x is DayImprovement => x !== null)
    .slice(0, max);
}

interface RawPeriodAnalysis {
  verdict?: unknown;
  summary?: unknown;
  trends?: unknown;
  likelyTriggers?: unknown;
  improvements?: unknown;
}

export function toPeriodAnalysis(
  raw: RawPeriodAnalysis,
  meta: { scope: PeriodScope; from: string; to: string },
  model: string,
): PeriodAnalysis {
  return {
    key: periodKey(meta.scope, meta.from, meta.to),
    scope: meta.scope,
    from: meta.from,
    to: meta.to,
    verdict: coerceVerdict(raw.verdict),
    summary: typeof raw.summary === 'string' ? raw.summary.trim() : '',
    trends: coerceStringArray(raw.trends, 4),
    triggers: coerceStringArray(raw.likelyTriggers, 4),
    improvements: coerceImprovements(raw.improvements, 4),
    model,
    updatedAt: new Date().toISOString(),
  };
}

export async function analyzePeriod(
  days: DayEntry[],
  meta: { scope: PeriodScope; from: string; to: string; label: string },
  config: AiConfig,
  opts: { profileContext?: string; signal?: AbortSignal } = {},
): Promise<PeriodAnalysis> {
  if (!config.apiKey.trim() || !config.modelId) {
    throw new Error('Configurez d’abord la clé OpenRouter et un modèle dans les paramètres IA.');
  }
  const raw = await chatJSON<RawPeriodAnalysis>({
    apiKey: config.apiKey,
    model: config.modelId,
    system: SYSTEM_PROMPT,
    user: userPrompt(describePeriod(days, meta.label), opts.profileContext),
    signal: opts.signal,
  });
  return toPeriodAnalysis(raw, meta, config.modelId);
}

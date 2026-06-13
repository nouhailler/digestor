import type { AiConfig, DayAnalysis, DayEntry, Verdict } from '../../types';
import { INTENSITY_LABEL, SYMPTOM_LABELS, SYMPTOM_ORDER } from '../constants';
import { chatJSON } from './openrouter';

const VERDICTS: Verdict[] = ['favorable', 'attention', 'eviter', 'inconnu'];

const SYSTEM_PROMPT = `Tu es un assistant nutrition francophone spécialisé FODMAP, SIBO et candidose intestinale.
On te fournit le journal d'une journée (repas et symptômes). Tu repères, avec prudence, les liens
plausibles entre aliments et symptômes et tu proposes des améliorations concrètes.
Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte ni Markdown autour.
Tu ne poses pas de diagnostic ; tes remarques sont des repères généraux.`;

/** Résumé lisible d'une journée pour le prompt (pur, testable). */
export function describeDay(day: DayEntry): string {
  const meals = [...day.meals]
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((m) => {
      const foods = m.foods.map((f) => `${f.name} (${f.category})`).join(', ') || '—';
      return `  - ${m.time} : ${foods}`;
    })
    .join('\n');

  const symptoms = SYMPTOM_ORDER.filter((k) => day.symptoms[k] !== 'absent')
    .map((k) => `${SYMPTOM_LABELS[k]} (${INTENSITY_LABEL[day.symptoms[k]].toLowerCase()})`)
    .join(', ');

  const lines = [`Date : ${day.date}`, `Repas :\n${meals || '  (aucun)'}`];
  lines.push(`Symptômes : ${symptoms || 'aucun'}`);
  if (day.symptomTiming) lines.push(`Moment des symptômes : ${day.symptomTiming}`);
  if (typeof day.hydrationL === 'number') lines.push(`Hydratation : ${day.hydrationL} L`);
  if (day.stool?.label) lines.push(`Transit : ${day.stool.label}${day.stool.bristol ? ` (Bristol ${day.stool.bristol})` : ''}`);
  if (day.notes) lines.push(`Notes : ${day.notes}`);
  return lines.join('\n');
}

function userPrompt(day: DayEntry, profileContext?: string): string {
  return `Analyse cette journée :

${describeDay(day)}
${profileContext ? `\nProfil de la personne : ${profileContext}\n` : ''}
Renvoie STRICTEMENT cet objet JSON :
{
  "verdict": "favorable | attention | eviter",
  "summary": "synthèse de la journée en 1 à 2 phrases, en français",
  "likelyTriggers": ["aliments ou combinaisons probablement en cause (0 à 4 éléments)"],
  "improvements": ["pistes d'amélioration concrètes (1 à 4 éléments)"]
}`;
}

function coerceVerdict(v: unknown): Verdict {
  return VERDICTS.includes(v as Verdict) ? (v as Verdict) : 'inconnu';
}

function coerceStringArray(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter(Boolean)
    .slice(0, max);
}

interface RawDayAnalysis {
  verdict?: unknown;
  summary?: unknown;
  likelyTriggers?: unknown;
  improvements?: unknown;
}

export function toDayAnalysis(raw: RawDayAnalysis, date: string, model: string): DayAnalysis {
  return {
    date,
    verdict: coerceVerdict(raw.verdict),
    summary: typeof raw.summary === 'string' ? raw.summary.trim() : '',
    likelyTriggers: coerceStringArray(raw.likelyTriggers, 4),
    improvements: coerceStringArray(raw.improvements, 4),
    model,
    updatedAt: new Date().toISOString(),
  };
}

export async function analyzeDay(
  day: DayEntry,
  config: AiConfig,
  opts: { profileContext?: string; signal?: AbortSignal } = {},
): Promise<DayAnalysis> {
  if (!config.apiKey.trim() || !config.modelId) {
    throw new Error('Configurez d’abord la clé OpenRouter et un modèle dans les paramètres IA.');
  }
  const raw = await chatJSON<RawDayAnalysis>({
    apiKey: config.apiKey,
    model: config.modelId,
    system: SYSTEM_PROMPT,
    user: userPrompt(day, opts.profileContext),
    signal: opts.signal,
  });
  return toDayAnalysis(raw, day.date, config.modelId);
}

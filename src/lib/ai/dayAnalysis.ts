import type {
  AiConfig,
  DayAnalysis,
  DayEntry,
  DayImprovement,
  FoodInsight,
  FoodItem,
  Verdict,
} from '../../types';
import { INTENSITY_LABEL, SYMPTOM_LABELS, SYMPTOM_ORDER } from '../constants';
import { effectiveDaySymptoms } from '../aggregates';
import { normalize } from '../foodClassifier';
import { formatQuantity } from '../quantity';
import { AMINE_LEVEL_LABEL, AMINE_LOAD_LABEL, amineBreakdown, classifyAmines } from '../biogenicAmines';
import { FODMAP_LEVEL_LABEL, VERDICT_LABEL } from './insightFormat';
import { chatJSON } from './openrouter';

const VERDICTS: Verdict[] = ['favorable', 'attention', 'eviter', 'inconnu'];

const SYSTEM_PROMPT = `Tu es un assistant nutrition francophone spécialisé FODMAP, SIBO et candidose intestinale.
On te fournit le journal d'une journée (repas et symptômes). Tu repères, avec prudence, les liens
plausibles entre aliments et symptômes et tu proposes des améliorations concrètes.
Quand une quantité est indiquée devant un aliment (ex. « 1 càc confiture »), tiens-en compte :
une petite portion a un impact moindre qu'une grande.
On te signale aussi la charge en amines biogènes (histamine) : si elle est élevée ET que des symptômes
histaminiques sont présents (urticaire, rougeurs/bouffées, démangeaisons, maux de tête, nausées, fatigue
après repas), envisage ce lien parmi les causes plausibles et propose une piste adaptée (réduire les
aliments riches en amines, éviter les combinaisons, privilégier le frais).
Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte ni Markdown autour.
Tu ne poses pas de diagnostic ; tes remarques sont des repères généraux.`;

/**
 * Annotation d'un aliment pour le prompt. Si une analyse IA existe pour cet
 * aliment, on injecte ses repères (niveau FODMAP, verdicts SIBO/candida) afin
 * que le bilan de la journée en tienne compte ; sinon on garde sa catégorie.
 */
function foodTag(f: FoodItem, insight?: FoodInsight): string {
  // La quantité (« 1 càc », « 150 g ») précède le nom : la portion change l'impact.
  const label = f.quantity ? `${formatQuantity(f.quantity)} ${f.name}` : f.name;
  // Amines biogènes : depuis l'analyse si dispo, sinon le dictionnaire ; signalé si notable.
  const amine = insight?.amines ?? classifyAmines(f.name);
  const amineTag =
    amine.level === 'high' || amine.level === 'moderate'
      ? `amines ${AMINE_LEVEL_LABEL[amine.level].toLowerCase()}`
      : null;
  if (!insight) return `${label} (${[f.category, amineTag].filter(Boolean).join(', ')})`;
  const parts = [`FODMAP ${FODMAP_LEVEL_LABEL[insight.fodmapLevel].toLowerCase()}`];
  if (insight.sibo.verdict !== 'inconnu') parts.push(`SIBO ${VERDICT_LABEL[insight.sibo.verdict].toLowerCase()}`);
  if (insight.candida.verdict !== 'inconnu') parts.push(`candida ${VERDICT_LABEL[insight.candida.verdict].toLowerCase()}`);
  if (amineTag) parts.push(amineTag);
  return `${label} (${parts.join(', ')})`;
}

/** Résumé lisible d'une journée pour le prompt (pur, testable). */
export function describeDay(day: DayEntry, insights?: Map<string, FoodInsight>): string {
  const meals = [...day.meals]
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((m) => {
      const foods = m.foods.map((f) => foodTag(f, insights?.get(normalize(f.name)))).join(', ') || '—';
      return `  - ${m.time} : ${foods}`;
    })
    .join('\n');

  const sym = effectiveDaySymptoms(day);
  const symptoms = SYMPTOM_ORDER.filter((k) => sym[k] !== 'absent')
    .map((k) => `${SYMPTOM_LABELS[k]} (${INTENSITY_LABEL[sym[k]].toLowerCase()})`)
    .join(', ');

  const lines = [`Date : ${day.date}`, `Repas :\n${meals || '  (aucun)'}`];
  lines.push(`Symptômes : ${symptoms || 'aucun'}`);
  // Charge en amines biogènes du jour (signalée seulement si non négligeable).
  const amine = amineBreakdown(day.meals.flatMap((m) => m.foods.map((f) => f.name)));
  if (amine.load.band !== 'faible') {
    const triggers = amine.contributors.slice(0, 6).map((c) => c.name).join(', ');
    lines.push(
      `Charge en amines biogènes (histamine) : ${AMINE_LOAD_LABEL[amine.load.band].replace('Charge ', '')}` +
        (triggers ? ` (${triggers})` : '') +
        (amine.load.combo ? ' · combinaison à risque (alcool + fromage/charcuterie/fermenté)' : ''),
    );
  }
  if (day.symptomTiming) lines.push(`Moment des symptômes : ${day.symptomTiming}`);
  if (typeof day.hydrationL === 'number') lines.push(`Hydratation : ${day.hydrationL} L`);
  if (day.stool?.label) lines.push(`Transit : ${day.stool.label}${day.stool.bristol ? ` (Bristol ${day.stool.bristol})` : ''}`);
  if (day.stress && day.stress !== 'absent') lines.push(`Stress : ${INTENSITY_LABEL[day.stress].toLowerCase()}`);
  if (typeof day.sleepH === 'number') lines.push(`Sommeil : ${day.sleepH} h`);
  if (day.menstrual) lines.push(`Cycle : règles ce jour`);
  if (day.notes) lines.push(`Notes : ${day.notes}`);
  return lines.join('\n');
}

function userPrompt(day: DayEntry, profileContext?: string, insights?: Map<string, FoodInsight>): string {
  return `Analyse cette journée :

${describeDay(day, insights)}
${profileContext ? `\nProfil de la personne : ${profileContext}\n` : ''}
Renvoie STRICTEMENT cet objet JSON :
{
  "verdict": "favorable | attention | eviter",
  "summary": "synthèse de la journée en 1 à 2 phrases, en français",
  "likelyTriggers": ["aliments ou combinaisons probablement en cause (0 à 4 éléments)"],
  "improvements": [
    {
      "action": "piste d'amélioration concrète",
      "why": "pourquoi tu la proposes : effet attendu sur les symptômes ou mécanisme (FODMAP, sucres, etc.), en 1 phrase claire et accessible"
    }
  ]
}
La clé "improvements" contient 1 à 4 éléments. Chaque "why" doit être renseigné et expliquer le bénéfice recherché ; ne laisse jamais "why" vide.`;
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

/**
 * Coerce les pistes d'amélioration. Tolère :
 * - le format objet attendu `{ action, why }` ;
 * - une simple chaîne (modèles capricieux ou ancien cache) → `why` vide.
 */
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
    improvements: coerceImprovements(raw.improvements, 4),
    model,
    updatedAt: new Date().toISOString(),
  };
}

export async function analyzeDay(
  day: DayEntry,
  config: AiConfig,
  opts: { profileContext?: string; signal?: AbortSignal; insights?: Map<string, FoodInsight> } = {},
): Promise<DayAnalysis> {
  if (!config.apiKey.trim() || !config.modelId) {
    throw new Error('Configurez d’abord la clé OpenRouter et un modèle dans les paramètres IA.');
  }
  const raw = await chatJSON<RawDayAnalysis>({
    apiKey: config.apiKey,
    model: config.modelId,
    system: SYSTEM_PROMPT,
    user: userPrompt(day, opts.profileContext, opts.insights),
    signal: opts.signal,
  });
  return toDayAnalysis(raw, day.date, config.modelId);
}

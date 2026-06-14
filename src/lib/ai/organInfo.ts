import type { AiConfig, OrganInfo } from '../../types';
import { chatJSON } from './openrouter';

/**
 * Approfondissement IA d'un organe digestif (rôle, pathologies, liens avec
 * candidose/SIBO/SII, conseils, signes d'alarme). Pas de `response_format`
 * (modèles :free) : JSON strict imposé par le prompt, puis coercition.
 */

const ORGAN_SYSTEM = `Tu es un assistant pédagogique francophone en santé digestive (FODMAP, SIBO, SII, candidose).
Tu expliques le rôle d'un organe digestif et ses troubles de façon claire, factuelle et prudente, pour un
usage de repérage (non diagnostique). Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte ni Markdown autour.`;

function organPrompt(name: string, profileContext?: string): string {
  return `Approfondis l'organe digestif : « ${name} ».
${profileContext ? `Contexte de la personne (à prendre en compte avec prudence) : ${profileContext}\n` : ''}
Renvoie STRICTEMENT cet objet JSON :
{
  "apercu": "approfondissement du rôle de l'organe dans la digestion (3-4 phrases, en français)",
  "pathologies": [
    { "name": "nom d'une pathologie de cet organe", "description": "1 phrase claire" }
  ],
  "liens": "comment cet organe est concerné par la candidose, le SIBO ou le SII (2-3 phrases)",
  "conseils": ["pistes concrètes pour préserver cet organe (1 à 5 éléments)"],
  "signesAlarme": ["signes qui doivent amener à consulter un médecin (1 à 4 éléments)"]
}
La liste "pathologies" doit contenir 3 à 6 éléments.`;
}

function strArray(v: unknown, max: number): string[] {
  return Array.isArray(v)
    ? v.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean).slice(0, max)
    : [];
}

function coercePathologies(v: unknown): { name: string; description: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x): { name: string; description: string } | null => {
      const o = (x ?? {}) as Record<string, unknown>;
      const name = typeof o.name === 'string' ? o.name.trim() : '';
      const description = typeof o.description === 'string' ? o.description.trim() : '';
      if (!name) return null;
      return { name, description };
    })
    .filter((x): x is { name: string; description: string } => x !== null)
    .slice(0, 6);
}

interface RawOrgan {
  apercu?: unknown;
  pathologies?: unknown;
  liens?: unknown;
  conseils?: unknown;
  signesAlarme?: unknown;
}

export function toOrganInfo(raw: RawOrgan, id: string, name: string, model: string): OrganInfo {
  return {
    key: id,
    name,
    apercu: typeof raw.apercu === 'string' ? raw.apercu.trim() : '',
    pathologies: coercePathologies(raw.pathologies),
    liens: typeof raw.liens === 'string' ? raw.liens.trim() : '',
    conseils: strArray(raw.conseils, 5),
    signesAlarme: strArray(raw.signesAlarme, 4),
    model,
    updatedAt: new Date().toISOString(),
  };
}

export async function explainOrgan(
  id: string,
  name: string,
  config: AiConfig,
  opts: { profileContext?: string; signal?: AbortSignal } = {},
): Promise<OrganInfo> {
  if (!config.apiKey.trim() || !config.modelId)
    throw new Error('Configurez d’abord la clé OpenRouter et un modèle dans les paramètres IA.');
  const raw = await chatJSON<RawOrgan>({
    apiKey: config.apiKey,
    model: config.modelId,
    system: ORGAN_SYSTEM,
    user: organPrompt(name, opts.profileContext),
    signal: opts.signal,
  });
  return toOrganInfo(raw, id, name, config.modelId);
}

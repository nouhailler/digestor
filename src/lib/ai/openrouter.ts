// Client minimal pour l'API OpenRouter (compatible OpenAI).
// Tous les appels sont déclenchés à la demande par l'utilisateur ; aucune
// requête réseau n'a lieu sans clé + modèle configurés.

import { parseJsonLoose } from '../json';

const BASE = 'https://openrouter.ai/api/v1';

export interface FreeModel {
  id: string;
  name: string;
  contextLength: number | null;
}

interface RawModel {
  id: string;
  name?: string;
  context_length?: number | null;
  pricing?: { prompt?: string; completion?: string };
}

/** Un modèle est « gratuit » s'il porte le suffixe :free ou un tarif nul. */
function isFree(m: RawModel): boolean {
  if (m.id.endsWith(':free')) return true;
  const p = m.pricing;
  if (!p) return false;
  return Number(p.prompt ?? '1') === 0 && Number(p.completion ?? '1') === 0;
}

async function readError(res: Response): Promise<string> {
  try {
    const json = await res.json();
    const msg = json?.error?.message ?? json?.message;
    if (msg) return `OpenRouter (${res.status}) : ${msg}`;
  } catch {
    /* corps non-JSON */
  }
  return `OpenRouter a répondu ${res.status} ${res.statusText}`;
}

/** Récupère et trie les modèles gratuits disponibles. */
export async function fetchFreeModels(apiKey: string, signal?: AbortSignal): Promise<FreeModel[]> {
  const res = await fetch(`${BASE}/models`, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    signal,
  });
  if (!res.ok) throw new Error(await readError(res));
  const json = await res.json();
  const models: RawModel[] = Array.isArray(json?.data) ? json.data : [];
  return models
    .filter(isFree)
    .map((m) => ({ id: m.id, name: m.name ?? m.id, contextLength: m.context_length ?? null }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

export interface ChatJSONParams {
  apiKey: string;
  model: string;
  system: string;
  user: string;
  signal?: AbortSignal;
}

/**
 * Envoie un prompt et renvoie la réponse parsée en JSON.
 * On n'utilise pas `response_format` (mal supporté par certains modèles
 * gratuits) : on demande du JSON strict dans le prompt et on parse en souplesse.
 */
export async function chatJSON<T>(p: ChatJSONParams): Promise<T> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${p.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof location !== 'undefined' ? location.origin : 'https://digestor.app',
      'X-Title': 'Digestor',
    },
    body: JSON.stringify({
      model: p.model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: p.system },
        { role: 'user', content: p.user },
      ],
    }),
    signal: p.signal,
  });
  if (!res.ok) throw new Error(await readError(res));
  const json = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? '';
  if (!content.trim()) throw new Error('Réponse vide du modèle.');
  try {
    return parseJsonLoose<T>(content);
  } catch {
    throw new Error("Le modèle n'a pas renvoyé de JSON exploitable. Essayez un autre modèle.");
  }
}

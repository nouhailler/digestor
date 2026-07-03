import type { FodmapGroups, FodmapLevel, FoodCategory, FoodInsight, Verdict } from '../types';
import { parseJsonLoose } from './json';
import { buildFoodInsight } from './ai/foodInsight';

/**
 * Import d'un « référentiel d'aliments » (le pendant de `foodReference.ts` /
 * `downloadFoodReference`). Lit un JSON `type: "food-reference"` — typiquement
 * exporté depuis Digestor puis complété (amines, FODMAP…) dans Claude Web — et
 * le refond dans le cache `foodInsights` en **fusionnant** (jamais de purge).
 *
 * La construction de chaque fiche réutilise `buildFoodInsight` → la coercition
 * `coerceAmines` accepte le schéma « public » de l'export (`daoInhibitor`,
 * `histamineLiberator`, détail par amine…) comme les noms internes.
 */

export const IMPORT_REFERENCE_MODEL = 'Import référentiel';

const CATEGORIES: FoodCategory[] = ['pro', 'beneficial', 'neutral'];

export interface ParsedFoodReference {
  insights: FoodInsight[]; // fiches prêtes à fusionner
  withAmines: number; // combien portent un profil amines
  warnings: string[];
}

/**
 * Parse le texte d'un référentiel. Lève une erreur si ce n'est pas un JSON
 * exploitable ou pas un référentiel d'aliments. Tolérant sur les entrées
 * individuelles (une entrée invalide devient un avertissement, pas un échec).
 */
export function parseFoodReference(text: string): ParsedFoodReference {
  const obj = parseJsonLoose(text);
  if (!obj || typeof obj !== 'object') {
    throw new Error('JSON invalide : impossible de lire le fichier.');
  }
  const o = obj as Record<string, unknown>;
  if (o.type !== 'food-reference' || !Array.isArray(o.foods)) {
    throw new Error(
      'Ce n’est pas un référentiel d’aliments Digestor (attendu : "type": "food-reference" et une liste "foods").',
    );
  }

  const warnings: string[] = [];
  const insights: FoodInsight[] = [];
  const seen = new Set<string>();
  let withAmines = 0;

  for (const raw of o.foods) {
    if (!raw || typeof raw !== 'object') {
      warnings.push(`Entrée ignorée (format inattendu) : ${JSON.stringify(raw)}.`);
      continue;
    }
    const entry = raw as Record<string, unknown>;
    const name = typeof entry.name === 'string' ? entry.name.trim() : '';
    if (!name) {
      warnings.push('Entrée sans "name" ignorée.');
      continue;
    }
    const insight = buildFoodInsight(entry, name, IMPORT_REFERENCE_MODEL);
    // Le référentiel porte une catégorie explicite : on la conserve plutôt que
    // de la re-dériver (utile pour les entrées "needsReview" à FODMAP inconnu).
    if (typeof entry.category === 'string' && CATEGORIES.includes(entry.category as FoodCategory)) {
      insight.category = entry.category as FoodCategory;
    }
    if (seen.has(insight.key)) {
      warnings.push(`Doublon dans le fichier ignoré : « ${name} ».`);
      continue;
    }
    seen.add(insight.key);
    if (insight.amines) withAmines++;
    insights.push(insight);
  }

  if (insights.length === 0) warnings.push('Aucun aliment exploitable dans le fichier.');
  return { insights, withAmines, warnings };
}

const meaningfulLevel = (l: FodmapLevel): boolean => l !== 'unknown';
const meaningfulVerdict = (v: Verdict): boolean => v !== 'inconnu';

function mergeGroups(existing: FodmapGroups, incoming: FodmapGroups): FodmapGroups {
  const keys = Object.keys(existing) as (keyof FodmapGroups)[];
  const out = {} as FodmapGroups;
  for (const k of keys) out[k] = meaningfulLevel(incoming[k]) ? incoming[k] : existing[k];
  return out;
}

/**
 * Fusionne une fiche importée dans une fiche existante : les valeurs
 * « signifiantes » de l'import gagnent (niveau ≠ unknown, verdict ≠ inconnu,
 * texte non vide, profil amines présent) ; sinon on conserve l'existant. Ainsi
 * un import (souvent centré sur les amines) n'écrase jamais une analyse déjà en
 * place avec des « inconnus ».
 */
export function mergeFoodInsight(existing: FoodInsight, incoming: FoodInsight): FoodInsight {
  return {
    key: existing.key,
    name: incoming.name || existing.name,
    // La catégorie de l'import (portée par le référentiel) est prioritaire.
    category: incoming.category,
    fodmapLevel: meaningfulLevel(incoming.fodmapLevel) ? incoming.fodmapLevel : existing.fodmapLevel,
    fodmaps: mergeGroups(existing.fodmaps, incoming.fodmaps),
    sibo: {
      verdict: meaningfulVerdict(incoming.sibo.verdict) ? incoming.sibo.verdict : existing.sibo.verdict,
      note: incoming.sibo.note || existing.sibo.note,
    },
    candida: {
      verdict: meaningfulVerdict(incoming.candida.verdict) ? incoming.candida.verdict : existing.candida.verdict,
      note: incoming.candida.note || existing.candida.note,
    },
    amines: incoming.amines ?? existing.amines,
    safePortion: incoming.safePortion || existing.safePortion,
    summary: incoming.summary || existing.summary,
    tips: incoming.tips.length ? incoming.tips : existing.tips,
    model: incoming.model,
    updatedAt: incoming.updatedAt,
  };
}

export interface ReferenceMergeResult {
  merged: FoodInsight[]; // fiches à écrire (nouvelles + mises à jour)
  added: number;
  updated: number;
}

/**
 * Rapproche les fiches importées de l'existant : renvoie la liste à écrire
 * (fusionnées pour les fiches connues, telles quelles pour les nouvelles) et le
 * décompte ajouté/mis à jour. Fonction pure — l'écriture Dexie est faite par
 * l'appelant (via `putFoodInsight`, qui complète aussi les amines du dictionnaire).
 */
export function mergeFoodReference(existing: FoodInsight[], incoming: FoodInsight[]): ReferenceMergeResult {
  const byKey = new Map(existing.map((i) => [i.key, i]));
  const merged: FoodInsight[] = [];
  let added = 0;
  let updated = 0;
  for (const ins of incoming) {
    const prev = byKey.get(ins.key);
    if (prev) {
      merged.push(mergeFoodInsight(prev, ins));
      updated++;
    } else {
      merged.push(ins);
      added++;
    }
  }
  return { merged, added, updated };
}

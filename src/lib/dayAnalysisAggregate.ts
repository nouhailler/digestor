import type { DayAnalysis } from '../types';
import { normalize } from './foodClassifier';

/**
 * Synthèse des analyses IA de journées déjà sauvegardées (table `dayAnalyses`)
 * sur une période : regroupe les déclencheurs probables et les pistes
 * d'amélioration récurrents, avec décompte des journées concernées.
 *
 * Regroupement « flou » par similarité de tokens : accents/casse ignorés
 * (`normalize`), parenthèses et mots-outils écartés — pour résumer les
 * variantes d'un même item (« pain blanc » / « Pain blanc (fructanes) »).
 * Fonctions PURES, sans I/O : aucun nouvel appel IA, on ne fait que relire
 * ce qui est en cache.
 */

/** Mots-outils français ignorés lors de la comparaison. */
const STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'au', 'aux',
  'en', 'sur', 'sous', 'par', 'pour', 'avec', 'sans', 'dans', 'ce', 'cet',
  'cette', 'ces', 'son', 'sa', 'ses', 'votre', 'vos', 'plus', 'moins', 'tres',
  'trop', 'apres', 'avant', 'qui', 'que', 'est', 'sont', 'il', 'elle', 'on',
  'ne', 'pas', 'peut', 'comme',
]);

/** Tokens significatifs d'un libellé (parenthèses retirées, mots-outils exclus). */
function tokenSet(s: string): Set<string> {
  const cleaned = normalize(s.replace(/\([^)]*\)/g, ' '));
  return new Set(cleaned.split(' ').filter((t) => t.length > 1 && !STOPWORDS.has(t)));
}

/** Deux libellés se ressemblent : l'un contient l'autre, ou Jaccard ≥ seuil. */
function similar(a: Set<string>, b: Set<string>, threshold: number): boolean {
  if (a.size === 0 || b.size === 0) return false;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  if (inter === a.size || inter === b.size) return true; // inclusion
  const union = a.size + b.size - inter;
  return inter / union >= threshold;
}

/** Variante la plus citée d'un groupe (à égalité : la plus courte). */
function pickTop(variants: Map<string, number>): string {
  let best = '';
  let bestN = -1;
  for (const [s, n] of variants) {
    if (n > bestN || (n === bestN && s.length < best.length)) {
      best = s;
      bestN = n;
    }
  }
  return best;
}

export interface RecurringItem {
  label: string; // variante représentative (la plus citée)
  why?: string; // justification représentative (pistes d'amélioration)
  count: number; // nb de journées concernées
  dates: string[]; // journées concernées, triées
}

interface RawItem {
  date: string;
  label: string;
  why?: string;
}

interface Group {
  toks: Set<string>;
  dates: Set<string>;
  variants: Map<string, number>;
  whys: Map<string, number>;
}

function aggregate(items: RawItem[], threshold: number): RecurringItem[] {
  const groups: Group[] = [];
  for (const it of items) {
    const label = it.label.trim();
    if (!label) continue;
    const toks = tokenSet(label);
    if (toks.size === 0) continue;
    let g = groups.find((g) => similar(g.toks, toks, threshold));
    if (!g) {
      g = { toks, dates: new Set(), variants: new Map(), whys: new Map() };
      groups.push(g);
    }
    // Le représentant du groupe reste le jeu de tokens le plus général (court).
    if (toks.size < g.toks.size) g.toks = toks;
    g.dates.add(it.date);
    g.variants.set(label, (g.variants.get(label) ?? 0) + 1);
    const why = (it.why ?? '').trim();
    if (why) g.whys.set(why, (g.whys.get(why) ?? 0) + 1);
  }

  return groups
    .map((g) => {
      const out: RecurringItem = {
        label: pickTop(g.variants),
        count: g.dates.size,
        dates: [...g.dates].sort(),
      };
      if (g.whys.size > 0) out.why = pickTop(g.whys);
      return out;
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'fr'));
}

/** Tous les déclencheurs probables des analyses, regroupés + comptés. */
export function aggregateTriggers(analyses: DayAnalysis[]): RecurringItem[] {
  const items: RawItem[] = analyses.flatMap((a) =>
    (a.likelyTriggers ?? []).map((t) => ({ date: a.date, label: String(t ?? '') })),
  );
  // Seuil élevé : les déclencheurs sont courts (des aliments), on ne fusionne
  // que les quasi-identiques ou les inclusions.
  return aggregate(items, 0.6);
}

/** Toutes les pistes d'amélioration des analyses, regroupées + comptées. */
export function aggregateImprovements(analyses: DayAnalysis[]): RecurringItem[] {
  const items: RawItem[] = analyses.flatMap((a) =>
    (a.improvements ?? []).map((imp) => {
      // Tolère l'ancien format en cache (simple chaîne, cf. normalizeImprovement).
      if (typeof imp === 'string') return { date: a.date, label: imp };
      return { date: a.date, label: String(imp?.action ?? ''), why: imp?.why };
    }),
  );
  // Seuil plus bas : des phrases reformulées partagent moins de tokens.
  return aggregate(items, 0.5);
}

import type { FoodQuantity, QuantityUnit } from '../types';
import { normalize } from './foodClassifier';

/**
 * Quantités d'aliments : unités proposées, formatage lisible et parsing tolérant
 * (pour l'import depuis Claude Web). La quantité est facultative : un aliment sans
 * quantité reste « non précisé ».
 */

interface UnitDef {
  key: QuantityUnit;
  short: string; // abréviation affichée (ex. « càc »)
  long: string; // libellé long (infobulle)
  plural?: string; // forme plurielle de `short` si elle varie
  step: number; // pas du sélecteur d'incrément
  default: number; // valeur initiale au choix de l'unité
}

/** Ordre d'affichage des unités dans le sélecteur. */
export const QUANTITY_UNITS: UnitDef[] = [
  { key: 'unite', short: 'nombre', long: 'nombre seul (sans unité, ex. 2 œufs)', step: 1, default: 1 },
  { key: 'cac', short: 'càc', long: 'cuillère à café', step: 0.5, default: 1 },
  { key: 'cas', short: 'càs', long: 'cuillère à soupe', step: 0.5, default: 1 },
  { key: 'pincee', short: 'pincée', long: 'pincée', plural: 'pincées', step: 1, default: 1 },
  { key: 'portion', short: 'portion', long: 'portion', plural: 'portions', step: 0.5, default: 1 },
  { key: 'poignee', short: 'poignée', long: 'poignée', plural: 'poignées', step: 0.5, default: 1 },
  { key: 'tranche', short: 'tranche', long: 'tranche', plural: 'tranches', step: 0.5, default: 1 },
  { key: 'verre', short: 'verre', long: 'verre', plural: 'verres', step: 0.5, default: 1 },
  { key: 'bol', short: 'bol', long: 'bol', plural: 'bols', step: 0.5, default: 1 },
  { key: 'g', short: 'g', long: 'grammes', step: 10, default: 50 },
  { key: 'ml', short: 'ml', long: 'millilitres', step: 10, default: 100 },
];

const UNIT_BY_KEY: Record<QuantityUnit, UnitDef> = Object.fromEntries(
  QUANTITY_UNITS.map((u) => [u.key, u]),
) as Record<QuantityUnit, UnitDef>;

export function unitDef(unit: QuantityUnit): UnitDef {
  return UNIT_BY_KEY[unit];
}

/** Borne basse : on ne descend jamais sous un pas (pas de quantité nulle/négative). */
export function clampAmount(amount: number, unit: QuantityUnit): number {
  const { step } = UNIT_BY_KEY[unit];
  const v = Math.round(amount / step) * step;
  return Math.max(step, Number(v.toFixed(2)));
}

/** Quantité par défaut au moment où on choisit une unité. */
export function defaultQuantity(unit: QuantityUnit): FoodQuantity {
  return { amount: UNIT_BY_KEY[unit].default, unit };
}

/** Nombre seul, avec demi en glyphe (« ½ », « 1½ »). */
export function formatAmount(n: number): string {
  const whole = Math.floor(n);
  const isHalf = Math.abs(n - whole - 0.5) < 1e-9;
  if (isHalf) return whole === 0 ? '½' : `${whole}½`;
  return String(Math.round(n));
}

/** Affichage compact d'une quantité, ex. « 1 càc », « 2 càs », « 150 g », « ½ portion ». */
export function formatQuantity(q: FoodQuantity): string {
  const def = UNIT_BY_KEY[q.unit];
  if (!def) return formatAmount(q.amount);
  // « nombre seul » : on n'affiche que le chiffre, sans libellé d'unité.
  if (q.unit === 'unite') return formatAmount(q.amount);
  const label = q.amount > 1 && def.plural ? def.plural : def.short;
  return `${formatAmount(q.amount)} ${label}`;
}

// ---- Parsing tolérant (import Claude Web : structuré ou texte libre) ----

const NUMBER_WORDS: Record<string, number> = {
  un: 1,
  une: 1,
  deux: 2,
  trois: 3,
  quatre: 4,
  demi: 0.5,
  'demie': 0.5,
};

const FRACTION_GLYPHS: Record<string, number> = {
  '½': 0.5,
  '¼': 0.25,
  '¾': 0.75,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
};

// Synonymes d'unités → clé canonique (clés déjà normalisées : sans accent, minuscules).
const UNIT_SYNONYMS: Record<string, QuantityUnit> = {
  unite: 'unite',
  unites: 'unite',
  cac: 'cac',
  cc: 'cac',
  'c a c': 'cac',
  'cuillere a cafe': 'cac',
  'cuilleres a cafe': 'cac',
  'cuillere cafe': 'cac',
  'petite cuillere': 'cac',
  cas: 'cas',
  cs: 'cas',
  'c a s': 'cas',
  'cuillere a soupe': 'cas',
  'cuilleres a soupe': 'cas',
  'cuillere soupe': 'cas',
  'grande cuillere': 'cas',
  cuillere: 'cas',
  cuilleres: 'cas',
  pincee: 'pincee',
  pincees: 'pincee',
  portion: 'portion',
  portions: 'portion',
  part: 'portion',
  parts: 'portion',
  poignee: 'poignee',
  poignees: 'poignee',
  tranche: 'tranche',
  tranches: 'tranche',
  verre: 'verre',
  verres: 'verre',
  bol: 'bol',
  bols: 'bol',
  g: 'g',
  gr: 'g',
  gramme: 'g',
  grammes: 'g',
  ml: 'ml',
  millilitre: 'ml',
  millilitres: 'ml',
};

function resolveUnit(text: string): QuantityUnit | null {
  const n = normalize(text);
  if (!n) return null;
  if (UNIT_SYNONYMS[n]) return UNIT_SYNONYMS[n];
  // Sinon, on retient le synonyme le plus long contenu dans le texte.
  let best: { unit: QuantityUnit; len: number } | null = null;
  for (const [syn, unit] of Object.entries(UNIT_SYNONYMS)) {
    if ((n === syn || n.includes(syn)) && (!best || syn.length > best.len)) {
      best = { unit, len: syn.length };
    }
  }
  return best?.unit ?? null;
}

function parseAmount(token: string): number | null {
  const t = token.trim();
  if (!t) return null;
  if (FRACTION_GLYPHS[t] !== undefined) return FRACTION_GLYPHS[t];
  const frac = t.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) {
    const d = Number(frac[2]);
    return d ? Number(frac[1]) / d : null;
  }
  const num = t.replace(',', '.');
  if (/^\d+(\.\d+)?$/.test(num)) return Number(num);
  const word = NUMBER_WORDS[normalize(t)];
  return word ?? null;
}

/**
 * Quantité depuis l'import : accepte un objet `{ amount, unit }` ou une chaîne
 * libre (« 1 càc », « 2 cuillères à soupe », « 150 g », « ½ verre »). Renvoie
 * `undefined` si rien d'exploitable (l'aliment reste alors sans quantité).
 */
export function parseQuantity(raw: unknown): FoodQuantity | undefined {
  if (!raw) return undefined;

  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    const unit =
      typeof o.unit === 'string' ? resolveUnit(o.unit) : null;
    const amount = typeof o.amount === 'number' ? o.amount : parseAmount(String(o.amount ?? ''));
    if (unit && amount && amount > 0) return { amount, unit };
    return undefined;
  }

  if (typeof raw !== 'string') return undefined;
  let s = raw.trim();
  if (!s) return undefined;

  // Glyphe de fraction collé au texte (« ½càc ») → on l'isole.
  for (const g of Object.keys(FRACTION_GLYPHS)) s = s.replace(g, ` ${g} `);

  // Amorce numérique : nombre décimal, fraction a/b, glyphe, ou mot-nombre.
  const m = s.match(/^\s*(\d+\s*\/\s*\d+|\d+(?:[.,]\d+)?|[½¼¾⅓⅔]|[a-zA-Zéèà]+)\s*(.*)$/);
  if (!m) return undefined;
  let amount = parseAmount(m[1]);
  let rest = m[2];
  // Si le 1er token est un mot non numérique (« pincée de sel »), pas d'amorce → défaut 1.
  if (amount === null) {
    amount = 1;
    rest = s;
  }
  const unit = resolveUnit(rest);
  if (!unit || !amount || amount <= 0) return undefined;
  return { amount: Number(amount.toFixed(2)), unit };
}

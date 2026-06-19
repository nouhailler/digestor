/**
 * Recherche d'un produit emballé via Open Food Facts (base ouverte, gratuite, sans clé).
 * Utilisé par le scan de code-barres : on récupère le nom et les ingrédients pour
 * ensuite lancer l'analyse IA (FODMAP / SIBO / candidose) sur un produit réel.
 *
 * Le cœur de l'app reste hors-ligne ; cette recherche est un appel réseau ponctuel,
 * déclenché uniquement par le scan. Seul le code-barres est envoyé à openfoodfacts.org.
 */

export interface ScannedProduct {
  barcode: string;
  name: string; // nom affiché (FR de préférence)
  brand?: string; // marque, si connue
  ingredients?: string; // liste d'ingrédients (FR de préférence)
  quantity?: string; // contenance indiquée sur l'emballage (ex. « 400 g »)
}

const FIELDS = [
  'product_name_fr',
  'product_name',
  'generic_name_fr',
  'generic_name',
  'brands',
  'ingredients_text_fr',
  'ingredients_text',
  'quantity',
].join(',');

/** Un code-barres EAN/UPC valide : 8, 12, 13 ou 14 chiffres. */
export function isValidBarcode(code: string): boolean {
  return /^\d{8}$|^\d{12,14}$/.test(code.trim());
}

function firstNonEmpty(...vals: unknown[]): string | undefined {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

/**
 * Cherche un produit par code-barres. Renvoie `null` si introuvable.
 * Lève une erreur en cas de problème réseau (l'appelant gère le repli).
 */
export async function lookupProduct(rawBarcode: string, signal?: AbortSignal): Promise<ScannedProduct | null> {
  const barcode = rawBarcode.trim();
  if (!isValidBarcode(barcode)) throw new Error('Code-barres invalide (8 à 14 chiffres attendus).');

  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=${FIELDS}&lc=fr`;
  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch {
    throw new Error('Recherche du produit impossible (hors-ligne ?).');
  }
  if (!res.ok) throw new Error('Recherche du produit indisponible pour le moment.');

  const data = (await res.json()) as { status?: number; product?: Record<string, unknown> };
  // status 0 (ou pas de produit) = code-barres inconnu d'Open Food Facts.
  if (data.status === 0 || !data.product) return null;

  const p = data.product;
  const name = firstNonEmpty(p.product_name_fr, p.product_name, p.generic_name_fr, p.generic_name);
  if (!name) return null; // produit présent mais sans nom exploitable

  return {
    barcode,
    name,
    brand: firstNonEmpty(p.brands)?.split(',')[0].trim(),
    ingredients: firstNonEmpty(p.ingredients_text_fr, p.ingredients_text),
    quantity: firstNonEmpty(p.quantity),
  };
}

/** Contexte texte (marque, ingrédients, contenance) injecté au prompt IA pour affiner l'analyse. */
export function productDetails(p: ScannedProduct): string {
  const parts: string[] = [];
  if (p.brand) parts.push(`marque : ${p.brand}`);
  if (p.quantity) parts.push(`contenance : ${p.quantity}`);
  if (p.ingredients) parts.push(`ingrédients : ${p.ingredients}`);
  return parts.join(' ; ');
}

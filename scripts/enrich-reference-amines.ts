/**
 * Enrichit docs/digestor-aliments-reference.json avec le champ `amines`
 * (depuis le classifieur d'amines biogènes), sans dupliquer la logique.
 * Usage : npx tsx scripts/enrich-reference-amines.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { classifyAmines } from '../src/lib/biogenicAmines';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REF = resolve(__dirname, '../docs/digestor-aliments-reference.json');

const doc = JSON.parse(readFileSync(REF, 'utf8')) as {
  legend?: Record<string, string>;
  foods: Array<Record<string, unknown> & { name: string; aliases?: string[] }>;
};

if (doc.legend && !doc.legend.amines) {
  doc.legend.amines =
    'amines biogènes (histamine…) : level low|moderate|high, liberator, daoBlocker, group, note';
}

let enriched = 0;
doc.foods = doc.foods.map((food) => {
  if (food.amines) return food; // déjà présent : on respecte
  // Cherche un niveau connu sur le nom puis les alias.
  const names = [food.name, ...(food.aliases ?? [])];
  let info = undefined as ReturnType<typeof classifyAmines> | undefined;
  for (const n of names) {
    const guess = classifyAmines(n);
    if (guess.level !== 'unknown') {
      info = guess;
      break;
    }
  }
  if (!info) return food;
  enriched++;
  // Réinsère les clés en plaçant `amines` juste après `candida` (ou à la fin).
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(food)) {
    out[k] = v;
    if (k === 'candida') out.amines = info;
  }
  if (!('amines' in out)) out.amines = info;
  return out as typeof food;
});

writeFileSync(REF, JSON.stringify(doc, null, 2) + '\n', 'utf8');
console.log(`Enrichi : ${enriched}/${doc.foods.length} aliments avec un profil amines.`);

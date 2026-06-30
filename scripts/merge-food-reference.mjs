#!/usr/bin/env node
// Fusionne un export Digestor (foodInsights + repas) dans le référentiel d'aliments
// docs/digestor-aliments-reference.json : ajoute les aliments ABSENTS du référentiel
// (et du dictionnaire embarqué), en reprenant la fiche analysée quand elle existe.
//
// Usage :
//   node scripts/merge-food-reference.mjs <export-digestor.json> [--out fichier.json] [--dry]
//
//   --out   chemin de sortie (défaut : on écrase docs/digestor-aliments-reference.json)
//   --dry   n'écrit rien, affiche seulement ce qui serait ajouté
//
// Les aliments sans fiche analysée sont ajoutés en « stub » (champs à 'unknown' /
// 'inconnu', marqués "needsReview": true) pour que vous — ou Claude Web — les complétiez.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REF_PATH = resolve(__dirname, '../docs/digestor-aliments-reference.json');
const DICT_PATH = resolve(__dirname, '../src/lib/foodClassifier.ts');

// ---- Normalisation (copie fidèle de foodClassifier.normalize) ----
function normalize(s) {
  return String(s)
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---- Args ----
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const outIdx = args.indexOf('--out');
const outPath = outIdx >= 0 ? resolve(process.cwd(), args[outIdx + 1]) : REF_PATH;
const inputPath = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--out');

if (!inputPath) {
  console.error('Usage : node scripts/merge-food-reference.mjs <export-digestor.json> [--out fichier.json] [--dry]');
  process.exit(1);
}

// ---- Chargement ----
const ref = JSON.parse(readFileSync(REF_PATH, 'utf8'));
const exp = JSON.parse(readFileSync(resolve(process.cwd(), inputPath), 'utf8'));
if (exp?.app !== 'digestor') {
  console.error("Ce fichier n'est pas un export Digestor (champ \"app\" attendu = \"digestor\").");
  process.exit(1);
}

// Clés déjà couvertes : référentiel (name + aliases) + dictionnaire embarqué.
const covered = new Set();
for (const f of ref.foods) {
  covered.add(normalize(f.name));
  for (const a of f.aliases ?? []) covered.add(normalize(a));
}
const dictSrc = readFileSync(DICT_PATH, 'utf8');
const dictBlock = dictSrc.slice(dictSrc.indexOf('const DICTIONARY'), dictSrc.indexOf('};', dictSrc.indexOf('const DICTIONARY')));
for (const line of dictBlock.split('\n')) {
  const m = line.match(/^\s*(?:'([^']+)'|"([^"]+)"|([a-z][a-z0-9 ]*?))\s*:\s*'(?:pro|beneficial|neutral)'/);
  if (m) covered.add(normalize(m[1] || m[2] || m[3]));
}

// ---- Collecte des aliments de l'export ----
const insightByKey = new Map();
for (const i of exp.foodInsights ?? []) insightByKey.set(i.key ?? normalize(i.name), i);

const candidates = new Map(); // key -> { name, insight? }
for (const [key, i] of insightByKey) if (key) candidates.set(key, { name: i.name, insight: i });
for (const d of exp.days ?? [])
  for (const m of d.meals ?? [])
    for (const f of m.foods ?? []) {
      const key = normalize(f.name);
      if (key && !candidates.has(key)) candidates.set(key, { name: f.name });
    }

// ---- Construction des entrées manquantes ----
const LEVELS = new Set(['low', 'moderate', 'high', 'unknown']);
const VERDICTS = new Set(['favorable', 'attention', 'eviter', 'inconnu']);
const lvl = (v) => (LEVELS.has(v) ? v : 'unknown');
const vrd = (v) => (VERDICTS.has(v) ? v : 'inconnu');

function entryFromInsight(name, ins) {
  return {
    name,
    category: ['pro', 'beneficial', 'neutral'].includes(ins.category) ? ins.category : 'neutral',
    fodmapLevel: lvl(ins.fodmapLevel),
    fodmaps: {
      fructose: lvl(ins.fodmaps?.fructose),
      lactose: lvl(ins.fodmaps?.lactose),
      fructans: lvl(ins.fodmaps?.fructans),
      gos: lvl(ins.fodmaps?.gos),
      polyols: lvl(ins.fodmaps?.polyols),
    },
    sibo: { verdict: vrd(ins.sibo?.verdict), note: String(ins.sibo?.note ?? '') },
    candida: { verdict: vrd(ins.candida?.verdict), note: String(ins.candida?.note ?? '') },
    ...(ins.safePortion ? { safePortion: String(ins.safePortion) } : {}),
    ...(ins.summary ? { summary: String(ins.summary) } : {}),
    ...(Array.isArray(ins.tips) && ins.tips.length ? { tips: ins.tips.map(String) } : {}),
  };
}

function stub(name) {
  return {
    name,
    needsReview: true,
    category: 'neutral',
    fodmapLevel: 'unknown',
    fodmaps: { fructose: 'unknown', lactose: 'unknown', fructans: 'unknown', gos: 'unknown', polyols: 'unknown' },
    sibo: { verdict: 'inconnu', note: '' },
    candida: { verdict: 'inconnu', note: '' },
  };
}

const added = [];
const stubs = [];
for (const [key, c] of candidates) {
  if (covered.has(key)) continue;
  covered.add(key);
  if (c.insight) {
    added.push(entryFromInsight(c.name, c.insight));
  } else {
    stubs.push(stub(c.name));
  }
}

const newEntries = [...added, ...stubs].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

console.log(`Référentiel actuel : ${ref.foods.length} entrées.`);
console.log(`Export : ${candidates.size} aliments distincts.`);
console.log(`À ajouter : ${newEntries.length} (${added.length} avec analyse, ${stubs.length} à compléter).`);
if (newEntries.length) {
  console.log('\nNouveaux aliments :');
  for (const e of newEntries) console.log(`  - ${e.name}${e.needsReview ? '  (à compléter)' : ''}`);
}

if (dry) {
  console.log('\n--dry : aucun fichier écrit.');
  process.exit(0);
}

ref.foods = [...ref.foods, ...newEntries];
writeFileSync(outPath, JSON.stringify(ref, null, 2) + '\n', 'utf8');
console.log(`\nÉcrit : ${outPath} (${ref.foods.length} entrées au total).`);

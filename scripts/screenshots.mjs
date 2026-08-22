#!/usr/bin/env node
/**
 * Régénère les captures d'écran de la documentation (`docs/screenshots/`).
 *
 *   npm run build && npm run preview -- --port 4173   # dans un autre terminal
 *   node scripts/screenshots.mjs
 *
 * Le script injecte un **jeu de démonstration entièrement fictif** dans
 * IndexedDB (5 semaines de journal) pour que les écrans Semaine et Évolution
 * aient de la matière, puis photographie les 5 onglets en 414×896 @2x.
 *
 * Aucune donnée réelle n'est utilisée (DOCUMENTATION_SPEC.md §13 et §50).
 */
import { chromium } from 'playwright-core';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'screenshots');
const URL_BASE = process.env.DIGESTOR_URL ?? 'http://localhost:4173';

const CHROME =
  process.env.PLAYWRIGHT_CHROMIUM ??
  ['chromium-1234', 'chromium-1228', 'chromium-1223']
    .map((v) => `${process.env.HOME}/.cache/ms-playwright/${v}/chrome-linux64/chrome`)
    .find((p) => existsSync(p));

if (!CHROME) {
  console.error("✗ Chromium introuvable. Renseignez PLAYWRIGHT_CHROMIUM avec le chemin de l'exécutable.");
  process.exit(1);
}

// ---- liste réelle des symptômes, lue dans le code (pas de doublon à maintenir)
const constants = readFileSync(join(ROOT, 'src/lib/constants.ts'), 'utf8');
const block = constants.match(/export const SYMPTOM_ORDER: SymptomKey\[\] = \[([\s\S]*?)\n\];/)[1];
const SYMPTOM_KEYS = [...block.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);

// ------------------------------------------------------------ jeu fictif

const iso = (d) => d.toISOString().slice(0, 10);
const dayBefore = (n) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return iso(d);
};

/** Petit générateur déterministe : mêmes captures d'un run à l'autre. */
let seed = 42;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

const P = (n) => ({ name: n, category: 'pro' });
const B = (n) => ({ name: n, category: 'beneficial' });
const N = (n) => ({ name: n, category: 'neutral' });

const BREAKFASTS = [
  [B('flocons d’avoine'), N('banane'), B('thé vert')],
  [B('œufs brouillés'), N('pain complet'), N('café')],
  [N('yaourt nature'), B('myrtilles'), N('café')],
  [P('pain blanc'), P('confiture'), P('jus d’orange')],
];
const LUNCHES = [
  [B('poulet rôti'), N('riz basmati'), B('courgette'), B('huile d’olive')],
  [B('saumon grillé'), B('quinoa'), B('brocoli vapeur')],
  [P('pâtes blanches'), N('sauce tomate'), N('parmesan')],
  [B('salade verte'), B('thon'), N('pomme de terre'), B('carotte')],
];
const DINNERS = [
  [B('soupe de légumes'), N('pain complet')],
  [B('omelette'), B('salade verte')],
  [P('fromage'), P('charcuterie'), P('vin rouge')],
  [B('dinde'), B('haricots verts'), N('riz basmati')],
];
const SNACKS = [[B('pomme')], [N('amandes')], [P('biscuits sucrés')], [N('chocolat noir')]];

const days = [];
for (let i = 34; i >= 0; i--) {
  const date = dayBefore(i);
  const heavy = rnd() < 0.3; // journée « chargée »
  const meals = [
    { time: '07:30', foods: pick(BREAKFASTS) },
    { time: '12:30', foods: pick(LUNCHES) },
    { time: '16:00', foods: pick(SNACKS) },
    { time: '19:30', foods: heavy ? DINNERS[2] : pick(DINNERS) },
  ];

  const symptoms = Object.fromEntries(SYMPTOM_KEYS.map((k) => [k, 'absent']));
  if (heavy) {
    symptoms.ballonnements = 'severe';
    symptoms.gaz = 'modere';
    symptoms.fatigue_apres_repas = 'modere';
    if (rnd() < 0.5) symptoms.maux_de_tete = 'modere';
    if (rnd() < 0.4) symptoms.rougeurs = 'leger';
  } else if (rnd() < 0.45) {
    symptoms.ballonnements = 'leger';
    if (rnd() < 0.4) symptoms.envie_sucre = 'leger';
  }

  days.push({
    date,
    quality: null,
    meals: meals.map((m, mi) => ({
      id: `${date}-m${mi}`,
      time: m.time,
      foods: m.foods.map((f, fi) => ({ id: `${date}-m${mi}-f${fi}`, name: f.name, category: f.category })),
      tags: mi === 1 ? ['proteine'] : mi === 2 ? ['sucre'] : undefined,
      symptoms: undefined,
      // satiété sur quelques déjeuners, pour que les courbes existent
      satiety:
        mi === 1 && i % 4 === 0
          ? [
              { checkpoint: 'immediate', hungerIntensity: 8, energyLevel: 70, sugarCraving: 10, satietyType: 'legere' },
              { checkpoint: '1h', hungerIntensity: 20, energyLevel: 65, sugarCraving: 18 },
              { checkpoint: '2h', hungerIntensity: 45, energyLevel: 55, sugarCraving: 35 },
              { checkpoint: '3h', hungerIntensity: 70, energyLevel: 45, sugarCraving: 55 },
            ]
          : undefined,
    })),
    symptoms,
    notes: '',
    hydrationL: Math.round((1.0 + rnd() * 1.2) * 10) / 10,
    stool: { bristol: heavy ? 6 : 3 + Math.floor(rnd() * 2), count: 1 + Math.floor(rnd() * 2) },
    stress: heavy ? 'modere' : 'leger',
    sleepH: Math.round((6 + rnd() * 2.5) * 10) / 10,
    menstrual: false,
  });
}

const PROFILE = {
  patientName: 'Camille (démo)',
  age: 38,
  sex: 'autre',
  conditions: ['SII', 'SIBO (suspecté)'],
  fodmapPhase: 'reintroduction',
  intolerances: ['Lactose', 'Histamine'],
  allergies: ['Fruits à coque'],
  avoidedFoods: ['oignon'],
  medicalHistory: '',
  medications: '',
  notes: '',
};

const INSIGHT_SOURCE = [
  ['banane', 'moderate', 'attention', 'favorable', 'Bien tolérée peu mûre ; les amines montent avec la maturité.'],
  ['brocoli vapeur', 'low', 'favorable', 'favorable', 'Légume vert bien toléré à portion modérée.'],
  ['fromage', 'moderate', 'attention', 'eviter', 'Fromage affiné : charge en histamine élevée.'],
  ['pain blanc', 'high', 'eviter', 'eviter', 'Farine raffinée : fermentation rapide.'],
  ['quinoa', 'low', 'favorable', 'favorable', 'Pseudo-céréale sans gluten, bien tolérée.'],
  ['riz basmati', 'low', 'favorable', 'attention', 'Amidon bien digéré, pauvre en FODMAP.'],
  ['saumon grillé', 'low', 'favorable', 'favorable', 'Protéine grasse, à consommer très frais.'],
  ['vin rouge', 'moderate', 'eviter', 'eviter', 'Alcool : libère l’histamine et freine la DAO.'],
];
const foodInsights = INSIGHT_SOURCE.map(([name, level, sibo, candida, summary]) => ({
  key: name,
  name: name.charAt(0).toUpperCase() + name.slice(1),
  category: level === 'high' ? 'pro' : level === 'low' ? 'beneficial' : 'neutral',
  fodmapLevel: level,
  fodmaps: { fructose: level, lactose: 'low', fructans: level, gos: 'low', polyols: 'low' },
  sibo: { verdict: sibo, note: summary },
  candida: { verdict: candida, note: summary },
  summary,
  tips: ['Repère de démonstration — contenu fictif.'],
  model: 'demo',
  updatedAt: new Date().toISOString(),
}));

// ------------------------------------------------------------------- capture

/** Onglet, libellé de navigation, défilement avant capture (px). */
const SHOTS = [
  ['journal', 'Journal', 0],
  // L'écran Aliments s'ouvre sur ses actions, et le catalogue complet n'est pas
  // analysé : on bascule sur « De mes repas » et on descend jusqu'à la bibliothèque.
  ['aliments', 'Aliments', 430, async (p) => p.getByRole('button', { name: /De mes repas/ }).click()],
  ['semaine', 'Semaine', 0],
  ['evolution', 'Évolution', 0],
  ['reperes', 'Repères', 0],
];

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const ctx = await browser.newContext({
  viewport: { width: 414, height: 896 },
  deviceScaleFactor: 2,
  locale: 'fr-FR',
});
const page = await ctx.newPage();

await page.goto(URL_BASE, { waitUntil: 'networkidle' });

// Remplace la base par le jeu de démonstration, puis recharge.
await page.evaluate(
  async ({ days, profile, foodInsights }) => {
    const req = indexedDB.open('digestor');
    await new Promise((res) => (req.onsuccess = res));
    const db = req.result;
    const put = (store, rows) =>
      new Promise((res) => {
        const tx = db.transaction(store, 'readwrite');
        const os = tx.objectStore(store);
        os.clear();
        for (const r of rows) os.put(r);
        tx.oncomplete = res;
      });
    await put('days', days);
    await put('foodInsights', foodInsights);
    await new Promise((res) => {
      const tx = db.transaction('meta', 'readwrite');
      const os = tx.objectStore('meta');
      os.put({ key: 'profile', value: profile });
      os.put({ key: 'onboardingDone', value: true });
      os.put({ key: 'toursSeen', value: ['journal', 'aliments', 'semaine', 'evolution', 'reperes'] });
      os.put({ key: 'lastExportAt', value: new Date().toISOString() });
      tx.oncomplete = res;
    });
  },
  { days, profile: PROFILE, foodInsights },
);

await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

// Légende repliée (état par défaut) et bandeaux d'astuce masqués : les captures
// doivent montrer le contenu de l'écran, pas ses bandeaux d'aide.
await page.evaluate(() => {
  localStorage.setItem('digestor-legend-open', '0');
  for (const t of ['journal', 'aliments', 'semaine', 'evolution', 'reperes']) {
    localStorage.setItem(`digestor-tip-dismissed-${t}`, '1');
  }
  sessionStorage.setItem('digestor-backup-reminder-dismissed', '1');
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

for (const [tab, label, scrollY, prepare] of SHOTS) {
  await page.locator('nav button', { hasText: new RegExp(`^${label}$`) }).click();
  // Les graphes (Recharts) et les requêtes Dexie ont besoin d'un instant.
  await page.waitForTimeout(tab === 'evolution' ? 3000 : 1200);
  if (prepare) {
    await prepare(page);
    await page.waitForTimeout(600);
  }
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, `${tab}.png`) });
  console.log(`✓ docs/screenshots/${tab}.png`);
}

await browser.close();
console.log('✓ 5 captures régénérées (données de démonstration fictives).');

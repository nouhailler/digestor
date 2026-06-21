import type { FoodCategory } from '../types';

/** Normalisation : minuscule, ligatures dépliées, sans accents, espaces compactés. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    // Les ligatures ne se décomposent pas via NFD : on les déplie à la main.
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Clé « relâchée » pour repérer les quasi-doublons : normalise puis déplie les
 * pluriels (`s`/`x` final des mots de ≥ 4 lettres). « Tomate » et « Tomates »,
 * « Œuf » et « Œufs » partagent ainsi la même clé relâchée. Sert UNIQUEMENT à
 * grouper les doublons à l'affichage — jamais comme clé de stockage.
 */
export function looseKey(s: string): string {
  return normalize(s)
    .split(' ')
    .map((w) => (w.length >= 4 ? w.replace(/[sx]$/, '') : w))
    .join(' ');
}

/**
 * Dictionnaire ~80 aliments français → catégorie.
 * Les clés sont normalisées ; la correspondance accepte un match partiel
 * (le terme du dictionnaire est contenu dans la saisie, ou inversement).
 */
const DICTIONARY: Record<string, FoodCategory> = {
  // ---- pro (rouge) : pro-candidose / pro-SIBO ----
  sucre: 'pro',
  'sucre blanc': 'pro',
  confiture: 'pro',
  miel: 'pro',
  patisserie: 'pro',
  gateau: 'pro',
  'biscuits sucres': 'pro',
  biscuits: 'pro',
  bonbon: 'pro',
  chocolat: 'pro',
  'chocolat au lait': 'pro',
  croissant: 'pro',
  'pain blanc': 'pro',
  baguette: 'pro',
  'farine blanche': 'pro',
  'pates blanches': 'pro',
  'riz blanc': 'pro',
  'jus orange': 'pro',
  "jus d orange": 'pro',
  'jus de fruits': 'pro',
  'jus de pomme': 'pro',
  soda: 'pro',
  cola: 'pro',
  'boisson sucree': 'pro',
  sirop: 'pro',
  banane: 'pro',
  raisin: 'pro',
  mangue: 'pro',
  datte: 'pro',
  'fruits secs sucres': 'pro',
  'yaourt aux fruits': 'pro',
  'yaourt sucre': 'pro',
  'lait concentre': 'pro',
  glace: 'pro',
  biere: 'pro',
  vin: 'pro',
  'vin blanc': 'pro',
  'vin rouge': 'pro',
  champagne: 'pro',
  alcool: 'pro',
  'levure de boulanger': 'pro',
  pizza: 'pro',
  frites: 'pro',
  chips: 'pro',
  'cereales sucrees': 'pro',
  ketchup: 'pro',
  pain: 'pro',
  brioche: 'pro',
  'pain de mie': 'pro',
  viennoiserie: 'pro',
  'pain au chocolat': 'pro',
  gaufre: 'pro',
  crepe: 'pro',
  'pate a tartiner': 'pro',
  nutella: 'pro',
  tarte: 'pro',
  'tarte aux pommes': 'pro',
  flan: 'pro',
  'creme dessert': 'pro',
  'cereales petit dejeuner': 'pro',
  muesli: 'pro',
  'barre cereales': 'pro',
  cookie: 'pro',
  madeleine: 'pro',
  donut: 'pro',
  'pates': 'pro',
  spaghetti: 'pro',
  'riz': 'pro',
  semoule: 'pro',
  couscous: 'pro',
  gnocchi: 'pro',
  ravioli: 'pro',
  'sirop d agave': 'pro',
  'sucre de canne': 'pro',
  cassonade: 'pro',
  pasteque: 'pro',
  melon: 'pro',
  cerise: 'pro',
  figue: 'pro',
  'raisin sec': 'pro',
  'fruit confit': 'pro',
  'compote sucree': 'pro',
  smoothie: 'pro',
  limonade: 'pro',
  'ice tea': 'pro',
  'energy drink': 'pro',
  cidre: 'pro',
  rhum: 'pro',
  whisky: 'pro',
  vodka: 'pro',
  cocktail: 'pro',
  apero: 'pro',
  'lait de riz': 'pro',
  'pomme de terre frite': 'pro',
  nuggets: 'pro',
  hamburger: 'pro',
  hotdog: 'pro',
  kebab: 'pro',
  'sauce sucree': 'pro',
  confiserie: 'pro',
  pralines: 'pro',
  'pain blanc industriel': 'pro',

  // ---- beneficial (vert) : bénéfique / anti-fongique ----
  ail: 'beneficial',
  gingembre: 'beneficial',
  'tisane de gingembre': 'beneficial',
  'huile de coco': 'beneficial',
  'huile d olive': 'beneficial',
  'huile olive': 'beneficial',
  brocoli: 'beneficial',
  'brocoli vapeur': 'beneficial',
  courgette: 'beneficial',
  'courgettes sautees': 'beneficial',
  epinard: 'beneficial',
  epinards: 'beneficial',
  'salade verte': 'beneficial',
  salade: 'beneficial',
  concombre: 'beneficial',
  chou: 'beneficial',
  'chou fleur': 'beneficial',
  'haricots verts': 'beneficial',
  poireau: 'beneficial',
  poulet: 'beneficial',
  'poulet roti': 'beneficial',
  dinde: 'beneficial',
  poisson: 'beneficial',
  saumon: 'beneficial',
  'saumon grille': 'beneficial',
  cabillaud: 'beneficial',
  thon: 'beneficial',
  'thon en boite': 'beneficial',
  oeuf: 'beneficial',
  oeufs: 'beneficial',
  'oeufs brouilles': 'beneficial',
  avocat: 'beneficial',
  amande: 'beneficial',
  amandes: 'beneficial',
  noix: 'beneficial',
  'vinaigre de cidre': 'beneficial',
  persil: 'beneficial',
  coriandre: 'beneficial',
  thym: 'beneficial',
  origan: 'beneficial',
  curcuma: 'beneficial',
  tisane: 'beneficial',
  'bouillon d os': 'beneficial',
  olive: 'beneficial',
  'huile de colza': 'beneficial',
  asperge: 'beneficial',
  asperges: 'beneficial',
  aubergine: 'beneficial',
  poivron: 'beneficial',
  fenouil: 'beneficial',
  celeri: 'beneficial',
  radis: 'beneficial',
  roquette: 'beneficial',
  mache: 'beneficial',
  endive: 'beneficial',
  blette: 'beneficial',
  'chou kale': 'beneficial',
  'chou de bruxelles': 'beneficial',
  artichaut: 'beneficial',
  champignon: 'beneficial',
  champignons: 'beneficial',
  maquereau: 'beneficial',
  sardine: 'beneficial',
  hareng: 'beneficial',
  truite: 'beneficial',
  crevette: 'beneficial',
  crevettes: 'beneficial',
  moules: 'beneficial',
  huitres: 'beneficial',
  'blanc de poulet': 'beneficial',
  'escalope de dinde': 'beneficial',
  'oeuf dur': 'beneficial',
  'oeuf a la coque': 'beneficial',
  omelette: 'beneficial',
  noisette: 'beneficial',
  noisettes: 'beneficial',
  'noix de cajou': 'beneficial',
  'graines de courge': 'beneficial',
  'graines de tournesol': 'beneficial',
  'graines de chia': 'beneficial',
  basilic: 'beneficial',
  menthe: 'beneficial',
  romarin: 'beneficial',
  cannelle: 'beneficial',
  'clou de girofle': 'beneficial',
  oignon: 'beneficial',
  echalote: 'beneficial',
  citron: 'beneficial',
  'jus de citron': 'beneficial',
  'tisane de thym': 'beneficial',
  'infusion menthe': 'beneficial',
  kombucha: 'beneficial',
  choucroute: 'beneficial',
  kefir: 'beneficial',
  'yaourt nature': 'beneficial',
  ghee: 'beneficial',
  'huile de lin': 'beneficial',

  // ---- neutral (gris) ----
  cafe: 'neutral',
  'cafe noir': 'neutral',
  the: 'neutral',
  'the noir': 'neutral',
  'the vert': 'neutral',
  eau: 'neutral',
  quinoa: 'neutral',
  'patate douce': 'neutral',
  lentilles: 'neutral',
  'pois chiches': 'neutral',
  'haricots rouges': 'neutral',
  'riz complet': 'neutral',
  'pain complet': 'neutral',
  sarrasin: 'neutral',
  fromage: 'neutral',
  beurre: 'neutral',
  tomate: 'neutral',
  carotte: 'neutral',
  pomme: 'neutral',
  fraise: 'neutral',
  'the matcha': 'neutral',
  'lait d amande': 'neutral',
  'lait de coco': 'neutral',
  'lait de vache': 'neutral',
  'fromage de chevre': 'neutral',
  'fromage blanc': 'neutral',
  feta: 'neutral',
  mozzarella: 'neutral',
  'flocons d avoine': 'neutral',
  avoine: 'neutral',
  millet: 'neutral',
  'pois casses': 'neutral',
  'feves': 'neutral',
  betterave: 'neutral',
  'mais': 'neutral',
  potiron: 'neutral',
  courge: 'neutral',
  navet: 'neutral',
  panais: 'neutral',
  'pomme de terre': 'neutral',
  'pomme de terre vapeur': 'neutral',
  poire: 'neutral',
  peche: 'neutral',
  abricot: 'neutral',
  kiwi: 'neutral',
  orange: 'neutral',
  pamplemousse: 'neutral',
  myrtille: 'neutral',
  framboise: 'neutral',
  mure: 'neutral',
  jambon: 'neutral',
  'jambon blanc': 'neutral',
  steak: 'neutral',
  'boeuf': 'neutral',
  porc: 'neutral',
  veau: 'neutral',
  agneau: 'neutral',
  tofu: 'neutral',
  tempeh: 'neutral',
  houmous: 'neutral',
  'galette de sarrasin': 'neutral',
  'pain au levain': 'neutral',
};

/** Catalogue d'aliments connus (le dictionnaire), pour l'écran Aliments. */
export function dictionaryFoods(): { name: string; category: FoodCategory }[] {
  return Object.entries(DICTIONARY).map(([name, category]) => ({ name, category }));
}

export function dictionarySize(): number {
  return Object.keys(DICTIONARY).length;
}

/**
 * Suggère une catégorie pour un nom d'aliment.
 * Stratégie : exact → terme du dico contenu dans la saisie (le plus long gagne)
 * → mot de la saisie présent comme clé. Défaut : 'neutral'.
 */
export function classifyFood(rawName: string): FoodCategory {
  const name = normalize(rawName);
  if (!name) return 'neutral';

  if (DICTIONARY[name]) return DICTIONARY[name];

  // Correspondance partielle : on privilégie la clé la plus longue contenue
  // dans la saisie (ex. "pain blanc (2 tranches)" contient "pain blanc").
  let best: { cat: FoodCategory; len: number } | null = null;
  for (const key in DICTIONARY) {
    if (name.includes(key) && (!best || key.length > best.len)) {
      best = { cat: DICTIONARY[key], len: key.length };
    }
  }
  if (best) return best.cat;

  // Sinon : un mot de la saisie est-il une clé connue ?
  for (const word of name.split(' ')) {
    if (DICTIONARY[word]) return DICTIONARY[word];
  }

  return 'neutral';
}

/** Sucre/alcool « ajouté » — utilisé pour « jours sans sucre ajouté ». */
const ADDED_SUGAR_OR_ALCOHOL = [
  'sucre',
  'confiture',
  'miel',
  'patisserie',
  'gateau',
  'biscuit',
  'bonbon',
  'chocolat',
  'croissant',
  'jus',
  'soda',
  'cola',
  'sirop',
  'glace',
  'biere',
  'vin',
  'champagne',
  'alcool',
  'yaourt aux fruits',
  'yaourt sucre',
];

export function isAddedSugarOrAlcohol(rawName: string): boolean {
  const name = normalize(rawName);
  return ADDED_SUGAR_OR_ALCOHOL.some((k) => name.includes(k));
}

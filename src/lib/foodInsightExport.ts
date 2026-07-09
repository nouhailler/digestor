import type { FodmapGroups, FoodCategory, FoodInsight } from '../types';
import { FODMAP_GROUP_LABEL, FODMAP_LEVEL_LABEL, VERDICT_LABEL } from './ai/insightFormat';
import {
  AMINE_LEVEL_LABEL,
  AMINE_TOLERANCE_LABEL,
  AMINE_TYPE_LABEL,
  AMINE_TYPES,
  amineTolerance,
} from './biogenicAmines';

/**
 * Met en forme la fiche d'un aliment en texte simple (markdown léger), destiné
 * au partage natif, au presse-papiers ou au téléchargement — pour transmettre à
 * un proche « cet aliment m'est favorable / à limiter ». Fonction pure : aucune
 * dépendance navigateur (le partage lui-même est dans `shareFoodInsight`).
 */

const GROUP_KEYS = Object.keys(FODMAP_GROUP_LABEL) as (keyof FodmapGroups)[];

/** Accroche personnelle selon la catégorie dérivée (profil pris en compte à l'analyse). */
const CATEGORY_LEAD: Record<FoodCategory, string> = {
  beneficial: 'Cet aliment m’est favorable.',
  pro: 'Cet aliment est à limiter pour moi.',
  neutral: 'Cet aliment m’est plutôt neutre.',
};

export function formatFoodInsight(insight: FoodInsight): string {
  const lines: string[] = [];
  lines.push(`${insight.name} — Digestor`);
  lines.push(CATEGORY_LEAD[insight.category]);
  lines.push('');

  const badges = [
    `FODMAP : ${FODMAP_LEVEL_LABEL[insight.fodmapLevel]}`,
    `SIBO : ${VERDICT_LABEL[insight.sibo.verdict]}`,
    `Candidose : ${VERDICT_LABEL[insight.candida.verdict]}`,
  ];
  if (insight.amines) badges.push(`Amines : ${AMINE_LEVEL_LABEL[insight.amines.level]}`);
  lines.push(badges.join(' · '));
  lines.push('');

  if (insight.summary) {
    lines.push(insight.summary);
    lines.push('');
  }

  lines.push('Détail FODMAP');
  for (const g of GROUP_KEYS) {
    lines.push(`- ${FODMAP_GROUP_LABEL[g]} : ${FODMAP_LEVEL_LABEL[insight.fodmaps[g]]}`);
  }
  lines.push('');

  if (insight.sibo.note) lines.push(`SIBO — ${VERDICT_LABEL[insight.sibo.verdict]} : ${insight.sibo.note}`);
  if (insight.candida.note) lines.push(`Candidose — ${VERDICT_LABEL[insight.candida.verdict]} : ${insight.candida.note}`);
  if (insight.sibo.note || insight.candida.note) lines.push('');

  if (insight.amines) {
    const a = insight.amines;
    lines.push(`Amines biogènes : ${AMINE_LEVEL_LABEL[a.level]}`);
    for (const t of AMINE_TYPES) {
      const lvl = a[t];
      if (lvl && lvl !== 'unknown') lines.push(`- ${AMINE_TYPE_LABEL[t]} : ${AMINE_LEVEL_LABEL[lvl].toLowerCase()}`);
    }
    const mechanisms = [
      a.liberator ? 'histamino-libérateur' : '',
      a.daoBlocker ? 'freine la DAO' : '',
      a.maoInhibitor ? 'inhibe la MAO (tyramine)' : '',
      a.fermented ? 'fermenté / affiné' : '',
      a.freshnessDependent ? 'dépend de la fraîcheur' : '',
    ].filter(Boolean);
    if (mechanisms.length) lines.push(`Mécanismes : ${mechanisms.join(' · ')}.`);
    const tol = amineTolerance(a);
    if (tol) lines.push(`Consommation : ${AMINE_TOLERANCE_LABEL[tol.level].toLowerCase()}${tol.note ? ` (${tol.note})` : ''}.`);
    if (a.note) lines.push(a.note);
    lines.push('');
  }

  if (insight.safePortion) {
    lines.push(`Portion généralement tolérée : ${insight.safePortion}`);
    lines.push('');
  }

  if (insight.tips.length > 0) {
    lines.push('Conseils');
    for (const t of insight.tips) lines.push(`- ${t}`);
    lines.push('');
  }

  lines.push(`Analyse par ${insight.model}. Repère indicatif, non médical.`);
  return lines.join('\n').trimEnd() + '\n';
}

/** Nom de fichier (sans caractères problématiques) pour le téléchargement. */
export function foodInsightFilename(insight: FoodInsight): string {
  const slug = insight.key.replace(/\s+/g, '-') || 'aliment';
  return `digestor-aliment-${slug}.txt`;
}

/** Résultat d'un partage : 'shared' (feuille OS), 'copied' (repli presse-papiers) ou 'cancelled'. */
export type ShareResult = 'shared' | 'copied' | 'cancelled';

/**
 * Partage la fiche via la feuille native de l'OS si disponible (mobile), sinon
 * copie le texte dans le presse-papiers. Renvoie le canal effectif.
 */
export async function shareFoodInsight(insight: FoodInsight): Promise<ShareResult> {
  const text = formatFoodInsight(insight);
  const title = `${insight.name} — Digestor`;
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text });
      return 'shared';
    } catch (e) {
      // L'utilisateur a annulé : ne pas retomber sur la copie.
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
      // Autre erreur (non supporté) → repli copie ci-dessous.
    }
  }
  await navigator.clipboard.writeText(text);
  return 'copied';
}

/** Télécharge la fiche en fichier texte. */
export function downloadFoodInsight(insight: FoodInsight): void {
  const blob = new Blob([formatFoodInsight(insight)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = foodInsightFilename(insight);
  a.click();
  URL.revokeObjectURL(url);
}

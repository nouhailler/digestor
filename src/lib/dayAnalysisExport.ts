import type { DayAnalysis, DayImprovement } from '../types';
import { VERDICT_LABEL } from './ai/insightFormat';
import { dayLongLabel } from './dates';

/** Tolère l'ancien format en cache (chaîne) en plus de `{ action, why }`. */
function normalizeImprovement(imp: DayImprovement | string): DayImprovement {
  return typeof imp === 'string' ? { action: imp, why: '' } : imp;
}

/**
 * Met en forme une analyse de journée en texte simple (markdown léger),
 * destiné au partage natif, au presse-papiers ou au téléchargement.
 * Fonction pure : aucune dépendance navigateur.
 */
export function formatDayAnalysis(analysis: DayAnalysis): string {
  const lines: string[] = [];
  lines.push(`Analyse — ${dayLongLabel(analysis.date)}`);
  lines.push(`Journée : ${VERDICT_LABEL[analysis.verdict]}`);
  lines.push('');

  if (analysis.summary) {
    lines.push(analysis.summary);
    lines.push('');
  }

  if (analysis.likelyTriggers.length > 0) {
    lines.push('Déclencheurs probables');
    for (const t of analysis.likelyTriggers) lines.push(`- ${t}`);
    lines.push('');
  }

  if (analysis.improvements.length > 0) {
    lines.push("Pistes d'amélioration");
    for (const imp of analysis.improvements) {
      const { action, why } = normalizeImprovement(imp);
      lines.push(`- ${action}`);
      if (why) lines.push(`  Pourquoi : ${why}`);
    }
    lines.push('');
  }

  lines.push(`Généré par ${analysis.model}. Repère indicatif, non médical.`);
  return lines.join('\n').trimEnd() + '\n';
}

/** Nom de fichier (sans caractères problématiques) pour le téléchargement. */
export function dayAnalysisFilename(analysis: DayAnalysis): string {
  return `digestor-analyse-${analysis.date}.txt`;
}

/** Résultat d'un partage : 'shared' (feuille OS), 'copied' (repli presse-papiers) ou 'cancelled'. */
export type ShareResult = 'shared' | 'copied' | 'cancelled';

/**
 * Partage l'analyse via la feuille native de l'OS si disponible (mobile),
 * sinon copie le texte dans le presse-papiers. Renvoie le canal effectif.
 */
export async function shareDayAnalysis(analysis: DayAnalysis): Promise<ShareResult> {
  const text = formatDayAnalysis(analysis);
  const title = `Analyse — ${dayLongLabel(analysis.date)}`;
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

/** Télécharge l'analyse en fichier texte (même mécanique que la sauvegarde JSON). */
export function downloadDayAnalysis(analysis: DayAnalysis): void {
  const blob = new Blob([formatDayAnalysis(analysis)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dayAnalysisFilename(analysis);
  a.click();
  URL.revokeObjectURL(url);
}

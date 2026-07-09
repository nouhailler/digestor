import type { AmineLevel, FodmapLevel, FoodCategory, FoodInsight, Verdict } from '../types';
import { FODMAP_LEVEL_LABEL, VERDICT_LABEL } from './ai/insightFormat';
import { AMINE_LEVEL_LABEL } from './biogenicAmines';

/**
 * Carte de partage d'une fiche d'aliment sous forme d'IMAGE (PNG). Le canvas ne
 * lit pas les variables CSS du thème : on reprend donc la palette en hex (comme
 * `EvolutionView` pour Recharts). `buildShareCardModel` est pur (testable) ;
 * `renderShareCard` / `shareFoodInsightImage` sont côté navigateur.
 */

// Palette du thème sombre (miroir de @theme dans index.css).
const HEX = {
  bg: '#0e0e0f',
  surface: '#1c1c1e',
  border: '#2a2a2c',
  ink: '#ececec',
  muted: '#8a8a8e',
  severe: '#f0606a',
  modere: '#e8a13a',
  leger: '#5fbf6f',
  absent: '#6b6b70',
} as const;

const LEVEL_HEX: Record<FodmapLevel | AmineLevel, string> = {
  low: HEX.leger,
  moderate: HEX.modere,
  high: HEX.severe,
  unknown: HEX.absent,
};

const VERDICT_HEX: Record<Verdict, string> = {
  favorable: HEX.leger,
  attention: HEX.modere,
  eviter: HEX.severe,
  inconnu: HEX.absent,
};

const CATEGORY_HEX: Record<FoodCategory, string> = {
  beneficial: HEX.leger,
  pro: HEX.severe,
  neutral: HEX.muted,
};

const CATEGORY_LEAD: Record<FoodCategory, string> = {
  beneficial: 'Cet aliment m’est favorable.',
  pro: 'Cet aliment est à limiter pour moi.',
  neutral: 'Cet aliment m’est plutôt neutre.',
};

export interface ShareBadge {
  label: string;
  color: string;
}

/** Données structurées d'une carte de partage (indépendantes du rendu). */
export interface ShareCardModel {
  brand: string;
  title: string;
  lead: string;
  accent: string;
  badges: ShareBadge[];
  summary: string;
  amineLine: string;
  portion: string;
  tips: string[];
  footer: string;
}

const MAX_TIPS = 4;

export function buildShareCardModel(insight: FoodInsight): ShareCardModel {
  const badges: ShareBadge[] = [
    { label: `FODMAP : ${FODMAP_LEVEL_LABEL[insight.fodmapLevel]}`, color: LEVEL_HEX[insight.fodmapLevel] },
    { label: `SIBO : ${VERDICT_LABEL[insight.sibo.verdict]}`, color: VERDICT_HEX[insight.sibo.verdict] },
    { label: `Candidose : ${VERDICT_LABEL[insight.candida.verdict]}`, color: VERDICT_HEX[insight.candida.verdict] },
  ];
  if (insight.amines) {
    badges.push({ label: `Amines : ${AMINE_LEVEL_LABEL[insight.amines.level]}`, color: LEVEL_HEX[insight.amines.level] });
  }

  let amineLine = '';
  if (insight.amines) {
    const a = insight.amines;
    const mechanisms = [
      a.liberator ? 'histamino-libérateur' : '',
      a.daoBlocker ? 'freine la DAO' : '',
      a.maoInhibitor ? 'inhibe la MAO' : '',
      a.fermented ? 'fermenté / affiné' : '',
      a.freshnessDependent ? 'selon la fraîcheur' : '',
    ].filter(Boolean);
    amineLine = `Amines ${AMINE_LEVEL_LABEL[a.level].toLowerCase()}${mechanisms.length ? ` — ${mechanisms.join(' · ')}` : ''}`;
  }

  return {
    brand: 'DIGESTOR',
    title: insight.name,
    lead: CATEGORY_LEAD[insight.category],
    accent: CATEGORY_HEX[insight.category],
    badges,
    summary: insight.summary || '',
    amineLine,
    portion: insight.safePortion ? `Portion tolérée : ${insight.safePortion}` : '',
    tips: insight.tips.slice(0, MAX_TIPS),
    footer: 'Repère indicatif, non médical.',
  };
}

// ---- Rendu canvas (navigateur) ----

const WIDTH = 640;
const PAD_L = 40;
const PAD_R = 32;
const PAD_TOP = 36;
const PAD_BOTTOM = 32;
const CONTENT_W = WIDTH - PAD_L - PAD_R;

const font = (weight: number, size: number) =>
  `${weight} ${size}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/**
 * Parcours unique en deux modes : `draw=false` mesure et renvoie la hauteur ;
 * `draw=true` peint réellement. Garantit que mesure et rendu restent alignés.
 */
function layout(ctx: CanvasRenderingContext2D, m: ShareCardModel, draw: boolean): number {
  ctx.textBaseline = 'top';
  let y = PAD_TOP;

  // Marque
  ctx.font = font(700, 12);
  if (draw) {
    ctx.fillStyle = m.accent;
    if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = '2px';
    ctx.fillText(m.brand, PAD_L, y);
    if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = '0px';
  }
  y += 24;

  // Titre
  ctx.font = font(700, 28);
  for (const line of wrap(ctx, m.title, CONTENT_W)) {
    if (draw) {
      ctx.fillStyle = HEX.ink;
      ctx.fillText(line, PAD_L, y);
    }
    y += 36;
  }
  y += 4;

  // Accroche personnelle
  ctx.font = font(600, 15);
  for (const line of wrap(ctx, m.lead, CONTENT_W)) {
    if (draw) {
      ctx.fillStyle = m.accent;
      ctx.fillText(line, PAD_L, y);
    }
    y += 22;
  }
  y += 14;

  // Badges (pastilles, retour à la ligne si dépassement)
  ctx.font = font(600, 13);
  const pillH = 28;
  const gap = 8;
  let px = PAD_L;
  for (const b of m.badges) {
    const w = ctx.measureText(b.label).width + 24;
    if (px > PAD_L && px + w > PAD_L + CONTENT_W) {
      px = PAD_L;
      y += pillH + gap;
    }
    if (draw) {
      roundRect(ctx, px, y, w, pillH, pillH / 2);
      ctx.fillStyle = `${b.color}22`;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = b.color;
      ctx.stroke();
      ctx.fillStyle = b.color;
      ctx.textBaseline = 'middle';
      ctx.fillText(b.label, px + 12, y + pillH / 2 + 1);
      ctx.textBaseline = 'top';
    }
    px += w + gap;
  }
  y += pillH + 20;

  // Résumé
  if (m.summary) {
    ctx.font = font(400, 15);
    for (const line of wrap(ctx, m.summary, CONTENT_W)) {
      if (draw) {
        ctx.fillStyle = HEX.ink;
        ctx.fillText(line, PAD_L, y);
      }
      y += 23;
    }
    y += 12;
  }

  // Amines (une ligne condensée)
  if (m.amineLine) {
    ctx.font = font(400, 14);
    for (const line of wrap(ctx, m.amineLine, CONTENT_W)) {
      if (draw) {
        ctx.fillStyle = HEX.muted;
        ctx.fillText(line, PAD_L, y);
      }
      y += 20;
    }
    y += 8;
  }

  // Portion tolérée
  if (m.portion) {
    ctx.font = font(400, 14);
    for (const line of wrap(ctx, m.portion, CONTENT_W)) {
      if (draw) {
        ctx.fillStyle = HEX.muted;
        ctx.fillText(line, PAD_L, y);
      }
      y += 20;
    }
    y += 8;
  }

  // Conseils
  if (m.tips.length) {
    ctx.font = font(700, 11);
    if (draw) {
      ctx.fillStyle = HEX.muted;
      if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = '1px';
      ctx.fillText('CONSEILS', PAD_L, y);
      if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = '0px';
    }
    y += 20;
    ctx.font = font(400, 14);
    for (const tip of m.tips) {
      const lines = wrap(ctx, tip, CONTENT_W - 16);
      lines.forEach((line, i) => {
        if (draw) {
          if (i === 0) {
            ctx.fillStyle = HEX.leger;
            ctx.fillText('•', PAD_L, y);
          }
          ctx.fillStyle = HEX.ink;
          ctx.fillText(line, PAD_L + 16, y);
        }
        y += 20;
      });
      y += 4;
    }
    y += 8;
  }

  // Séparateur + pied
  if (draw) {
    ctx.strokeStyle = HEX.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD_L, y);
    ctx.lineTo(PAD_L + CONTENT_W, y);
    ctx.stroke();
  }
  y += 16;
  ctx.font = font(400, 12);
  for (const line of wrap(ctx, m.footer, CONTENT_W)) {
    if (draw) {
      ctx.fillStyle = HEX.muted;
      ctx.fillText(line, PAD_L, y);
    }
    y += 17;
  }

  return y + PAD_BOTTOM;
}

/** Rend la carte de partage d'une fiche dans un canvas (retina). Navigateur uniquement. */
export function renderShareCard(insight: FoodInsight): HTMLCanvasElement {
  const model = buildShareCardModel(insight);
  const canvas = document.createElement('canvas');
  const measureCtx = canvas.getContext('2d');
  if (!measureCtx) throw new Error('Canvas non disponible.');

  const height = layout(measureCtx, model, false);
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
  canvas.width = Math.round(WIDTH * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas non disponible.');
  ctx.scale(dpr, dpr);

  // Fond + panneau + barre d'accent (catégorie).
  ctx.fillStyle = HEX.bg;
  ctx.fillRect(0, 0, WIDTH, height);
  roundRect(ctx, 12, 12, WIDTH - 24, height - 24, 16);
  ctx.fillStyle = HEX.surface;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = HEX.border;
  ctx.stroke();
  roundRect(ctx, 12, 12, 6, height - 24, 3);
  ctx.fillStyle = model.accent;
  ctx.fill();

  layout(ctx, model, true);
  return canvas;
}

function pngFilename(insight: FoodInsight): string {
  const slug = insight.key.replace(/\s+/g, '-') || 'aliment';
  return `digestor-aliment-${slug}.png`;
}

function canvasToFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(new File([blob], name, { type: 'image/png' }));
      else reject(new Error('Rendu de l’image impossible.'));
    }, 'image/png');
  });
}

/** Résultat : 'shared' (feuille OS), 'downloaded' (repli fichier) ou 'cancelled'. */
export type ShareImageResult = 'shared' | 'downloaded' | 'cancelled';

/**
 * Partage la fiche en image : feuille native de l'OS si les fichiers sont
 * partageables (mobile), sinon téléchargement du PNG. Navigateur uniquement.
 */
export async function shareFoodInsightImage(insight: FoodInsight): Promise<ShareImageResult> {
  const canvas = renderShareCard(insight);
  const file = await canvasToFile(canvas, pngFilename(insight));

  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: `${insight.name} — Digestor` });
      return 'shared';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
      // Non supporté / erreur → repli téléchargement.
    }
  }

  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
  return 'downloaded';
}

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { TourStep } from '../lib/tour';

interface TourProps {
  steps: TourStep[];
  /** Appelé quand la visite est terminée ou passée (à mémoriser comme « vue »). */
  onClose: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 8; // marge du halo autour de la cible
const BUBBLE_W = 320;
const GAP = 14; // espace entre la cible et la bulle

/**
 * Visite guidée superposée : assombrit l'écran, met en lumière l'élément ciblé
 * (`data-tour`) via un halo, et ancre une bulle explicative à côté. Les étapes
 * sans cible (ou dont la cible est absente) s'affichent centrées.
 */
export function Tour({ steps, onClose }: TourProps) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [bubbleH, setBubbleH] = useState(180);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const step = steps[i];
  const last = i === steps.length - 1;

  const measure = useCallback(() => {
    if (!step?.target) {
      setRect(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  // Amène la cible à l'écran puis mesure (après le scroll/layout).
  useLayoutEffect(() => {
    const el = step?.target
      ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
      : null;
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const id = window.requestAnimationFrame(() => window.setTimeout(measure, 180));
    return () => window.cancelAnimationFrame(id);
  }, [step, measure]);

  // Recalage si l'utilisateur redimensionne / fait défiler.
  useEffect(() => {
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure]);

  // Navigation clavier (confort desktop).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' || e.key === 'Enter') setI((v) => (v < steps.length - 1 ? v + 1 : v));
      else if (e.key === 'ArrowLeft') setI((v) => Math.max(0, v - 1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [steps.length, onClose]);

  // Mesure réelle de la hauteur de la bulle pour la garder dans l'écran.
  useLayoutEffect(() => {
    const h = bubbleRef.current?.offsetHeight;
    if (h && Math.abs(h - bubbleH) > 1) setBubbleH(h);
  });

  if (!step) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Position de la bulle : ancrée près de la cible (placée au-dessus ou en dessous
  // selon la place), toujours clampée dans le viewport. Sinon centrée.
  let bubbleStyle: React.CSSProperties;
  if (rect) {
    const left = Math.min(Math.max(rect.left, 12), vw - BUBBLE_W - 12);
    const rTop = Math.max(rect.top, 0);
    const rBottom = Math.min(rect.top + rect.height, vh);
    let top: number;
    if (vh - rBottom >= bubbleH + GAP + 8) top = rBottom + GAP; // sous la cible
    else if (rTop >= bubbleH + GAP + 8) top = rTop - GAP - bubbleH; // au-dessus
    else top = vh - bubbleH - 8; // pas de place : collée en bas
    top = Math.min(Math.max(top, 8), vh - bubbleH - 8);
    bubbleStyle = { top, left };
  } else {
    bubbleStyle = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Capteur de clics : empêche d'interagir avec l'app pendant la visite. */}
      <div className="absolute inset-0" onClick={() => setI((v) => (v < steps.length - 1 ? v + 1 : v))} />

      {/* Halo : un cadre transparent dont l'ombre géante assombrit tout le reste. */}
      {rect && (
        <div
          className="pointer-events-none absolute rounded-xl transition-all duration-200"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
            outline: '2px solid var(--color-leger)',
            outlineOffset: 2,
          }}
        />
      )}
      {/* Sans cible : voile sombre plein écran. */}
      {!rect && <div className="pointer-events-none absolute inset-0 bg-black/72" />}

      {/* Bulle explicative. */}
      <div
        ref={bubbleRef}
        className="absolute w-[320px] max-w-[calc(100vw-24px)] rounded-2xl border border-border bg-surface p-4 shadow-xl"
        style={bubbleStyle}
        role="dialog"
        aria-label={step.title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la visite"
            className="-mr-1 -mt-0.5 shrink-0 rounded-full p-1 text-muted hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-[13px] leading-relaxed text-muted">{step.body}</p>

        <div className="mt-3 flex items-center justify-between gap-3">
          {/* Progression */}
          <div className="flex gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: idx === i ? 16 : 6,
                  backgroundColor: idx === i ? 'var(--color-leger)' : 'var(--color-border)',
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {i > 0 && (
              <button
                type="button"
                onClick={() => setI((v) => Math.max(0, v - 1))}
                aria-label="Précédent"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted hover:text-ink"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={() => (last ? onClose() : setI((v) => v + 1))}
              className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium"
              style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
            >
              {last ? 'Terminer' : 'Suivant'}
              {!last && <ChevronRight size={16} />}
            </button>
          </div>
        </div>

        {!last && (
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full text-center text-xs text-muted hover:text-ink"
          >
            Passer la visite
          </button>
        )}
      </div>
    </div>
  );
}

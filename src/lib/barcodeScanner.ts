/**
 * Lecture d'un code-barres depuis la caméra. Deux moteurs :
 *  - `BarcodeDetector` natif (Android/Chrome) : zéro poids ;
 *  - sinon `@zxing/browser`, importé **à la demande** (notamment iPhone/Safari).
 *
 * Dans les deux cas, c'est nous qui ouvrons le flux caméra (caméra arrière de
 * préférence) afin d'unifier la permission, l'affichage et le nettoyage.
 */

export interface ScanHandle {
  stop: () => void;
}

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'] as const;

/** Vrai si un moteur de lecture est disponible (natif ou via la lib de secours). */
export function barcodeScanSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia
    // @zxing assure le repli quand BarcodeDetector est absent.
  );
}

/**
 * Démarre le scan : appelle `onResult(code)` au premier code lu. L'appelant
 * arrête via `handle.stop()` (caméra coupée, boucle annulée). Lève en cas de
 * caméra refusée/indisponible (l'appelant propose alors la saisie manuelle).
 */
export async function startBarcodeScan(
  video: HTMLVideoElement,
  onResult: (code: string) => void,
  opts: { onError?: (e: unknown) => void } = {},
): Promise<ScanHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: 'environment' } },
    audio: false,
  });

  let stopped = false;
  let intervalId = 0;
  let zxingControls: { stop: () => void } | null = null;
  const tracks = stream.getTracks();

  const cleanup = () => {
    if (stopped) return;
    stopped = true;
    if (intervalId) clearInterval(intervalId);
    try {
      zxingControls?.stop();
    } catch {
      /* ignore */
    }
    for (const t of tracks) t.stop();
    video.srcObject = null;
  };

  const emit = (code: string) => {
    if (stopped) return;
    const c = code.trim();
    if (c) onResult(c);
  };

  // ---- Moteur natif ----
  const BD = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
  if (BD) {
    let formats: string[] = [...FORMATS];
    try {
      const avail = await BD.getSupportedFormats?.();
      if (Array.isArray(avail) && avail.length) {
        const inter = formats.filter((f) => avail.includes(f));
        if (inter.length) formats = inter;
      }
    } catch {
      /* on garde la liste par défaut */
    }
    const detector = new BD({ formats });
    video.srcObject = stream;
    await video.play().catch(() => {});
    intervalId = window.setInterval(async () => {
      if (stopped) return;
      try {
        const codes = await detector.detect(video);
        if (codes && codes.length) emit(codes[0].rawValue);
      } catch (e) {
        opts.onError?.(e); // image pas encore prête : non bloquant
      }
    }, 250);
    return { stop: cleanup };
  }

  // ---- Repli @zxing (chargé à la demande) ----
  const { BrowserMultiFormatReader } = await import('@zxing/browser');
  const reader = new BrowserMultiFormatReader();
  zxingControls = await reader.decodeFromStream(stream, video, (result) => {
    if (result) emit(result.getText());
  });
  return { stop: cleanup };
}

// Typage minimal de l'API BarcodeDetector (absente des libs TS standard).
interface BarcodeDetectorCtor {
  new (opts?: { formats?: string[] }): {
    detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
  };
  getSupportedFormats?: () => Promise<string[]>;
}

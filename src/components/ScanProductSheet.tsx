import { useEffect, useRef, useState } from 'react';
import { Loader2, ScanLine, Search, Sparkles } from 'lucide-react';
import { Sheet } from './Sheet';
import { startBarcodeScan, type ScanHandle } from '../lib/barcodeScanner';
import { isValidBarcode, lookupProduct, productDetails, type ScannedProduct } from '../lib/openFoodFacts';

interface ScanProductSheetProps {
  open: boolean;
  onClose: () => void;
  /** L'utilisateur valide un produit à analyser : nom + contexte (ingrédients/marque). */
  onPick: (name: string, details?: string) => void;
}

type Phase =
  | { k: 'scanning' }
  | { k: 'looking'; barcode: string }
  | { k: 'found'; product: ScannedProduct }
  | { k: 'notfound'; barcode: string };

/**
 * Scan d'un produit emballé : code-barres (caméra ou saisie) → recherche Open Food
 * Facts → on passe le nom + les ingrédients à l'analyse IA (FODMAP / SIBO / candidose).
 */
export function ScanProductSheet({ open, onClose, onPick }: ScanProductSheetProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleRef = useRef<ScanHandle | null>(null);
  const busyRef = useRef(false); // empêche les lectures multiples en rafale
  const [phase, setPhase] = useState<Phase>({ k: 'scanning' });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [manualName, setManualName] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);

  async function onBarcode(code: string) {
    if (busyRef.current || !isValidBarcode(code)) return;
    busyRef.current = true;
    handleRef.current?.stop();
    handleRef.current = null;
    setLookupError(null);
    setPhase({ k: 'looking', barcode: code });
    try {
      const product = await lookupProduct(code);
      setPhase(product ? { k: 'found', product } : { k: 'notfound', barcode: code });
    } catch (e) {
      setLookupError(e instanceof Error ? e.message : 'Recherche impossible.');
      setPhase({ k: 'notfound', barcode: code });
    } finally {
      busyRef.current = false;
    }
  }

  // Démarre / arrête la caméra selon la phase.
  useEffect(() => {
    if (!open || phase.k !== 'scanning') return;
    let cancelled = false;
    setCameraError(null);
    const v = videoRef.current;
    if (!v) return;
    startBarcodeScan(v, (code) => void onBarcode(code))
      .then((h) => {
        if (cancelled) h.stop();
        else handleRef.current = h;
      })
      .catch(() => {
        if (!cancelled) setCameraError('Caméra indisponible. Saisissez le code-barres à la main.');
      });
    return () => {
      cancelled = true;
      handleRef.current?.stop();
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, phase.k]);

  // Réinitialise tout à la fermeture.
  useEffect(() => {
    if (open) return;
    handleRef.current?.stop();
    handleRef.current = null;
    busyRef.current = false;
    setPhase({ k: 'scanning' });
    setManualBarcode('');
    setManualName('');
    setLookupError(null);
    setCameraError(null);
  }, [open]);

  function rescan() {
    busyRef.current = false;
    setLookupError(null);
    setManualName('');
    setPhase({ k: 'scanning' });
  }

  function submitManualBarcode() {
    const c = manualBarcode.replace(/\s/g, '');
    if (!isValidBarcode(c)) {
      setLookupError('Code-barres invalide (8 à 14 chiffres).');
      return;
    }
    void onBarcode(c);
  }

  return (
    <Sheet open={open} title="Scanner un produit" onClose={onClose}>
      {phase.k === 'scanning' && (
        <div className="space-y-4">
          {!cameraError ? (
            <div className="relative overflow-hidden rounded-xl border border-border bg-black">
              <video ref={videoRef} muted playsInline className="h-56 w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-4/5 rounded-lg border-2 border-leger/80" />
              </div>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-ink">
                Visez le code-barres
              </span>
            </div>
          ) : (
            <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted">{cameraError}</p>
          )}

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
              ou saisir le code-barres
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3">
              <ScanLine size={16} className="text-muted" />
              <input
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitManualBarcode()}
                inputMode="numeric"
                placeholder="3017620422003"
                className="w-full bg-transparent py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
              />
              <button type="button" onClick={submitManualBarcode} className="text-muted hover:text-leger" aria-label="Chercher">
                <Search size={16} />
              </button>
            </div>
            {lookupError && <p className="mt-1 text-xs" style={{ color: 'var(--color-severe)' }}>{lookupError}</p>}
          </div>

          <p className="text-xs text-muted">
            La recherche interroge Open Food Facts (base libre) ; seul le code-barres est envoyé. L'analyse
            FODMAP / SIBO / candidose utilise ensuite votre IA configurée.
          </p>
        </div>
      )}

      {phase.k === 'looking' && (
        <div className="flex items-center gap-3 py-6 text-sm text-muted">
          <Loader2 size={18} className="animate-spin text-leger" />
          Recherche du produit… ({phase.barcode})
        </div>
      )}

      {phase.k === 'found' && (
        <div className="space-y-4">
          <div>
            <p className="text-lg font-semibold text-ink">{phase.product.name}</p>
            {(phase.product.brand || phase.product.quantity) && (
              <p className="text-sm text-muted">
                {[phase.product.brand, phase.product.quantity].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          {phase.product.ingredients && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Ingrédients</p>
              <p className="max-h-28 overflow-y-auto rounded-lg bg-surface-2 px-3 py-2 text-xs text-ink">
                {phase.product.ingredients}
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onPick(phase.product.name, productDetails(phase.product) || undefined)}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium"
              style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
            >
              <Sparkles size={16} /> Analyser ce produit
            </button>
            <button
              type="button"
              onClick={rescan}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted hover:text-ink"
            >
              Scanner un autre
            </button>
          </div>
        </div>
      )}

      {phase.k === 'notfound' && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {lookupError ?? `Produit introuvable dans Open Food Facts (code ${phase.barcode}).`} Vous pouvez
            saisir son nom pour l'analyser quand même.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3">
            <input
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && manualName.trim() && onPick(manualName.trim())}
              placeholder="Nom du produit (ex. Biscuits sablés)"
              className="w-full bg-transparent py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => manualName.trim() && onPick(manualName.trim())}
              disabled={!manualName.trim()}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
            >
              <Sparkles size={16} /> Analyser ce nom
            </button>
            <button
              type="button"
              onClick={rescan}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted hover:text-ink"
            >
              Scanner un autre
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

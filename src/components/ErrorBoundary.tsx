import { Component, type ReactNode } from 'react';

/**
 * Garde-fou de rendu : empêche qu'une exception dans une vue (ou l'échec de
 * chargement d'un chunk lazy après un nouveau déploiement) ne fasse planter
 * toute l'app en « écran noir ». Affiche un repli + bouton « Recharger ».
 *
 * Placée avec `key={tab}` dans App : changer d'onglet remonte la frontière,
 * ce qui efface l'erreur précédente.
 */

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Détecte un échec d'import dynamique (chunk obsolète / réseau). */
function isChunkLoadError(e: Error): boolean {
  const msg = `${e?.name} ${e?.message}`.toLowerCase();
  return (
    msg.includes('dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('chunkload') ||
    msg.includes('error loading')
  );
}

/** Accès défensif à sessionStorage (peut lever en navigation privée). */
function once(key: string): boolean {
  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, '1');
    return true;
  } catch {
    return false;
  }
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Chunk obsolète (nouveau déploiement) : on recharge UNE fois pour récupérer
    // la version à jour. Le garde `once` évite toute boucle de rechargement.
    if (isChunkLoadError(error) && once('chunkReloaded')) {
      window.location.reload();
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto max-w-3xl px-4 pt-12 text-center">
        <p className="mb-1 text-ink">Cette section n'a pas pu s'afficher.</p>
        <p className="mb-4 text-sm text-muted">
          Une mise à jour est peut-être disponible. Vos données restent intactes.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: 'var(--color-leger)', color: '#0e0e0f' }}
        >
          Recharger
        </button>
      </div>
    );
  }
}

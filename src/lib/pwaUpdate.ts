/**
 * Cycle de vie du service worker (registerType 'autoUpdate' : bascule silencieuse,
 * rechargement automatique dès qu'une nouvelle version est active — géré par
 * virtual:pwa-register, cf. node_modules/vite-plugin-pwa/dist/client/build/register.js).
 *
 * Ce module ajoute ce que l'auto-update ne fait pas tout seul :
 * - un polling périodique (un onglet resté ouvert longtemps ne revérifierait sinon
 *   qu'à sa prochaine navigation) ;
 * - une vérification manuelle déclenchable par l'utilisateur (bouton « Vérifier les
 *   mises à jour » du menu).
 */

export const APP_VERSION = __APP_VERSION__;
export const BUILD_DATE = __BUILD_DATE__;

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 h

let swUrl: string | null = null;
let swRegistration: ServiceWorkerRegistration | null = null;

async function pollForUpdate(): Promise<void> {
  if (!swUrl || !swRegistration || swRegistration.installing) return;
  if ('connection' in navigator && !navigator.onLine) return;
  const resp = await fetch(swUrl, {
    cache: 'no-store',
    headers: { cache: 'no-store', 'cache-control': 'no-cache' },
  });
  if (resp.status === 200) await swRegistration.update();
}

/** Enregistre le service worker au démarrage de l'app. À appeler une seule fois. */
export function registerAppUpdates(): void {
  if (!('serviceWorker' in navigator)) return;
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onRegisteredSW(url, registration) {
        if (!registration) return;
        swUrl = url;
        swRegistration = registration;
        setInterval(pollForUpdate, UPDATE_CHECK_INTERVAL_MS);
      },
    });
  });
}

export type UpdateCheckResult = 'updating' | 'up-to-date' | 'unavailable';

/**
 * Force une vérification immédiate (bouton « Vérifier les mises à jour »).
 * En mode autoUpdate, une nouvelle version détectée s'active et recharge la page
 * automatiquement (pas d'action supplémentaire à faire ici) ; on retourne un statut
 * pour informer l'utilisateur dans l'intervalle.
 */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
  if (!swRegistration) return 'unavailable';
  let updateFound = false;
  const onUpdateFound = () => {
    updateFound = true;
  };
  swRegistration.addEventListener('updatefound', onUpdateFound);
  try {
    await swRegistration.update();
    // Laisse le temps à l'évènement 'updatefound' de se déclencher (installation en cours).
    await new Promise((resolve) => setTimeout(resolve, 1500));
  } finally {
    swRegistration.removeEventListener('updatefound', onUpdateFound);
  }
  return updateFound ? 'updating' : 'up-to-date';
}

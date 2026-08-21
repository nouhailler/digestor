import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App';
import { applyTheme, getStoredTheme } from './lib/theme';

// Applique le thème mémorisé avant le premier rendu (évite tout « flash »).
applyTheme(getStoredTheme());

// Enregistre le service worker et revérifie périodiquement s'il y a une
// nouvelle version (registerType 'autoUpdate' : bascule silencieuse, sans
// prompt). Sans ce polling, un onglet resté ouvert longtemps ne verrait la
// mise à jour qu'à sa prochaine navigation/rechargement.
const PWA_UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 h

registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (!registration) return;
    setInterval(async () => {
      if (registration.installing || !navigator.onLine) return;
      const resp = await fetch(swUrl, {
        cache: 'no-store',
        headers: { cache: 'no-store', 'cache-control': 'no-cache' },
      });
      if (resp.status === 200) await registration.update();
    }, PWA_UPDATE_CHECK_INTERVAL_MS);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

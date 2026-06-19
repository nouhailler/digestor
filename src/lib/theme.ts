/**
 * Thème de l'interface (sombre par défaut, clair en option).
 *
 * Préférence d'affichage propre à l'appareil : stockée en `localStorage` (lecture
 * synchrone au démarrage → pas de « flash » sombre avant le clair). Volontairement
 * hors de la base Dexie et de l'export JSON, qui ne contiennent que des données patient.
 *
 * Le thème est appliqué via l'attribut `data-theme` sur `<html>` ; les surcharges des
 * variables `--color-*` vivent dans `index.css` (`html[data-theme='light']`).
 */
export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'digestor-theme';

// Couleur de la barre de navigateur (mobile) selon le thème — cf. --color-bg.
const THEME_COLOR: Record<Theme, string> = {
  dark: '#0e0e0f',
  light: '#f6f6f7',
};

export function getStoredTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR[theme]);
}

export function setStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage indisponible (mode privé strict) : on applique quand même pour la session.
  }
  applyTheme(theme);
}

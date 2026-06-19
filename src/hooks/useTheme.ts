import { useState } from 'react';
import { getStoredTheme, setStoredTheme, type Theme } from '../lib/theme';

/**
 * Thème de l'interface (sombre / clair) avec persistance locale.
 * `setTheme` applique immédiatement le thème et le mémorise.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  function setTheme(next: Theme) {
    setStoredTheme(next);
    setThemeState(next);
  }

  return { theme, setTheme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') };
}

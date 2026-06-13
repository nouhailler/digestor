import { defineConfig } from 'vitest/config';

// Config dédiée aux tests : environnement Node (les fonctions de src/lib/
// sont pures, sans DOM) et on évite de charger les plugins Vite/PWA.
export default defineConfig({
  test: {
    // Par défaut Node (fonctions pures de src/lib). Les tests de composants
    // déclarent `// @vitest-environment jsdom` en tête de fichier.
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

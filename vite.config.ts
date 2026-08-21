import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json';

export default defineConfig({
  // Version affichée dans le menu (À propos des mises à jour) + date de ce build,
  // utilisée comme « date de dernière mise à jour » de l'app.
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    rollupOptions: {
      output: {
        // Isole recharts/d3 (le plus gros vendor) dans son propre chunk.
        // Combiné au chargement paresseux de l'écran Évolution, il n'est
        // téléchargé que lorsqu'on ouvre les graphes.
        manualChunks: {
          recharts: ['recharts'],
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Enregistrement fait à la main dans lib/pwaUpdate.ts (nécessaire pour le
      // polling périodique + la vérification manuelle) plutôt que par le script
      // auto-injecté.
      injectRegister: false,
      includeAssets: [
        'favicon.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-512-maskable.png',
        'icons/apple-touch-icon.png',
      ],
      manifest: {
        name: 'Digestor — Journal alimentaire & symptômes',
        short_name: 'Digestor',
        description:
          'Journal alimentaire et suivi des symptômes (candidose intestinale, SIBO, SII). 100 % hors-ligne, données locales.',
        lang: 'fr',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0e0e0f',
        background_color: '#0e0e0f',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,ico,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
      },
    }),
  ],
});

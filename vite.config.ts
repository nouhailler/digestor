import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
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
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
      },
    }),
  ],
});

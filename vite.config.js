import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'My Purrsonal Planner',
        short_name: 'PurrPlanner',
        description: 'Your cozy all-in-one life planner — calendar, mood, budget, fitness, and more.',
        theme_color: '#4FBDB0',
        background_color: '#FFF8F3',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        runtimeCaching: [
          {
            // Cache read (GET) requests to the Supabase data API so the
            // most recently loaded calendar/mood/diary/etc. data is still
            // viewable with no connection. Writes (POST/PATCH/DELETE)
            // are never matched here — method defaults to GET only —
            // so they always go straight to the network and fail
            // honestly if there's no signal, rather than silently
            // appearing to save.
            urlPattern: /^https:\/\/aockokxdioxijszocakg\.supabase\.co\/rest\/v1\/.*/,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'supabase-data-cache',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 14 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      }
    })
  ]
})

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        // Theme pictures are cached on first view instead (see src/sw.js), so a
        // big photo never blocks or bloats the app install.
        globIgnores: ['themes/**'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024
      },
      includeAssets: ['favicon.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'My Purrsonal Planner',
        short_name: 'PurrPlanner',
        description: 'Your cozy all-in-one life planner — calendar, mood, budget, fitness, and more.',
        theme_color: '#2E7A70',
        background_color: '#FCF4E6',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/purr-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/purr-icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/purr-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
})

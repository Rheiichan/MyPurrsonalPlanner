import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

precacheAndRoute(self.__WB_MANIFEST)

// Cache read (GET) requests to the Supabase data API so the most recently
// loaded calendar/mood/diary/etc. data is still viewable with no
// connection. Writes are never matched here — registerRoute's method
// defaults to GET only — so they always go straight to the network.
registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === 'https://aockokxdioxijszocakg.supabase.co' &&
    url.pathname.startsWith('/rest/v1/'),
  new NetworkFirst({
    cacheName: 'supabase-data-cache',
    networkTimeoutSeconds: 8,
    plugins: [
      new ExpirationPlugin({ maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 14 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// --- Push notifications ---
// The payload is sent (as JSON) by the send-notifications Edge Function.
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'My Purrsonal Planner', body: event.data ? event.data.text() : '' }
  }
  const title = data.title || 'My Purrsonal Planner'
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/hub' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/hub'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})

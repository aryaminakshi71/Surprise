const API_CACHE = 'api-cache-v1'
const STATIC_CACHE = 'static-cache-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(['/']))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== API_CACHE && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method === 'GET' && url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  )
})

async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE)
  const cached = await cache.match(request)
  const networkPromise = fetch(request).then((response) => {
    if (response && response.ok) {
      cache.put(request, response.clone())
    }
    return response
  })

  return cached || networkPromise
}

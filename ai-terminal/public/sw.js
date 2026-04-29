const CACHE_NAME = 'ai-terminal-v1'
const SHELL_ASSETS = ['/', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  // Network-first for API and navigation
  if (request.url.includes('/api/') || request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (request.mode === 'navigate') {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          }
          return res
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((res) => {
        const clone = res.clone()
        caches.open(CACHE_NAME).then((c) => c.put(request, clone))
        return res
      })
    })
  )
})

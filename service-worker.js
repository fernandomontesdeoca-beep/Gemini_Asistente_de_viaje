const CACHE_NAME = 'trip-assistant-v1.0.44';
const STATIC_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];

const CRITICAL_FILES = [
    './',
    './index.html',
    './version.json',
    './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([...STATIC_ASSETS, ...CRITICAL_FILES]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.map((name) => {
        if (name !== CACHE_NAME) return caches.delete(name);
      })
    ))
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Estrategia 1: Network First (Para tu código: index.html y version.json)
  // Intentamos obtener lo nuevo. Si falla, mostramos lo guardado.
  if (url.pathname.endsWith('index.html') || url.pathname.endsWith('/') || url.pathname.endsWith('version.json') || url.pathname.endsWith('manifest.json')) {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            const resClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
            return response;
          })
          .catch(() => caches.match(event.request))
      );
      return;
  }

  // Estrategia 2: Cache First (Para librerías externas CDN)
  // Si ya las tenemos, no las bajamos de nuevo.
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

const CACHE_PREFIX = 'household-budget-';
const CACHE_NAME = CACHE_PREFIX + 'v1';

const FILES = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/calculator.js',
  './js/db.js',
  './js/ui.js',
  './js/utils.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

const APP_URLS = new Set(
  FILES.map(file =>
    new URL(file, self.registration.scope).href
  )
);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(
        FILES.map(file =>
          new Request(
            new URL(file, self.registration.scope),
            { cache: 'reload' }
          )
        )
      )
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key =>
            key.startsWith(CACHE_PREFIX) &&
            key !== CACHE_NAME
          )
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    !APP_URLS.has(url.href)
  ) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(request);

      if (cached) {
        return cached;
      }

      return fetch(request);
    })
  );
});

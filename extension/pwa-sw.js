const CACHE_NAME = 'ytmb-pwa-v1';
const STATIC_ASSETS = [
  'webapp.html',
  'styles.css',
  'backgroundMovingImage.js',
  'colorUtils.js',
  'displayer.js',
  'reciever.js',
  'liveutils.js',
  'webapp-controller.js',
  'libs/socket.io.min.js',
  'libs/qrcode.min.js',
  'assets/128x128.png',
  'assets/48x48.png',
  'assets/16x16.png',
  'assets/nobackground.png',
  'assets/pause.png',
  'assets/play.png',
  'assets/left skip.png',
  'assets/right skip.png',
  'assets/clock.svg',
  'assets/mic.svg',
  'assets/no-mic.svg',
  'assets/show lyrics.png',
  'assets/reload lyrics.svg',
  'assets/fullscreen.svg',
  'assets/minimize.svg',
  'assets/settings.svg',
  'assets/sharing.svg',
  'assets/copy.png',
  'assets/reset.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Cache what we can; skip failures for missing files
        return Promise.allSettled(
          STATIC_ASSETS.map((url) => cache.add(url).catch(() => {}))
        );
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only cache same-origin requests (extension resources)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Return cache, update in background (stale-while-revalidate)
        const fetchPromise = fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {});
        return cached;
      }
      // Not cached — fetch and cache for next time
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

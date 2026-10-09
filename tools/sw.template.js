/* NWCC Campus Map · service worker.
   - App shell (HTML, JS, CSS, GeoJSON, data, vendored MapLibre + Three.js, label glyphs, icons): precached, cache-first.
   - Satellite tiles (Esri World Imagery): network only (never stored by the SW; needs internet).
   - CDN fallbacks (jsDelivr / unpkg / protomaps glyphs, only used if a local copy fails): network-first, cached copy offline.
   VERSION and PRECACHE are rewritten by tools/build_sw.py; bump them whenever app files change. */
const VERSION = '__VERSION__';
const SHELL = 'nwcc-shell-' + VERSION;
const RUNTIME = 'nwcc-runtime-' + VERSION;
const PRECACHE = __PRECACHE__;
const TILE_HOSTS = ['server.arcgisonline.com', 'services.arcgisonline.com'];
const CDN_HOSTS = ['unpkg.com', 'cdn.jsdelivr.net', 'protomaps.github.io'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' })))));
  // First install activates right away; updates wait until the page asks (pwa.js "Reload" toast).
  if (!self.registration.active) self.skipWaiting();
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('nwcc-') && k !== SHELL && k !== RUNTIME).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (TILE_HOSTS.includes(url.hostname)) return; // network only (browser default)

  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate') {
      // Any page load in scope (incl. ?sat=1, #b=20, ?view=...) gets the precached shell, so the installed app opens
      // offline. Updates arrive as a new service worker version (new VERSION), never as a mixed old/new shell.
      event.respondWith(caches.match('./index.html', { cacheName: SHELL }).then(cached => cached || fetch(req)));
      return;
    }
    event.respondWith(caches.match(req, { ignoreSearch: true }).then(cached => cached || fetch(req).then(r => {
      if (r.ok && r.type === 'basic') { const copy = r.clone(); caches.open(RUNTIME).then(c => c.put(req, copy)); }
      return r;
    })));
    return;
  }

  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(fetch(req).then(r => {
      if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(RUNTIME).then(c => c.put(req, copy)); }
      return r;
    }).catch(() => caches.match(req)));
  }
});

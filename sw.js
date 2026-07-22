/* sw.js — offline-first, DEFENSIVE (install tidak gagal walau ada 404) */
const CACHE = 'ko-v2';
const SHELL = ['/', '/index.html', '/app.css', '/app.js', '/offline.html', '/icons/icon.svg', '/manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      // cache satu-per-satu; yang 404 dilewati, BUKAN menggagalkan install
      Promise.allSettled(SHELL.map(u => cache.add(u).catch(err => console.warn('[sw] lewati', u, err)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Navigasi halaman: network-first, fallback cache, terakhir offline.html
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(req, c)); return r; })
        .catch(() => caches.match(req).then(m => m || caches.match('/offline.html').catch(() => m)))
    );
    return;
  }

  // Aset lain: cache-first, lalu network & simpan (stale-while-revalidate sederhana)
  e.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(r => {
        if (r && r.status === 200 && (url.origin === self.location.origin || /fonts\.(googleapis|gstatic)/.test(url.host))) {
          const c = r.clone(); caches.open(CACHE).then(ca => ca.put(req, c));
        }
        return r;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });
// sw.js - service worker : l'app reste utilisable hors-ligne après une première visite
const V = 'bec-v1';
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(['/', '/css/style.css', '/js/app.js', '/js/core.js', '/js/registry.js', '/js/a11y.js', '/js/session.js', '/js/bell.js']))); self.skipWaiting(); });
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
// Réseau d'abord, cache en secours. Les réponses d'API sont mises en cache PAR PROFIL
// (pour ne jamais afficher hors-ligne les données d'un autre profil sur le même appareil).
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const isApi = req.url.includes('/api/');
  const key = isApi ? req.url + (req.url.includes('?') ? '&' : '?') + '_k=' + encodeURIComponent((req.headers.get('x-role') || '') + (req.headers.get('x-user') || '')) : req;
  e.respondWith(fetch(req).then((r) => { if (r.ok) { const copy = r.clone(); caches.open(V).then((c) => c.put(key, copy)); } return r; }).catch(() => caches.match(key)));
});

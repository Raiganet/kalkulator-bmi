/* sw.js — offline-first app shell + runtime cache */
const CACHE='ko-v1';
const SHELL=['/','/index.html','/app.css','/app.js','/offline.html',
  '/icons/icon-192.png','/icons/icon-512.png','/icons/icon-maskable-512.png',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  // navigasi: network-first, fallback cache/offline
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r;})
      .catch(()=>caches.match(req).then(m=>m||caches.match('/offline.html'))));
    return;
  }
  // aset lain: cache-first, lalu network & simpan
  e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(r=>{
    if(r&&r.status===200&&(url.origin===self.location.origin||/fonts\.(googleapis|gstatic)/.test(url.host))){
      const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));}
    return r;
  }).catch(()=>caches.match('/offline.html'))));
});
// auto update
self.addEventListener('message',e=>{ if(e.data==='SKIP_WAITING') self.skipWaiting(); });
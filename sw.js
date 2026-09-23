/* KalkulatorOnline Service Worker — Stage 8 GAS CMS shell */
const CACHE='ko-v11';
const PRECACHE=[
  '/', '/index.html', '/offline.html', '/app.css', '/app.js', '/cookie-consent.js',
  '/manifest.webmanifest', '/site.webmanifest', '/cms-defaults.js', '/cms-config.js', '/cms-runtime.js', '/monetization-config.js', '/favicon.ico', '/favicon-16x16.png', '/favicon-32x32.png',
  '/apple-touch-icon.png', '/android-chrome-192x192.png', '/android-chrome-512x512.png', '/icons/icon.svg', '/og-image.png',
  '/about.html','/bahaya-obesitas.html','/bmi-ideal-wanita.html','/cara-install-aplikasi.html','/cara-menghitung-bmi.html',
  '/contact.html','/disclaimer.html','/faq.html','/kalkulator-populer.html','/statistik.html','/kalkulator-air.html','/kalkulator-bmr.html','/kalkulator-body-fat.html',
  '/kalkulator-cicilan.html','/kalkulator-diskon.html','/kalkulator-kalori.html','/kalkulator-kehamilan.html','/kalkulator-kontraksi.html',
  '/kalkulator-masa-subur.html','/kalkulator-persen.html','/kalkulator-ppn.html','/kalkulator-tendangan.html','/kalkulator-ukuran-janin.html',
  '/kalkulator-umur.html','/kalkulator-whtr.html','/konversi-satuan.html','/privacy.html','/terms.html',
  '/baby-illustration.js','/janin-summary.js'
];
const OPTIONAL_EXTERNAL=[
  'https://unpkg.com/lucide@1.47.0',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(PRECACHE.map(url=>cache.add(url)));
    await Promise.allSettled(OPTIONAL_EXTERNAL.map(url=>cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

async function networkFirstNavigation(request){
  const cache=await caches.open(CACHE);
  try{
    const response=await fetch(request);
    if(response && response.ok) cache.put(request,response.clone());
    return response;
  }catch(err){
    const url=new URL(request.url);
    return (await cache.match(request,{ignoreSearch:true})) ||
           (await cache.match(url.pathname,{ignoreSearch:true})) ||
           (url.pathname==='/' ? await cache.match('/index.html') : null) ||
           (await cache.match('/offline.html'));
  }
}


async function networkFirstAsset(request){
  const cache=await caches.open(CACHE);
  try{
    const response=await fetch(request,{cache:'no-store'});
    if(response && response.ok) cache.put(request,response.clone());
    return response;
  }catch(err){
    return (await cache.match(request)) || Response.error();
  }
}

async function cacheFirst(request){
  const cache=await caches.open(CACHE);
  const cached=await cache.match(request,{ignoreSearch:false});
  if(cached){
    fetch(request).then(response=>{
      if(response && (response.ok || response.type==='opaque')) cache.put(request,response.clone());
    }).catch(()=>{});
    return cached;
  }
  try{
    const response=await fetch(request);
    if(response && (response.ok || response.type==='opaque')) cache.put(request,response.clone());
    return response;
  }catch(err){
    return Response.error();
  }
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;
  const url=new URL(request.url);
  // API responses must not become long-lived app-shell cache entries.
  if(url.hostname==='script.google.com' || url.hostname==='script.googleusercontent.com') return;
  if(request.mode==='navigate'){
    event.respondWith(networkFirstNavigation(request));
    return;
  }
  if(url.origin===self.location.origin && url.pathname==='/cms-config.js'){
    event.respondWith(networkFirstAsset(request));
    return;
  }
  event.respondWith(cacheFirst(request));
});

self.addEventListener('message',event=>{
  if(event.data==='SKIP_WAITING') self.skipWaiting();
});

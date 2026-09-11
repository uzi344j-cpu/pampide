/* PAMPIT Service Worker
   Strateji: "önce önbellek". Oyun tek dosya ve hiç değişmiyor, bu yüzden
   ağdan tazelemeye çalışmak gereksiz gecikme yaratıyor. Sürüm değişince
   eski önbellek siliniyor. */
const CACHE='pampit-1789127243264';
const FILES=['./','./index.html','./manifest.webmanifest',
             './icon-192.png','./icon-512.png','./icon-180.png'];

self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(ks=>
    Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ).then(()=>self.clients.claim()));
});

self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch:true}).then(hit=>{
      if(hit) return hit;
      return fetch(e.request).then(res=>{
        /* Yeni bir şey geldiyse önbelleğe ekle — ama ağ yoksa
           zaten yukarıdaki eşleşme devrede. */
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request, copy)).catch(()=>{});
        return res;
      }).catch(()=> caches.match('./index.html'));
    })
  );
});

const V='sa-v1',F=['./','index.html','styles.css','script.js'];
addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(F))));
addEventListener('fetch',e=>e.respondWith(fetch(e.request).catch(()=>caches.match(e.request))));

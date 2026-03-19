const CACHE_NAME = 'cms-cache-v1';


const FILES_TO_CACHE = [
    './patternSite_1.html',
    './patternSite_1.css',
    './patternSite_1.js',
    './manifest.json',
    './source/icon-192.png',
    './source/icon-512.png',
    './source/add.svg',
    './source/edit.svg',
    './source/closs.svg',
    './source/wbell.svg',
    './source/profilee.svg',
    './source/chevron-left.svg',
    './source/chevron-right.svg',
    './source/smile-no-mouth.svg'
];


self.addEventListener('install', event => {
    console.log('[SW] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching files');
            
                return Promise.allSettled(
                    FILES_TO_CACHE.map(url =>
                        cache.add(url).catch(err => {
                            console.warn('[SW] Failed to cache:', url, err.message);
                        })
                    )
                );
            })
            .then(() => {
                console.log('[SW] Caching done');
                return self.skipWaiting();
            })
    );
});


self.addEventListener('activate', event => {
    console.log('[SW] Activate');
    event.waitUntil(
        caches.keys().then(keyList =>
            Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Removing old cache:', key);
                        return caches.delete(key);
                    }
                })
            )
        ).then(() => self.clients.claim()) 
    );
});


self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                
                    return cachedResponse;
                }
                return fetch(event.request)
                    .then(networkResponse => {
                       
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                        return networkResponse;
                    })
                    .catch(() => {
                        
                        console.warn('[SW] Offline and not cached:', event.request.url);
                    });
            })
    );
});

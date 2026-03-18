const CACHE_NAME = 'cms-cache-v1';

// Файли які кешуємо при встановленні
const FILES_TO_CACHE = [
    '/cms-students/patternSite_1.html',  // ← виправлено
    '/cms-students/patternSite_1.css',
    '/cms-students/patternSite_1.js',
    '/cms-students/manifest.json',
    '/cms-students/sw.js',
    '/cms-students/source/icon-192.png',
    // icon-512.png — додай файл або видали рядок
    '/cms-students/source/add.svg',
    '/cms-students/source/edit.svg',
    '/cms-students/source/closs.svg',
    '/cms-students/source/wbell.svg',
    '/cms-students/source/profilee.svg',
    '/cms-students/source/chevron-left.svg',
    '/cms-students/source/chevron-right.svg',
    '/cms-students/source/smile-no-mouth.svg'
];
// ---- INSTALL ----
// Спрацьовує один раз при першому завантаженні SW
self.addEventListener('install', event => {
    console.log('[SW] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching files');
                // cache.addAll падає якщо хоч один файл не знайдено
                // тому кешуємо кожен файл окремо і ігноруємо помилки
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

// ---- ACTIVATE ----
// Спрацьовує коли SW стає активним — видаляємо старі кеші
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
        ).then(() => self.clients.claim()) // беремо контроль над усіма вкладками
    );
});

// ---- FETCH ----
// Перехоплює всі мережеві запити
// Стратегія: Cache First (спочатку кеш, потім мережа)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // є в кеші — повертаємо з кешу
                    return cachedResponse;
                }
                // немає в кеші — йдемо в мережу
                return fetch(event.request)
                    .then(networkResponse => {
                        // зберігаємо нову відповідь у кеш
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                        return networkResponse;
                    })
                    .catch(() => {
                        // мережі немає і в кеші немає — показуємо заглушку
                        console.warn('[SW] Offline and not cached:', event.request.url);
                    });
            })
    );
});

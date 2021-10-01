// https://developers.google.com/web/fundamentals/primers/service-workers
const CACHE = 'cache_data';
const app_pages = [ 
    'index.html', 
    'offline_mode.html'
];

const self = this;

// Install the Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE)
        .then((cache) => {
            console.log('Opened cache');
            return cache.addAll(app_pages);
        })
    )
});

// Listen for events/request from the users
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
        .then(() => {
            return fetch(event.request).catch(() => caches.match(app_pages[1]))
        })
    )
});

// Update/Activate the Service Worker
self.addEventListener('activate', (event) => {
    const cache_allow_list = [];
    cache_allow_list.push(CACHE);

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(single_cache) {
                    if (!cache_allow_list.includes(single_cache)) {
                        return caches.delete(single_cache)
                    }
                })
            )
        })
    )
})
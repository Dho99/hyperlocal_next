const CACHE_VERSION = "priangan-halal-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

const PRECACHE_ASSETS = [
    "/",
    "/offline",
    "/manifest.webmanifest",
    "/favicon.ico",
    "/icon-192x192.png",
    "/icon-512x512.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => !key.startsWith(CACHE_VERSION))
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(networkFirst(request));
        return;
    }

    if (isNextJsAsset(url) || url.pathname.startsWith("/_next/data/")) {
        return;
    }

    if (isStaticAsset(request, url)) {
        event.respondWith(staleWhileRevalidate(request));
    }
});

function isNextJsAsset(url) {
    return url.pathname.startsWith("/_next/static/");
}

function isStaticAsset(request, url) {
    return (
        url.pathname.startsWith("/icon-") ||
        url.pathname === "/favicon.ico" ||
        url.pathname === "/manifest.webmanifest" ||
        request.destination === "font" ||
        request.destination === "image" ||
        request.destination === "style"
    );
}

async function networkFirst(request) {
    const cache = await caches.open(PAGE_CACHE);

    try {
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
    } catch {
        const cached = await cache.match(request);
        return cached || caches.match("/offline");
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);

    const fresh = fetch(request)
        .then((response) => {
            cache.put(request, response.clone());
            return response;
        })
        .catch(() => cached);

    return cached || fresh;
}

const staticCacheName = "0.2.0"
 const resourcesToCache = [
     '/',
     '/offline/',
     '/static/icons/icon-192x192.png',
     '/static/icons/icon-256x256.png',
     '/static/icons/icon-384x384.png',
     '/static/icons/icon-512x512.png',
 ];

 // Cache on install
 const addResourcesToCache = async (resources) => {
   const cache = await caches.open(staticCacheName);
   await cache.addAll(resources);
 };

 self.addEventListener("install", (event) => {
   event.waitUntil(
     addResourcesToCache(resourcesToCache)
   );
 });

 // Clear old caches on activate
 const deleteCache = async key => {
   await caches.delete(key)
 }

 const deleteOldCaches = async () => {
    const keyList = await caches.keys()
    const cachesToDelete = keyList.filter(key => (key !== staticCacheName))
    await Promise.all(cachesToDelete.map(deleteCache));
 }

 self.addEventListener('activate', (event) => {
   event.waitUntil(deleteOldCaches());
 });

 // Serve from Cache
 const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
   const responseFromCache = await caches.match(request);
   try {
     return responseFromCache || await fetch(request);
   }
   catch (error) {
     const fallbackResponse = await caches.match(fallbackUrl);
     if (fallbackResponse) {
       return fallbackResponse;
     }
     return new Response('Network error', {
       status: 408,
       headers: { 'Content-Type': 'text/plain' },
     });
   }
 };

 self.addEventListener("fetch", (event) => {
   event.respondWith(
     cacheFirst({
       request: event.request,
       fallbackUrl: "/offline/",
     })
   );
 });

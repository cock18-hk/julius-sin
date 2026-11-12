var CACHE = "julius-sin-v12";
var ASSETS = [
  "./",
  "./index.html",
  "./check.html",
  "./guide.html",
  "./measure.html",
  "./css/styles.css",
  "./css/styles.css?v=8",
  "./css/guide.css",
  "./js/app.js",
  "./js/news.js",
  "./js/check.js",
  "./js/sdq-data.js",
  "./js/guide.js",
  "./js/guide-data.js",
  "./js/pwa.js",
  "./js/measure.js",
  "./img/hero.svg",
  "./img/service.svg",
  "./img/research.svg",
  "./img/sources.svg",
  "./img/about.svg",
  "./img/school.svg",
  "./img/check.svg",
  "./img/guide.svg",
  "./img/phone.svg",
  "./img/icons/icon-192.png",
  "./img/icons/icon-512.png",
  "./img/icons/apple-touch-icon.png",
  "./img/icons/favicon.svg",
  "./manifest.webmanifest"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(ASSETS.map(function (url) {
        return fetch(new Request(url, { cache: "reload" })).then(function (response) {
          if (!response.ok) throw new Error(url);
          return cache.put(url, response);
        });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE; }).map(function (key) {
          return caches.delete(key);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  if (event.request.url.indexOf("/exam/") !== -1) return;
  event.respondWith(
    fetch(event.request).then(function (response) {
      var copy = response.clone();
      caches.open(CACHE).then(function (cache) {
        cache.put(event.request, copy);
      });
      return response;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        if (event.request.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      });
    })
  );
});

/* Service worker My PASKAM (PRD §19, ADR-019). Ditulis manual tanpa library.
 * - Aset statis (/_next/static, ikon): cache-first (nama file sudah ber-hash).
 * - Halaman lapangan tertentu: network-first, cadangan dari cache saat offline.
 * - API, server action, dan foto: tidak pernah di-cache (data privat & mutasi).
 * Naikkan VERSION setiap mengubah strategi agar cache lama dibuang. */
const VERSION = "v1";
const STATIC = `paskam-static-${VERSION}`;
const PAGES = `paskam-pages-${VERSION}`;
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/apple-touch-icon.png"];
// Halaman yang boleh dibuka offline: Beranda, daftar & form data lapangan.
const OFFLINE_PAGES = new Set(["/", "/laporan-kerja", "/laporan-kerja/baru", "/spare-part", "/spare-part/baru"]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("paskam-") && k !== STATIC && k !== PAGES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function cachePage(pathname, response) {
  // Jangan simpan redirect (mis. ke /login) atau error.
  if (!response.ok || response.redirected || new URL(response.url).pathname !== pathname) return;
  const cache = await caches.open(PAGES);
  await cache.put(pathname, response.clone());
}

async function networkFirstPage(request) {
  const url = new URL(request.url);
  try {
    const response = await fetch(request);
    if (OFFLINE_PAGES.has(url.pathname)) cachePage(url.pathname, response);
    return response;
  } catch {
    const cached = OFFLINE_PAGES.has(url.pathname) ? await caches.match(url.pathname, { cacheName: PAGES }) : undefined;
    return cached ?? (await caches.match(OFFLINE_URL)) ?? Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // server action & upload: selalu ke jaringan
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // foto privat tidak di-cache
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (request.mode === "navigate") event.respondWith(networkFirstPage(request));
  // Permintaan RSC (navigasi di dalam app) tidak ditangani: bila gagal, Next.js
  // melakukan navigasi penuh yang ditangani networkFirstPage di atas.
});

/** Simpan halaman + aset JS/CSS-nya agar form bisa dibuka offline walau belum pernah dikunjungi. */
async function warm(urls) {
  const pages = await caches.open(PAGES);
  const statics = await caches.open(STATIC);
  for (const path of urls) {
    if (!OFFLINE_PAGES.has(path)) continue;
    try {
      const response = await fetch(path, { credentials: "same-origin" });
      if (!response.ok || response.redirected) continue;
      const html = await response.clone().text();
      await pages.put(path, response);
      const assets = [...new Set(html.match(/\/_next\/static\/[^"'\s)]+/g) ?? [])];
      await Promise.all(
        assets.map(async (asset) => {
          if (await statics.match(asset)) return;
          const r = await fetch(asset);
          if (r.ok) await statics.put(asset, r);
        }),
      );
    } catch {
      /* offline saat pemanasan: abaikan */
    }
  }
}

self.addEventListener("message", (event) => {
  const data = event.data || {};
  // Logout: buang halaman yang berisi data user (perangkat bisa dipakai bergantian).
  if (data.type === "CLEAR_USER_CACHE") event.waitUntil(caches.delete(PAGES));
  if (data.type === "WARM" && Array.isArray(data.urls)) event.waitUntil(warm(data.urls));
});

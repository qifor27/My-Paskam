"use client";

import { useEffect } from "react";

/** Daftarkan service worker (hanya produksi; di dev mengganggu hot reload). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);
  return null;
}

/**
 * Kirim pesan ke service worker. Menunggu SW aktif (kunjungan pertama SW masih
 * "installing"), maks. 10 dtk. Mengembalikan true bila pesan benar-benar terkirim.
 */
export async function postToServiceWorker(message: unknown): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return false;
  const active =
    reg.active ??
    (await Promise.race([navigator.serviceWorker.ready.then((r) => r.active), new Promise<null>((r) => setTimeout(() => r(null), 10_000))]));
  if (!active) return false;
  active.postMessage(message);
  return true;
}

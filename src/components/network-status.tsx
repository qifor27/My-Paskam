"use client";

import { WifiOff } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function useOnline() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true, // server render: anggap online
  );
}

/**
 * Banner kondisi jaringan (PRD §19, §22). Pesan penyimpanan offline akan
 * diperluas di Sprint 7 saat sync queue tersedia.
 */
export function NetworkBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" className="flex items-center gap-2 border-b border-warning-600/35 bg-warning-50 px-4 py-2 text-sm font-medium text-warning-900">
      <WifiOff className="size-4 shrink-0" aria-hidden />
      <span>Koneksi internet terputus. Isian Anda tidak akan dihapus.</span>
    </div>
  );
}

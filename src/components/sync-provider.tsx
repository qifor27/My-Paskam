"use client";

import { CloudUpload, LogIn, RotateCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { useOnline } from "@/components/network-status";
import { postToServiceWorker } from "@/components/sw-register";
import { requestPersistentStorage } from "@/lib/draft-store";
import { DRAFTS_CHANGED } from "@/lib/sync/draft-types";
import { countOutbox, processOutbox, type OutboxCounts } from "@/lib/sync/outbox";
import { cn } from "@/lib/utils";

type SyncState = OutboxCounts & { syncing: boolean; sessionExpired: boolean; syncNow: () => void };
const SyncContext = createContext<SyncState | null>(null);
export const useSync = () => useContext(SyncContext);

const RETRY_MS = 30_000;
// Halaman yang disimpan service worker agar form lapangan bisa dibuka offline.
const WARM_URLS = ["/", "/laporan-kerja", "/laporan-kerja/baru", "/spare-part", "/spare-part/baru"];

/**
 * Menjalankan antrean kirim (ADR-019): saat aplikasi dibuka, saat kembali online,
 * berkala selama masih ada antrean, dan saat user menekan "Kirim sekarang".
 */
export function SyncProvider({ userId, warmOffline, children }: { userId: string; warmOffline: boolean; children: React.ReactNode }) {
  const router = useRouter();
  const online = useOnline();
  const [counts, setCounts] = useState<OutboxCounts>({ queued: 0, failed: 0 });
  const [syncing, setSyncing] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const busy = useRef(false);

  const refresh = useCallback(() => {
    countOutbox(userId).then(setCounts).catch(() => {});
  }, [userId]);

  const syncNow = useCallback(async () => {
    if (busy.current || !navigator.onLine) return;
    const current = await countOutbox(userId).catch(() => ({ queued: 0, failed: 0 }));
    // Tampilkan jumlah antrean sebelum mengirim (proses bisa lama bila jaringan lambat).
    setCounts(current);
    if (current.queued === 0) return;
    busy.current = true;
    setSyncing(true);
    try {
      const result = await processOutbox(userId);
      setSessionExpired(result.sessionExpired);
      if (result.sent > 0) router.refresh();
    } finally {
      busy.current = false;
      setSyncing(false);
      refresh();
    }
  }, [userId, refresh, router]);

  useEffect(() => {
    requestPersistentStorage();
    // Langsung coba kirim saat aplikasi dibuka (iOS tidak punya Background Sync).
    const initial = setTimeout(() => void syncNow(), 0);
    const onChanged = () => refresh();
    const onOnline = () => void syncNow();
    window.addEventListener(DRAFTS_CHANGED, onChanged);
    window.addEventListener("online", onOnline);
    return () => {
      clearTimeout(initial);
      window.removeEventListener(DRAFTS_CHANGED, onChanged);
      window.removeEventListener("online", onOnline);
    };
  }, [refresh, syncNow]);

  // Coba ulang berkala selama masih ada antrean (mis. server sempat gangguan).
  useEffect(() => {
    if (counts.queued === 0 || !online) return;
    const timer = setInterval(() => void syncNow(), RETRY_MS);
    return () => clearInterval(timer);
  }, [counts.queued, online, syncNow]);

  // Simpan form lapangan ke cache sekali per sesi browser agar bisa dibuka offline.
  useEffect(() => {
    if (!warmOffline || !online) return;
    try {
      if (sessionStorage.getItem("paskam:warmed")) return;
    } catch {}
    const timer = setTimeout(async () => {
      // Penanda hanya diset bila pesan sampai ke SW yang aktif (kunjungan pertama SW belum aktif).
      if (await postToServiceWorker({ type: "WARM", urls: WARM_URLS })) {
        try {
          sessionStorage.setItem("paskam:warmed", "1");
        } catch {}
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [warmOffline, online]);

  return (
    <SyncContext.Provider value={{ ...counts, syncing, sessionExpired, syncNow: () => void syncNow() }}>{children}</SyncContext.Provider>
  );
}

/** Banner antrean kirim di atas konten (PRD §22 banner untuk kondisi sistem). */
export function SyncBanner() {
  const sync = useSync();
  const online = useOnline();
  if (!sync || (sync.queued === 0 && sync.failed === 0)) return null;

  if (sync.sessionExpired && sync.queued > 0) {
    return (
      <Bar tone="warning" icon={LogIn}>
        <span className="flex-1">{sync.queued} data menunggu dikirim. Sesi berakhir — login kembali untuk mengirim.</span>
        <Link href="/login" className="shrink-0 font-semibold underline">
          Login
        </Link>
      </Bar>
    );
  }
  return (
    <>
      {sync.queued > 0 ? (
        <Bar tone="info" icon={sync.syncing ? RotateCw : CloudUpload} spin={sync.syncing}>
          <span className="flex-1">
            {sync.syncing ? "Mengirim data…" : `${sync.queued} data menunggu dikirim${online ? "" : " · otomatis saat online"}`}
          </span>
          {online && !sync.syncing ? (
            <button type="button" onClick={sync.syncNow} className="shrink-0 rounded-full px-2 py-1 font-semibold underline">
              Kirim sekarang
            </button>
          ) : null}
        </Bar>
      ) : null}
      {sync.failed > 0 ? (
        <Bar tone="danger" icon={TriangleAlert}>
          <span className="flex-1">{sync.failed} data gagal dikirim dan perlu diperiksa.</span>
          <Link href="/laporan-kerja" className="shrink-0 font-semibold underline">
            Lihat
          </Link>
        </Bar>
      ) : null}
    </>
  );
}

function Bar({
  tone,
  icon: Icon,
  spin,
  children,
}: {
  tone: "info" | "warning" | "danger";
  icon: typeof CloudUpload;
  spin?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2 border-b px-4 py-2 text-sm font-medium",
        tone === "info" && "border-brand-600/15 bg-brand-50 text-brand-900",
        tone === "warning" && "border-warning-600/35 bg-warning-50 text-warning-900",
        tone === "danger" && "border-danger-600/20 bg-danger-50 text-danger-800",
      )}
    >
      <Icon className={cn("size-4 shrink-0", spin && "animate-spin motion-reduce:animate-none")} aria-hidden />
      {children}
    </div>
  );
}

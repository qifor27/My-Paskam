import { WifiOff } from "lucide-react";
import type { Metadata } from "next";

import { BrandMark, Wordmark } from "@/components/brand";
import { Card } from "@/components/ui/card";

import { RetryButton } from "./retry-button";

export const metadata: Metadata = { title: "Offline" };
// Statis: disimpan service worker sebagai cadangan saat halaman belum pernah dibuka.
export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center px-4 pt-[calc(3rem+env(safe-area-inset-top))]">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center gap-3">
          <BrandMark />
          <Wordmark className="text-xl" />
        </div>
        <Card className="flex flex-col items-center gap-4 p-6 text-center">
          <span className="flex size-14 items-center justify-center rounded-[var(--radius-control)] bg-warning-50 text-warning-600">
            <WifiOff className="size-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-lg font-bold">Tidak ada koneksi</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Halaman ini belum tersimpan di HP. Data yang sudah Anda isi tetap aman dan akan dikirim saat koneksi kembali.
            </p>
          </div>
          <RetryButton />
        </Card>
      </div>
    </main>
  );
}

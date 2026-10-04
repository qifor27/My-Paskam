"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Error tak terduga saat memuat halaman (PRD §21 Unexpected Error).
// Stack trace tidak ditampilkan; digest = kode laporan yang juga ada di log server.
export function ErrorScreen({ digest, reset }: { digest?: string; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Halaman gagal dimuat</h1>
      <Alert
        tone="error"
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() =>
                startTransition(() => {
                  router.refresh();
                  reset();
                })
              }
            >
              <RefreshCw aria-hidden /> COBA LAGI
            </Button>
            <Link
              href="/"
              className="inline-flex h-11 items-center px-3 text-sm font-medium text-danger-700 underline underline-offset-4"
            >
              Ke beranda
            </Link>
          </div>
        }
      >
        <p>Terjadi masalah saat memproses permintaan. Data yang belum tersimpan tidak akan dihapus.</p>
        {digest ? (
          <p className="mt-1 text-xs opacity-80">
            Kode laporan: <code>{digest}</code>
          </p>
        ) : null}
      </Alert>
    </div>
  );
}

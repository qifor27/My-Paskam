"use client";

import { FileDown } from "lucide-react";
import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/** Unduh PDF sesuai filter aktif (PRD §17). Ada loading & pesan error yang jelas. */
export function ExportPdfButton({ query }: { query: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/laporan-data/pdf?${query}`);
      if (!res.ok) {
        setError((await res.text()) || "PDF gagal dibuat. Coba lagi.");
        return;
      }
      const blob = await res.blob();
      const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? "paskam-laporan.pdf";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setError("Koneksi terputus. PDF belum diunduh, coba lagi saat online.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button size="sm" onClick={download} loading={pending} loadingText="Membuat PDF…">
        <FileDown aria-hidden /> Export PDF
      </Button>
      {error ? (
        <Alert tone="error" className="w-full max-w-sm text-left">
          {error}
        </Alert>
      ) : null}
    </div>
  );
}

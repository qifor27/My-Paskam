"use client";

import { ChevronRight, HardDrive } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatISODate } from "@/lib/format";
import { laporanDrafts, type LaporanDraft } from "@/lib/laporan-kerja/draft";

/** Laporan yang masih tersimpan di HP (belum terkirim). Data hanya ada di perangkat ini. */
export function LocalDrafts({ units }: { units: Record<string, string> }) {
  const [drafts, setDrafts] = useState<LaporanDraft[]>([]);

  useEffect(() => {
    laporanDrafts
      .list()
      .then((all) => setDrafts(all.sort((a, b) => b.updatedAt - a.updatedAt)))
      .catch(() => {});
  }, []);

  if (drafts.length === 0) return null;

  return (
    <section aria-labelledby="draft-title" className="flex flex-col gap-3">
      <h2 id="draft-title" className="flex items-center gap-2 text-base font-semibold">
        <HardDrive className="size-4 text-ink-muted" aria-hidden /> Belum terkirim ({drafts.length})
      </h2>
      <Card className="divide-y divide-border overflow-hidden">
        {drafts.map((d) => {
          const pendingPhotos = d.photos.filter((p) => !p.uploaded).length;
          return (
            <Link
              key={d.id}
              href={d.mode === "edit" ? `/laporan-kerja/${d.id}/edit` : `/laporan-kerja/baru?draft=${d.id}`}
              className="flex items-center gap-3 p-4 hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {units[d.fields.unitId] ?? "Unit belum dipilih"} · {d.mode === "edit" ? "perubahan" : "laporan baru"}
                </p>
                <p className="text-sm tabular-nums text-ink-muted">
                  {d.fields.tanggal ? formatISODate(d.fields.tanggal) : "Tanpa tanggal"}
                  {pendingPhotos > 0 ? ` · ${pendingPhotos} foto belum terunggah` : ""}
                </p>
              </div>
              <StatusBadge tone="warning" icon={HardDrive}>
                Tersimpan di HP
              </StatusBadge>
              <ChevronRight className="size-5 shrink-0 text-ink-muted" aria-hidden />
            </Link>
          );
        })}
      </Card>
    </section>
  );
}

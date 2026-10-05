"use client";

import { ChevronRight, CloudUpload, HardDrive, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatISODate } from "@/lib/format";
import { laporanDrafts } from "@/lib/laporan-kerja/draft";
import { sparePartDrafts } from "@/lib/spare-part/draft";
import { DRAFTS_CHANGED, type DraftSync } from "@/lib/sync/draft-types";

type Row = { id: string; href: string; title: string; subtitle: string; updatedAt: number; sync?: DraftSync };

const LOADERS = {
  "laporan-kerja": async (userId: string, units: Record<string, string>): Promise<Row[]> =>
    (await laporanDrafts.list())
      .filter((d) => d.userId === userId)
      .map((d) => {
        const pending = d.photos.filter((p) => !p.uploaded).length;
        return {
          id: d.id,
          href: d.mode === "edit" ? `/laporan-kerja/${d.id}/edit` : `/laporan-kerja/baru?draft=${d.id}`,
          title: `${units[d.fields.unitId] ?? "Unit belum dipilih"} · ${d.mode === "edit" ? "perubahan" : "laporan baru"}`,
          subtitle: `${d.fields.tanggal ? formatISODate(d.fields.tanggal) : "Tanpa tanggal"}${pending ? ` · ${pending} foto belum terunggah` : ""}`,
          updatedAt: d.updatedAt,
          sync: d.sync,
        };
      }),
  "spare-part": async (userId: string, units: Record<string, string>): Promise<Row[]> =>
    (await sparePartDrafts.list())
      .filter((d) => d.userId === userId)
      .map((d) => {
        const pending = d.photos.filter((p) => !p.uploaded).length;
        return {
          id: d.id,
          href: d.mode === "edit" ? `/spare-part/${d.id}/edit` : `/spare-part/baru?draft=${d.id}`,
          title: `${d.fields.partName || "Spare part"} · ${units[d.fields.unitId] ?? "unit belum dipilih"}`,
          subtitle: `${d.mode === "edit" ? "Perubahan" : "Catatan baru"}${pending ? ` · ${pending} foto belum terunggah` : ""}`,
          updatedAt: d.updatedAt,
          sync: d.sync,
        };
      }),
};

// Bahasa status mengikuti nasib data (riset web.dev): di HP / menunggu / gagal.
function SyncBadge({ sync }: { sync?: DraftSync }) {
  if (sync?.status === "queued")
    return (
      <StatusBadge tone="info" icon={CloudUpload}>
        Menunggu dikirim
      </StatusBadge>
    );
  if (sync?.status === "failed")
    return (
      <StatusBadge tone="danger" icon={TriangleAlert}>
        Gagal dikirim
      </StatusBadge>
    );
  return (
    <StatusBadge tone="warning" icon={HardDrive}>
      Draft di HP
    </StatusBadge>
  );
}

/** Data yang masih tersimpan di HP milik akun ini (belum terkirim). */
export function LocalDrafts({ kind, userId, units }: { kind: keyof typeof LOADERS; userId: string; units: Record<string, string> }) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const load = () =>
      LOADERS[kind](userId, units)
        .then((all) => setRows(all.sort((a, b) => b.updatedAt - a.updatedAt)))
        .catch(() => {});
    load();
    window.addEventListener(DRAFTS_CHANGED, load);
    return () => window.removeEventListener(DRAFTS_CHANGED, load);
  }, [kind, userId, units]);

  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="draft-title" className="flex flex-col gap-3">
      <h2 id="draft-title" className="flex items-center gap-2 text-base font-semibold">
        <HardDrive className="size-4 text-ink-muted" aria-hidden /> Belum terkirim ({rows.length})
      </h2>
      <Card className="divide-y divide-border overflow-hidden">
        {rows.map((r) => (
          <Link key={r.id} href={r.href} className="flex items-center gap-3 p-4 hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{r.title}</p>
              <p className="text-sm tabular-nums text-ink-muted">{r.subtitle}</p>
              {r.sync?.status === "failed" ? <p className="mt-1 text-sm font-medium text-danger-800">{r.sync.error} Ketuk untuk memperbaiki.</p> : null}
            </div>
            <SyncBadge sync={r.sync} />
            <ChevronRight className="size-5 shrink-0 text-ink-muted" aria-hidden />
          </Link>
        ))}
      </Card>
    </section>
  );
}

"use client";

import { ChevronRight, HardDrive } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatISODate } from "@/lib/format";
import { laporanDrafts } from "@/lib/laporan-kerja/draft";
import { sparePartDrafts } from "@/lib/spare-part/draft";

type Row = { id: string; href: string; title: string; subtitle: string; updatedAt: number };

const LOADERS = {
  "laporan-kerja": async (units: Record<string, string>): Promise<Row[]> =>
    (await laporanDrafts.list()).map((d) => {
      const pending = d.photos.filter((p) => !p.uploaded).length;
      return {
        id: d.id,
        href: d.mode === "edit" ? `/laporan-kerja/${d.id}/edit` : `/laporan-kerja/baru?draft=${d.id}`,
        title: `${units[d.fields.unitId] ?? "Unit belum dipilih"} · ${d.mode === "edit" ? "perubahan" : "laporan baru"}`,
        subtitle: `${d.fields.tanggal ? formatISODate(d.fields.tanggal) : "Tanpa tanggal"}${pending ? ` · ${pending} foto belum terunggah` : ""}`,
        updatedAt: d.updatedAt,
      };
    }),
  "spare-part": async (units: Record<string, string>): Promise<Row[]> =>
    (await sparePartDrafts.list()).map((d) => {
      const pending = d.photos.filter((p) => !p.uploaded).length;
      return {
        id: d.id,
        href: d.mode === "edit" ? `/spare-part/${d.id}/edit` : `/spare-part/baru?draft=${d.id}`,
        title: `${d.fields.partName || "Spare part"} · ${units[d.fields.unitId] ?? "unit belum dipilih"}`,
        subtitle: `${d.mode === "edit" ? "Perubahan" : "Catatan baru"}${pending ? ` · ${pending} foto belum terunggah` : ""}`,
        updatedAt: d.updatedAt,
      };
    }),
};

/** Data yang masih tersimpan di HP (belum terkirim). Hanya ada di perangkat ini. */
export function LocalDrafts({ kind, units }: { kind: keyof typeof LOADERS; units: Record<string, string> }) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    LOADERS[kind](units)
      .then((all) => setRows(all.sort((a, b) => b.updatedAt - a.updatedAt)))
      .catch(() => {});
  }, [kind, units]);

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
            </div>
            <StatusBadge tone="warning" icon={HardDrive}>
              Tersimpan di HP
            </StatusBadge>
            <ChevronRight className="size-5 shrink-0 text-ink-muted" aria-hidden />
          </Link>
        ))}
      </Card>
    </section>
  );
}

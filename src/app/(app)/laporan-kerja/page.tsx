import { Camera, ChevronRight, ClipboardList, Fuel, Plus, Timer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AccessDenied } from "@/components/access-denied";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { dayLabel, formatDecimal } from "@/lib/format";
import { listLaporan, PAGE_SIZE, type LaporanRow } from "@/lib/laporan-kerja/queries";
import { cn } from "@/lib/utils";

import { LocalDrafts } from "@/components/local-drafts";

export const metadata: Metadata = { title: "Laporan Kerja" };

export default async function LaporanListPage({
  searchParams,
}: {
  searchParams: Promise<{ hal?: string; dihapus?: string }>;
}) {
  const user = await requireUser();
  if (!can(user.role, "laporan-kerja:access")) return <AccessDenied />;
  const { hal, dihapus } = await searchParams;
  const pages = Math.min(Math.max(Number(hal) || 1, 1), 50);
  const { items, hasMore } = await listLaporan(user, pages * PAGE_SIZE);
  const canCreate = can(user.role, "laporan-kerja:create");
  const viewAll = can(user.role, "laporan-kerja:view-all");
  const units = canCreate
    ? Object.fromEntries((await db.unit.findMany({ select: { id: true, name: true } })).map((u) => [u.id, u.name]))
    : {};

  // Kelompok per tanggal: "Hari ini", "Kemarin", lalu tanggal lengkap.
  const groups = new Map<string, LaporanRow[]>();
  for (const row of items) groups.set(row.tanggal, [...(groups.get(row.tanggal) ?? []), row]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Laporan Kerja"
        description={viewAll ? "Semua Pengawas" : "Laporan Anda"}
        action={
          canCreate ? (
            <Link href="/laporan-kerja/baru" className={cn(buttonVariants({ size: "sm" }))}>
              <Plus aria-hidden /> Buat
            </Link>
          ) : undefined
        }
      />

      {dihapus ? <Alert tone="success">Laporan dihapus.</Alert> : null}
      {canCreate ? <LocalDrafts kind="laporan-kerja" units={units} /> : null}

      {items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada laporan kerja"
          description={canCreate ? "Laporan yang Anda buat akan muncul di sini." : "Laporan dari Pengawas akan muncul di sini."}
          action={
            canCreate ? (
              <Link href="/laporan-kerja/baru" className={buttonVariants()}>
                <Plus aria-hidden /> Buat laporan
              </Link>
            ) : undefined
          }
        />
      ) : (
        [...groups].map(([tanggal, rows]) => (
          <section key={tanggal} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-ink-muted">{dayLabel(tanggal)}</h2>
            <Card className="divide-y divide-border overflow-hidden">
              {rows.map((r) => (
                <Link
                  key={r.id}
                  href={`/laporan-kerja/${r.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {r.unitName} <span className="font-normal text-ink-muted">· {r.operatorName}</span>
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm tabular-nums text-ink-muted">
                      <span className="inline-flex items-center gap-1">
                        <Timer className="size-4" aria-hidden /> {formatDecimal(r.hmJam)} jam
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Fuel className="size-4" aria-hidden /> BBM {formatDecimal(r.bbm)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Camera className="size-4" aria-hidden /> {r.photoCount}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-sm text-ink-muted">
                      {viewAll ? `${r.supervisorName} · ` : ""}
                      {r.lokasi}
                    </p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-ink-muted" aria-hidden />
                </Link>
              ))}
            </Card>
          </section>
        ))
      )}

      {hasMore ? (
        // "Muat lebih banyak" lebih andal dari infinite scroll di koneksi lemah (riset NN/g).
        <Link href={`/laporan-kerja?hal=${pages + 1}`} scroll={false} className={cn(buttonVariants({ variant: "secondary" }), "self-center")}>
          Muat lebih banyak
        </Link>
      ) : null}
    </div>
  );
}

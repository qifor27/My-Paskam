import { Camera, ChevronRight, MapPin, Package, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AccessDenied } from "@/components/access-denied";
import { EmptyState } from "@/components/empty-state";
import { LocalDrafts } from "@/components/local-drafts";
import { PageHeader } from "@/components/page-header";
import { PriorityBadge } from "@/components/priority-badge";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { dayLabel, formatTime } from "@/lib/format";
import { listSpareParts, PAGE_SIZE, type SparePartRow } from "@/lib/spare-part/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Order Spare Part" };

export default async function SparePartListPage({ searchParams }: { searchParams: Promise<{ hal?: string; dihapus?: string; antre?: string }> }) {
  const user = await requireUser();
  if (!can(user.role, "spare-part:access")) return <AccessDenied />;
  const { hal, dihapus, antre } = await searchParams;
  const pages = Math.min(Math.max(Number(hal) || 1, 1), 50);
  const { items, hasMore } = await listSpareParts(user, pages * PAGE_SIZE);
  const canCreate = can(user.role, "spare-part:create");
  const viewAll = can(user.role, "spare-part:view-all");
  const units = canCreate
    ? Object.fromEntries((await db.unit.findMany({ select: { id: true, name: true } })).map((u) => [u.id, u.name]))
    : {};

  const groups = new Map<string, SparePartRow[]>();
  for (const row of items) groups.set(row.tanggal, [...(groups.get(row.tanggal) ?? []), row]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Order Spare Part"
        description={viewAll ? "Dokumentasi spare part rusak · semua Pengawas" : "Dokumentasi spare part rusak"}
        action={
          canCreate ? (
            <Link href="/spare-part/baru" className={cn(buttonVariants({ size: "sm" }))}>
              <Plus aria-hidden /> Catat
            </Link>
          ) : undefined
        }
      />

      {antre ? <Alert tone="info">Catatan disimpan di HP dan akan dikirim otomatis saat koneksi tersedia.</Alert> : null}
      {dihapus ? <Alert tone="success">Catatan dihapus.</Alert> : null}
      {canCreate ? <LocalDrafts kind="spare-part" userId={user.id} units={units} /> : null}

      {items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Belum ada catatan spare part"
          description={canCreate ? "Catat spare part yang rusak beserta fotonya." : "Catatan spare part rusak dari Pengawas akan muncul di sini."}
          action={
            canCreate ? (
              <Link href="/spare-part/baru" className={buttonVariants()}>
                <Plus aria-hidden /> Catat spare part
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
                <Link key={r.id} href={`/spare-part/${r.id}`} className="flex items-center gap-3 p-4 hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold">
                        {r.partName} <span className="font-normal tabular-nums text-ink-muted">×{r.quantity} · {r.unitName}</span>
                      </p>
                      <PriorityBadge priority={r.priority} />
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm tabular-nums text-ink-muted">
                      <span>{formatTime(r.createdAt)}</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-4" aria-hidden /> {r.lokasi}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Camera className="size-4" aria-hidden /> {r.photoCount}
                      </span>
                    </p>
                    {viewAll ? <p className="mt-0.5 truncate text-sm text-ink-muted">{r.supervisorName}</p> : null}
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-ink-muted" aria-hidden />
                </Link>
              ))}
            </Card>
          </section>
        ))
      )}

      {hasMore ? (
        <Link href={`/spare-part?hal=${pages + 1}`} scroll={false} className={cn(buttonVariants({ variant: "secondary" }), "self-center")}>
          Muat lebih banyak
        </Link>
      ) : null}
    </div>
  );
}

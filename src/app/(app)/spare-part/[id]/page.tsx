import { Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Avatar } from "@/components/avatar";
import { DeleteRecord } from "@/components/delete-record";
import { PageHeader } from "@/components/page-header";
import { PriorityBadge } from "@/components/priority-badge";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { recorderName } from "@/lib/people";
import { formatDateTime } from "@/lib/format";
import { recordPhotos } from "@/lib/photo/service";
import { canEditSparePart, canViewSparePart } from "@/lib/spare-part/access";
import { cn } from "@/lib/utils";

import { deleteSparePart } from "../actions";

export const metadata: Metadata = { title: "Detail Spare Part" };

export default async function SparePartDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tersimpan?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { tersimpan } = await searchParams;
  if (!z.uuid().safeParse(id).success) notFound();
  const record = await db.orderSparePart.findUnique({
    where: { id },
    include: { unit: { select: { name: true } }, supervisor: { select: { name: true, role: true } } },
  });
  if (!record || !canViewSparePart(user, record)) notFound();
  const photos = await recordPhotos("ORDER_SPARE_PART", record);
  const editable = canEditSparePart(user, record);
  const edited = record.updatedAt.getTime() - record.createdAt.getTime() > 1000;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={record.partName}
        description={record.unit.name}
        backHref="/spare-part"
        action={
          editable ? (
            <Link href={`/spare-part/${id}/edit`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
              <Pencil aria-hidden /> Ubah
            </Link>
          ) : undefined
        }
      />

      {tersimpan ? <Alert tone="success">{tersimpan === "baru" ? "Catatan berhasil disimpan." : "Perubahan disimpan."}</Alert> : null}

      <Card className="grid grid-cols-2 gap-px overflow-hidden bg-border p-0">
        <div className="flex flex-col gap-1 bg-surface p-4">
          <span className="text-sm text-ink-muted">Jumlah</span>
          <span className="text-2xl font-bold tabular-nums">{record.quantity}</span>
        </div>
        <div className="flex flex-col items-start gap-2 bg-surface p-4">
          <span className="text-sm text-ink-muted">Prioritas</span>
          <PriorityBadge priority={record.priority} />
        </div>
      </Card>

      <Card className="flex flex-col divide-y divide-border">
        {record.partNumber ? (
          <div className="flex items-start justify-between gap-4 p-4">
            <span className="text-sm text-ink-muted">Nomor part</span>
            <span className="text-right font-medium tabular-nums">{record.partNumber}</span>
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-4 p-4">
          <span className="text-sm text-ink-muted">Unit</span>
          <span className="text-right font-medium">{record.unit.name}</span>
        </div>
        <div className="flex items-start justify-between gap-4 p-4">
          <span className="text-sm text-ink-muted">Lokasi</span>
          <span className="text-right font-medium">{record.lokasi}</span>
        </div>
        <div className="flex flex-col gap-1 p-4">
          <span className="text-sm text-ink-muted">Deskripsi kerusakan</span>
          <p className="whitespace-pre-line">{record.kerusakan}</p>
        </div>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Foto kerusakan ({photos.length})</h2>
        {photos.length > 0 ? (
          <ul className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <li key={p.id}>
                <a href={`/api/foto/${p.id}`} target="_blank" rel="noopener" className="block aspect-square overflow-hidden rounded-[var(--radius-control)] border border-border bg-canvas">
                  {/* eslint-disable-next-line @next/next/no-img-element -- foto privat lewat route terotorisasi */}
                  <img src={`/api/foto/${p.id}`} alt={`Foto ${record.partName}`} className="size-full object-cover" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <Alert tone="warning">Foto tidak tersedia.</Alert>
        )}
      </section>

      <Card className="flex items-center gap-3 p-4">
        <Avatar name={record.supervisor.name} size="sm" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold">{recorderName(record.supervisor)}</p>
          <p className="tabular-nums text-ink-muted">
            Dicatat {formatDateTime(record.createdAt)}
            {edited ? ` · diubah ${formatDateTime(record.updatedAt)}` : ""}
          </p>
        </div>
      </Card>

      {editable ? <DeleteRecord id={id} action={deleteSparePart} redirectTo="/spare-part?dihapus=1" noun="catatan" /> : null}
    </div>
  );
}

import { Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Avatar } from "@/components/avatar";
import { ModuleTile } from "@/components/nav-icon";
import { PageHeader } from "@/components/page-header";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { dateToISO, formatDateTime, formatDecimal, formatISODate } from "@/lib/format";
import { canEditLaporan, canViewLaporan } from "@/lib/laporan-kerja/access";
import { laporanPhotos } from "@/lib/photo/service";
import { cn } from "@/lib/utils";

import { DeleteLaporan } from "./delete-laporan";

export const metadata: Metadata = { title: "Detail Laporan Kerja" };

export default async function LaporanDetailPage({
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
  const laporan = await db.laporanKerja.findUnique({
    where: { id },
    include: { unit: { select: { name: true } }, supervisor: { select: { name: true, kodePengawas: true } } },
  });
  // 404 (bukan 403) agar laporan Pengawas lain tidak terungkap keberadaannya.
  if (!laporan || !canViewLaporan(user, laporan)) notFound();
  const photos = await laporanPhotos(laporan);
  const editable = canEditLaporan(user, laporan);
  const edited = laporan.updatedAt.getTime() - laporan.createdAt.getTime() > 1000;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={laporan.unit.name}
        description={formatISODate(dateToISO(laporan.tanggal), "long")}
        backHref="/laporan-kerja"
        action={
          editable ? (
            <Link href={`/laporan-kerja/${id}/edit`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
              <Pencil aria-hidden /> Ubah
            </Link>
          ) : undefined
        }
      />

      {tersimpan ? <Alert tone="success">{tersimpan === "baru" ? "Laporan berhasil disimpan." : "Perubahan disimpan."}</Alert> : null}

      <Card className="grid grid-cols-2 gap-px overflow-hidden bg-border p-0">
        <Stat label="HM" value={`${formatDecimal(Number(laporan.hmJam))} jam`} />
        <Stat label="BBM (Solar)" value={String(laporan.bbm)} />
      </Card>

      <Card className="flex flex-col divide-y divide-border">
        <Row label="Operator" value={laporan.operatorName} />
        <Row label="Lokasi" value={laporan.lokasi} />
        <div className="flex flex-col gap-1 p-4">
          <span className="text-sm text-ink-muted">Deskripsi pekerjaan</span>
          <p className="whitespace-pre-line">{laporan.deskripsi}</p>
        </div>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Dokumentasi foto ({photos.length})</h2>
        {photos.length > 0 ? (
          <ul className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <li key={p.id}>
                <a href={`/api/foto/${p.id}`} target="_blank" rel="noopener" className="block aspect-square overflow-hidden rounded-[var(--radius-control)] border border-border bg-canvas">
                  {/* eslint-disable-next-line @next/next/no-img-element -- foto privat lewat route terotorisasi */}
                  <img src={`/api/foto/${p.id}`} alt={`Foto ${laporan.unit.name}`} className="size-full object-cover" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <Alert tone="warning">Foto tidak tersedia.</Alert>
        )}
      </section>

      <Card className="flex items-center gap-3 p-4">
        <Avatar name={laporan.supervisor.name} size="sm" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold">{laporan.supervisor.name}</p>
          <p className="tabular-nums text-ink-muted">
            Dibuat {formatDateTime(laporan.createdAt)}
            {edited ? ` · diubah ${formatDateTime(laporan.updatedAt)}` : ""}
          </p>
        </div>
        <ModuleTile icon="laporan-kerja" color="blue" className="hidden sm:flex" />
      </Card>

      {editable ? <DeleteLaporan id={id} /> : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-surface p-4">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-2xl font-bold tabular-nums">{value}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

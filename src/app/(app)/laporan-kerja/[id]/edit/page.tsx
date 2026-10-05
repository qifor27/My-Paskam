import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { AccessDenied } from "@/components/access-denied";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { dateToISO, todayISO } from "@/lib/format";
import { canEditLaporan, canViewLaporan } from "@/lib/laporan-kerja/access";
import { fieldSuggestions, selectableUnits } from "@/lib/laporan-kerja/queries";
import { laporanPhotos } from "@/lib/photo/service";

import { LaporanForm } from "../../laporan-form";

export const metadata: Metadata = { title: "Ubah Laporan Kerja" };

export default async function EditLaporanPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const laporan = await db.laporanKerja.findUnique({ where: { id } });
  if (!laporan || !canViewLaporan(user, laporan)) notFound();
  if (!canEditLaporan(user, laporan)) return <AccessDenied />;

  const [units, suggestions, photos] = await Promise.all([
    selectableUnits(laporan.unitId),
    fieldSuggestions(user.id),
    laporanPhotos(laporan),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Ubah laporan kerja" backHref={`/laporan-kerja/${id}`} />
      <LaporanForm
        userId={user.id}
        mode="edit"
        id={id}
        today={todayISO()}
        units={units}
        suggestions={suggestions}
        initialPhotos={photos}
        initialFields={{
          tanggal: dateToISO(laporan.tanggal),
          unitId: laporan.unitId,
          operatorName: laporan.operatorName,
          hmJam: String(Number(laporan.hmJam)).replace(".", ","),
          bbm: String(Number(laporan.bbm)).replace(".", ","),
          lokasi: laporan.lokasi,
          deskripsi: laporan.deskripsi,
        }}
      />
    </div>
  );
}

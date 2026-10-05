import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { AccessDenied } from "@/components/access-denied";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { dateToISO, todayISO } from "@/lib/format";
import { selectableUnits } from "@/lib/laporan-kerja/queries";
import { canEditPlanning, canViewPlanning } from "@/lib/planning/access";
import { activePengawas } from "@/lib/planning/queries";

import { PlanningForm } from "../../planning-form";

export const metadata: Metadata = { title: "Ubah Planning Job" };

export default async function EditPlanningPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const job = await db.planningJob.findUnique({ where: { id }, include: { supervisor: { select: { id: true, name: true, kodePengawas: true } } } });
  if (!job || !canViewPlanning(user, job)) notFound();
  if (!canEditPlanning(user, job)) return <AccessDenied />;

  const [pengawasAktif, units] = await Promise.all([activePengawas(), selectableUnits(job.unitId)]);
  // Pengawas yang sudah nonaktif tetap tampil agar planning lama bisa disimpan.
  const pengawas = pengawasAktif.some((p) => p.id === job.supervisorId) ? pengawasAktif : [...pengawasAktif, job.supervisor];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Ubah planning job" backHref={`/planning-job/${id}`} />
      <PlanningForm
        mode="edit"
        id={id}
        today={todayISO()}
        pengawas={pengawas}
        units={units}
        initial={{
          supervisorId: job.supervisorId,
          unitId: job.unitId,
          namaPekerjaan: job.namaPekerjaan,
          lokasi: job.lokasi,
          deskripsi: job.deskripsi,
          estimasiMulai: dateToISO(job.estimasiMulai),
          estimasiSelesai: dateToISO(job.estimasiSelesai),
        }}
      />
    </div>
  );
}

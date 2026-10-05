import { Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Avatar } from "@/components/avatar";
import { DeleteRecord } from "@/components/delete-record";
import { PageHeader } from "@/components/page-header";
import { PlanningStatusBadge } from "@/components/planning-status-badge";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { dateToISO, formatDateTime, formatISODate } from "@/lib/format";
import { canChangeStatus, canEditPlanning, canViewPlanning } from "@/lib/planning/access";
import { allowedTransitions } from "@/lib/planning/status";
import { cn } from "@/lib/utils";

import { deletePlanning } from "../actions";
import { StatusActions } from "../status-actions";

export const metadata: Metadata = { title: "Detail Planning Job" };

export default async function PlanningDetailPage({
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
  const job = await db.planningJob.findUnique({
    where: { id },
    include: { unit: { select: { name: true } }, supervisor: { select: { name: true, kodePengawas: true } }, createdBy: { select: { name: true } } },
  });
  if (!job || !canViewPlanning(user, job)) notFound();
  const editable = canEditPlanning(user, job);
  const allowed = allowedTransitions(user.role, job.status).filter((s) => canChangeStatus(user, job, s));
  const mulai = dateToISO(job.estimasiMulai);
  const selesai = dateToISO(job.estimasiSelesai);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={job.namaPekerjaan}
        description={job.unit.name}
        backHref="/planning-job"
        action={
          editable ? (
            <Link href={`/planning-job/${id}/edit`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
              <Pencil aria-hidden /> Ubah
            </Link>
          ) : undefined
        }
      />
      {tersimpan ? <Alert tone="success">{tersimpan === "baru" ? "Planning berhasil dibuat." : "Perubahan disimpan."}</Alert> : null}

      <Card className="flex items-center justify-between gap-3 p-4">
        <span className="text-sm text-ink-muted">Status</span>
        <PlanningStatusBadge status={job.status} />
      </Card>

      <Card className="grid grid-cols-2 gap-px overflow-hidden bg-border p-0">
        <div className="flex flex-col gap-0.5 bg-surface p-4">
          <span className="text-sm text-ink-muted">Estimasi mulai</span>
          <span className="font-semibold tabular-nums">{formatISODate(mulai)}</span>
        </div>
        <div className="flex flex-col gap-0.5 bg-surface p-4">
          <span className="text-sm text-ink-muted">Estimasi selesai</span>
          <span className="font-semibold tabular-nums">{formatISODate(selesai)}</span>
        </div>
      </Card>

      <Card className="flex flex-col divide-y divide-border">
        <div className="flex items-center justify-between gap-4 p-4">
          <span className="text-sm text-ink-muted">Pengawas</span>
          <span className="flex items-center gap-2 font-medium">
            <Avatar name={job.supervisor.name} size="sm" /> {job.supervisor.name}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4 p-4">
          <span className="text-sm text-ink-muted">Lokasi</span>
          <span className="text-right font-medium">{job.lokasi}</span>
        </div>
        <div className="flex flex-col gap-1 p-4">
          <span className="text-sm text-ink-muted">Deskripsi</span>
          <p className="whitespace-pre-line">{job.deskripsi}</p>
        </div>
        {job.startedAt || job.completedAt ? (
          <div className="flex flex-col gap-1 p-4 text-sm tabular-nums">
            {job.startedAt ? <p>Mulai dikerjakan: {formatDateTime(job.startedAt)}</p> : null}
            {job.completedAt ? <p>Selesai: {formatDateTime(job.completedAt)}</p> : null}
          </div>
        ) : null}
      </Card>

      <StatusActions id={id} allowed={allowed} role={user.role} />

      <p className="text-center text-xs tabular-nums text-ink-muted">
        Dibuat oleh {job.createdBy.name} · {formatDateTime(job.createdAt)}
      </p>

      {editable ? <DeleteRecord id={id} action={deletePlanning} redirectTo="/planning-job?dihapus=1" noun="planning" /> : null}
    </div>
  );
}

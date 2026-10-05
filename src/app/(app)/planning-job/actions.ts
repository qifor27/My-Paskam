"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { parseForm, runAction } from "@/lib/action";
import { audit } from "@/lib/audit";
import { getCurrentUser, requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { canChangeStatus, canEditPlanning } from "@/lib/planning/access";
import { planningSchema } from "@/lib/planning/schema";
import { PLANNING_STATUSES, PLANNING_STATUS_META, timestampsFor } from "@/lib/planning/status";

function revalidate(id?: string) {
  revalidatePath("/planning-job");
  if (id) revalidatePath(`/planning-job/${id}`);
  revalidatePath("/");
}

/** Owner membuat/mengubah planning (ADR-017). Idempoten lewat id dari client. */
export async function savePlanning(formData: FormData) {
  return runAction("planning.save", async () => {
    const owner = await requirePermission("planning-job:create");
    const data = parseForm(planningSchema, formData);

    const existing = await db.planningJob.findUnique({ where: { id: data.id } });
    if (existing && !canEditPlanning(owner, existing)) {
      throw new AppError("VALIDATION", { userMessage: "Planning ini sudah dihapus dan tidak bisa diubah." });
    }

    const pengawas = await db.user.findUnique({ where: { id: data.supervisorId } });
    if (!pengawas || pengawas.role !== "PENGAWAS" || (!pengawas.isActive && existing?.supervisorId !== pengawas.id)) {
      throw new AppError("VALIDATION", { fieldErrors: { supervisorId: "Pengawas tidak tersedia, pilih yang lain" } });
    }
    const unit = await db.unit.findUnique({ where: { id: data.unitId } });
    if (!unit || (!unit.isActive && existing?.unitId !== unit.id)) {
      throw new AppError("VALIDATION", { fieldErrors: { unitId: "Unit tidak tersedia, pilih unit lain" } });
    }

    const values = {
      supervisorId: data.supervisorId,
      unitId: data.unitId,
      namaPekerjaan: data.namaPekerjaan,
      lokasi: data.lokasi,
      deskripsi: data.deskripsi,
      estimasiMulai: new Date(`${data.estimasiMulai}T00:00:00Z`),
      estimasiSelesai: new Date(`${data.estimasiSelesai}T00:00:00Z`),
    };
    if (existing) {
      await db.planningJob.update({ where: { id: data.id }, data: { ...values, updatedById: owner.id } });
    } else {
      await db.planningJob.create({ data: { id: data.id, ...values, createdById: owner.id } });
    }

    await audit({
      action: existing ? "PLANNING_UPDATED" : "PLANNING_CREATED",
      result: "SUCCESS",
      userId: owner.id,
      detail: { planningId: data.id, pengawas: pengawas.name, unit: unit.name, mulai: data.estimasiMulai, selesai: data.estimasiSelesai },
    });
    revalidate(data.id);
    return { id: data.id, created: !existing };
  });
}

const statusInput = z.object({ id: z.uuid(), status: z.enum(PLANNING_STATUSES) });

/** Ubah status: Pengawas yang ditugaskan (maju satu langkah) atau Owner (bebas). */
export async function setPlanningStatus(formData: FormData) {
  return runAction("planning.status", async () => {
    const user = await getCurrentUser();
    if (!user) throw new AppError("SESSION_EXPIRED");
    const { id, status } = parseForm(statusInput, formData);
    const job = await db.planningJob.findUnique({ where: { id } });
    if (!job || job.deletedAt) throw new AppError("VALIDATION", { userMessage: "Planning tidak ditemukan." });

    // Idempoten: menekan tombol yang sama dua kali (mis. retry) tidak dianggap error.
    if (job.status === status) return { id, status };
    if (!canChangeStatus(user, job, status)) {
      throw new AppError("AUTHORIZATION", {
        userMessage: `Status tidak bisa diubah dari ${PLANNING_STATUS_META[job.status].label} ke ${PLANNING_STATUS_META[status].label}.`,
      });
    }

    await db.planningJob.update({
      where: { id },
      data: { status, ...timestampsFor(status, job), updatedById: user.id },
    });
    await audit({
      action: "PLANNING_STATUS_CHANGED",
      result: "SUCCESS",
      userId: user.id,
      detail: { planningId: id, from: job.status, to: status },
    });
    revalidate(id);
    return { id, status };
  });
}

export async function deletePlanning(formData: FormData) {
  return runAction("planning.delete", async () => {
    const owner = await requirePermission("planning-job:create");
    const { id } = parseForm(z.object({ id: z.uuid() }), formData);
    const job = await db.planningJob.findUnique({ where: { id } });
    if (!job || job.deletedAt) return { id };
    await db.planningJob.update({ where: { id }, data: { deletedAt: new Date(), updatedById: owner.id } });
    await audit({ action: "PLANNING_DELETED", result: "SUCCESS", userId: owner.id, detail: { planningId: id } });
    revalidate();
    return { id };
  });
}

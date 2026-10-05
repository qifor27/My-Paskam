"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { parseForm, runAction } from "@/lib/action";
import { audit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { assertPhotosUploaded, removeDetachedPhotos } from "@/lib/photo/service";
import { canEditSparePart } from "@/lib/spare-part/access";
import { sparePartSchema } from "@/lib/spare-part/schema";

/** Simpan catatan spare part rusak (buat/ubah). Idempoten lewat id dari client (ADR-004). */
export async function saveSparePart(formData: FormData) {
  return runAction("sparePart.save", async () => {
    const user = await requirePermission("spare-part:create");
    const data = parseForm(sparePartSchema, formData);

    const existing = await db.orderSparePart.findUnique({ where: { id: data.id } });
    if (existing?.deletedAt) {
      throw new AppError("VALIDATION", { userMessage: "Catatan ini sudah dihapus dan tidak bisa diubah." });
    }
    if (existing && !canEditSparePart(user, existing)) throw new AppError("AUTHORIZATION");

    const unit = await db.unit.findUnique({ where: { id: data.unitId } });
    if (!unit || (!unit.isActive && existing?.unitId !== unit.id)) {
      throw new AppError("VALIDATION", { fieldErrors: { unitId: "Unit tidak tersedia, pilih unit lain" } });
    }
    await assertPhotosUploaded("ORDER_SPARE_PART", user.id, data.id, data.photoIds);

    const values = { unitId: data.unitId, partName: data.partName, kerusakan: data.kerusakan, lokasi: data.lokasi };
    await db.$transaction([
      existing
        ? db.orderSparePart.update({ where: { id: data.id }, data: { ...values, updatedById: user.id } })
        : db.orderSparePart.create({
            // Pengawas tercatat otomatis dari akun yang login (ADR-016).
            data: { id: data.id, ...values, supervisorId: user.id, createdById: user.id },
          }),
      ...data.photoIds.map((id, index) => db.photo.update({ where: { id }, data: { sortOrder: index } })),
    ]);
    const removed = await removeDetachedPhotos("ORDER_SPARE_PART", user.id, data.id, data.photoIds);

    await audit({
      action: existing ? "SPARE_PART_UPDATED" : "SPARE_PART_CREATED",
      result: "SUCCESS",
      userId: user.id,
      detail: { sparePartId: data.id, unit: unit.name, partName: data.partName, photos: data.photoIds.length, removedPhotos: removed },
    });
    revalidatePath("/spare-part");
    revalidatePath("/");
    return { id: data.id, created: !existing };
  });
}

export async function deleteSparePart(formData: FormData) {
  return runAction("sparePart.delete", async () => {
    const user = await requirePermission("spare-part:create");
    const { id } = parseForm(z.object({ id: z.uuid() }), formData);
    const record = await db.orderSparePart.findUnique({ where: { id } });
    if (!record || record.deletedAt) return { id };
    if (!canEditSparePart(user, record)) throw new AppError("AUTHORIZATION");

    await db.orderSparePart.update({ where: { id }, data: { deletedAt: new Date(), updatedById: user.id } });
    await audit({ action: "SPARE_PART_DELETED", result: "SUCCESS", userId: user.id, detail: { sparePartId: id } });
    revalidatePath("/spare-part");
    revalidatePath("/");
    return { id };
  });
}

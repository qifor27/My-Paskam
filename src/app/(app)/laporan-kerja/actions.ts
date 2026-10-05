"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { parseForm, runAction } from "@/lib/action";
import { audit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { todayISO } from "@/lib/format";
import { canEditLaporan } from "@/lib/laporan-kerja/access";
import { laporanSchema } from "@/lib/laporan-kerja/schema";
import { removeDetachedPhotos } from "@/lib/photo/service";

/**
 * Simpan laporan (buat atau ubah). Idempoten (ADR-004): id dibuat di client,
 * sehingga "Coba lagi" setelah koneksi putus tidak membuat laporan ganda.
 */
export async function saveLaporan(formData: FormData) {
  return runAction("laporan.save", async () => {
    const user = await requirePermission("laporan-kerja:create");
    const data = parseForm(laporanSchema(todayISO()), formData);

    const existing = await db.laporanKerja.findUnique({ where: { id: data.id } });
    if (existing?.deletedAt) {
      throw new AppError("VALIDATION", { userMessage: "Laporan ini sudah dihapus dan tidak bisa diubah." });
    }
    if (existing && !canEditLaporan(user, existing)) throw new AppError("AUTHORIZATION");

    const unit = await db.unit.findUnique({ where: { id: data.unitId } });
    if (!unit || (!unit.isActive && existing?.unitId !== unit.id)) {
      throw new AppError("VALIDATION", { fieldErrors: { unitId: "Unit tidak tersedia, pilih unit lain" } });
    }

    const photos = await db.photo.findMany({
      where: { id: { in: data.photoIds }, module: "LAPORAN_KERJA", recordId: data.id, uploadedById: user.id, deletedAt: null },
      select: { id: true },
    });
    if (photos.length !== data.photoIds.length) {
      throw new AppError("VALIDATION", {
        fieldErrors: { photoIds: "Sebagian foto belum terunggah. Tunggu sampai selesai atau ketuk Coba lagi." },
      });
    }

    const values = {
      tanggal: new Date(`${data.tanggal}T00:00:00Z`),
      unitId: data.unitId,
      operatorName: data.operatorName,
      hmJam: data.hmJam,
      bbm: data.bbm,
      lokasi: data.lokasi,
      deskripsi: data.deskripsi,
    };

    await db.$transaction([
      existing
        ? db.laporanKerja.update({ where: { id: data.id }, data: { ...values, updatedById: user.id } })
        : db.laporanKerja.create({
            // Pengawas tercatat otomatis dari akun yang login (ADR-014).
            data: { id: data.id, ...values, supervisorId: user.id, createdById: user.id },
          }),
      ...data.photoIds.map((id, index) => db.photo.update({ where: { id }, data: { sortOrder: index } })),
    ]);
    const removed = await removeDetachedPhotos(user.id, data.id, data.photoIds);

    await audit({
      action: existing ? "LAPORAN_UPDATED" : "LAPORAN_CREATED",
      result: "SUCCESS",
      userId: user.id,
      detail: { laporanId: data.id, unit: unit.name, tanggal: data.tanggal, photos: data.photoIds.length, removedPhotos: removed },
    });
    revalidatePath("/laporan-kerja");
    revalidatePath("/");
    return { id: data.id, created: !existing };
  });
}

export async function deleteLaporan(formData: FormData) {
  return runAction("laporan.delete", async () => {
    const user = await requirePermission("laporan-kerja:create");
    const { id } = parseForm(z.object({ id: z.uuid() }), formData);
    const laporan = await db.laporanKerja.findUnique({ where: { id } });
    if (!laporan || laporan.deletedAt) return { id };
    if (!canEditLaporan(user, laporan)) throw new AppError("AUTHORIZATION");

    // Soft delete (ADR-014): data tetap ada untuk audit, foto ikut tidak bisa diakses.
    await db.laporanKerja.update({ where: { id }, data: { deletedAt: new Date(), updatedById: user.id } });
    await audit({ action: "LAPORAN_DELETED", result: "SUCCESS", userId: user.id, detail: { laporanId: id } });
    revalidatePath("/laporan-kerja");
    revalidatePath("/");
    return { id };
  });
}

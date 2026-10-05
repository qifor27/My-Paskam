import "server-only";

import { createHash } from "node:crypto";

import type { CurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { canViewLaporan } from "@/lib/laporan-kerja/access";
import { storage } from "@/lib/storage";

import { detectImageKind, MIME, PHOTO_RULES } from "./rules";

const MODULE_DIR = { LAPORAN_KERJA: "laporan-kerja", ORDER_SPARE_PART: "order-spare-part", PLANNING_JOB: "planning-job" } as const;

/**
 * Simpan foto yang diunggah sebelum laporan disimpan (record_id = id laporan
 * yang dibuat di client). Idempoten: unggah ulang id yang sama tidak menduplikasi.
 */
export async function savePhotoUpload(
  user: CurrentUser,
  input: { id: string; recordId: string; width: number; height: number; file: File },
) {
  const existing = await db.photo.findUnique({ where: { id: input.id } });
  if (existing) {
    if (existing.uploadedById === user.id && existing.recordId === input.recordId && !existing.deletedAt) {
      return { id: existing.id, duplicate: true };
    }
    throw new AppError("VALIDATION", { detail: "photo id collision" });
  }

  // Foto tidak boleh ditempel ke laporan milik orang lain.
  const laporan = await db.laporanKerja.findUnique({ where: { id: input.recordId } });
  if (laporan && (laporan.createdById !== user.id || laporan.deletedAt)) {
    throw new AppError("AUTHORIZATION", { detail: "photo for foreign laporan" });
  }

  const count = await db.photo.count({
    where: { module: "LAPORAN_KERJA", recordId: input.recordId, uploadedById: user.id, deletedAt: null },
  });
  // Batas longgar (2× maks.) karena foto yang dilepas saat edit baru dihapus ketika laporan disimpan.
  if (count >= PHOTO_RULES.maxPerRecord * 2) {
    throw new AppError("VALIDATION", { userMessage: `Maksimal ${PHOTO_RULES.maxPerRecord} foto per laporan.` });
  }

  if (input.file.size > PHOTO_RULES.maxBytes) {
    throw new AppError("UPLOAD", { userMessage: "Ukuran foto terlalu besar. Ambil ulang foto lalu coba lagi." });
  }
  const bytes = Buffer.from(await input.file.arrayBuffer());
  const kind = detectImageKind(bytes);
  if (!kind) throw new AppError("UPLOAD", { userMessage: "File bukan foto JPEG/WebP yang valid." });

  const key = `photos/${MODULE_DIR.LAPORAN_KERJA}/${input.recordId}/${input.id}.${kind}`;
  await storage().put(key, bytes, MIME[kind]);
  await db.photo.create({
    data: {
      id: input.id,
      module: "LAPORAN_KERJA",
      recordId: input.recordId,
      storagePath: key,
      mimeType: MIME[kind],
      sizeBytes: bytes.length,
      width: input.width,
      height: input.height,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      uploadedById: user.id,
    },
  });
  return { id: input.id, duplicate: false };
}

/** Foto milik laporan: hanya yang diunggah pembuat laporan dan belum dihapus. */
export function laporanPhotos(laporan: { id: string; createdById: string }) {
  return db.photo.findMany({
    where: { module: "LAPORAN_KERJA", recordId: laporan.id, uploadedById: laporan.createdById, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { uploadedAt: "asc" }],
    select: { id: true, width: true, height: true },
  });
}

/** Cek apakah user boleh melihat sebuah foto; kembalikan metadata atau null. */
export async function findViewablePhoto(user: CurrentUser, id: string) {
  const photo = await db.photo.findUnique({ where: { id } });
  if (!photo || photo.deletedAt || !photo.recordId) return null;
  const laporan = await db.laporanKerja.findUnique({ where: { id: photo.recordId } });
  if (laporan) {
    return photo.uploadedById === laporan.createdById && canViewLaporan(user, laporan) ? photo : null;
  }
  // Laporan belum disimpan: hanya pengunggah yang boleh melihat (preview saat mengisi form).
  return photo.uploadedById === user.id ? photo : null;
}

/** Hapus foto yang dilepas dari laporan saat disimpan. */
export async function removeDetachedPhotos(userId: string, recordId: string, keepIds: string[]) {
  const detached = await db.photo.findMany({
    where: { module: "LAPORAN_KERJA", recordId, uploadedById: userId, deletedAt: null, id: { notIn: keepIds } },
  });
  for (const p of detached) {
    await db.photo.update({ where: { id: p.id }, data: { deletedAt: new Date(), retentionStatus: "DELETED" } });
    await storage().delete(p.storagePath).catch(() => {});
  }
  return detached.length;
}

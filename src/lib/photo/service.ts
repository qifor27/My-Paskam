import "server-only";

import { createHash } from "node:crypto";

import type { PhotoModule } from "@/generated/prisma/enums";
import type { CurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { storage } from "@/lib/storage";

import { canViewRecord, photoModule } from "./modules";
import { detectImageKind, MIME, PHOTO_RULES } from "./rules";

/**
 * Simpan foto yang diunggah sebelum record disimpan (record_id = id record yang
 * dibuat di client). Idempoten: unggah ulang id yang sama tidak menduplikasi.
 */
export async function savePhotoUpload(
  user: CurrentUser,
  input: { id: string; module: PhotoModule; recordId: string; width: number; height: number; file: File },
) {
  const config = photoModule(input.module);
  const existing = await db.photo.findUnique({ where: { id: input.id } });
  if (existing) {
    if (existing.uploadedById === user.id && existing.recordId === input.recordId && existing.module === input.module && !existing.deletedAt) {
      return { id: existing.id, duplicate: true };
    }
    throw new AppError("VALIDATION", { detail: "photo id collision" });
  }

  // Foto tidak boleh ditempel ke record milik orang lain.
  const record = await config.findRecord(input.recordId);
  if (record && (record.createdById !== user.id || record.deletedAt)) {
    throw new AppError("AUTHORIZATION", { detail: "photo for foreign record" });
  }

  const count = await db.photo.count({
    where: { module: input.module, recordId: input.recordId, uploadedById: user.id, deletedAt: null },
  });
  // Batas longgar (2× maks.) karena foto yang dilepas saat edit baru dihapus ketika record disimpan.
  if (count >= PHOTO_RULES.maxPerRecord * 2) {
    throw new AppError("VALIDATION", { userMessage: `Maksimal ${PHOTO_RULES.maxPerRecord} foto per data.` });
  }

  if (input.file.size > PHOTO_RULES.maxBytes) {
    throw new AppError("UPLOAD", { userMessage: "Ukuran foto terlalu besar. Ambil ulang foto lalu coba lagi." });
  }
  const bytes = Buffer.from(await input.file.arrayBuffer());
  const kind = detectImageKind(bytes);
  if (!kind) throw new AppError("UPLOAD", { userMessage: "File bukan foto JPEG/WebP yang valid." });

  const key = `photos/${config.dir}/${input.recordId}/${input.id}.${kind}`;
  await storage().put(key, bytes, MIME[kind]);
  await db.photo.create({
    data: {
      id: input.id,
      module: input.module,
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

/** Foto milik record: hanya yang diunggah pembuat record dan belum dihapus. */
export function recordPhotos(module: PhotoModule, record: { id: string; createdById: string }) {
  return db.photo.findMany({
    where: { module, recordId: record.id, uploadedById: record.createdById, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { uploadedAt: "asc" }],
    select: { id: true, width: true, height: true },
  });
}

/** @deprecated pakai recordPhotos("LAPORAN_KERJA", …) */
export const laporanPhotos = (laporan: { id: string; createdById: string }) => recordPhotos("LAPORAN_KERJA", laporan);

/** Jumlah foto aktif per record, untuk daftar. */
export async function photoCounts(module: PhotoModule, recordIds: string[]) {
  const counts = await db.photo.groupBy({
    by: ["recordId"],
    where: { module, recordId: { in: recordIds }, deletedAt: null },
    _count: true,
  });
  return new Map(counts.map((c) => [c.recordId, c._count]));
}

/** Pastikan semua id foto sudah terunggah oleh user untuk record ini. */
export async function assertPhotosUploaded(module: PhotoModule, userId: string, recordId: string, photoIds: string[]) {
  const found = await db.photo.count({
    where: { id: { in: photoIds }, module, recordId, uploadedById: userId, deletedAt: null },
  });
  if (found !== photoIds.length) {
    throw new AppError("VALIDATION", {
      fieldErrors: { photoIds: "Sebagian foto belum terunggah. Tunggu sampai selesai atau ketuk Coba lagi." },
    });
  }
}

/** Cek apakah user boleh melihat sebuah foto; kembalikan metadata atau null. */
export async function findViewablePhoto(user: CurrentUser, id: string) {
  const photo = await db.photo.findUnique({ where: { id } });
  if (!photo || photo.deletedAt || !photo.recordId) return null;
  const config = photoModule(photo.module);
  const record = await config.findRecord(photo.recordId);
  if (record) {
    return photo.uploadedById === record.createdById && canViewRecord(user, photo.module, record) ? photo : null;
  }
  // Record belum disimpan: hanya pengunggah yang boleh melihat (preview saat mengisi form).
  return photo.uploadedById === user.id ? photo : null;
}

/** Hapus foto yang dilepas dari record saat disimpan. */
export async function removeDetachedPhotos(module: PhotoModule, userId: string, recordId: string, keepIds: string[]) {
  const detached = await db.photo.findMany({
    where: { module, recordId, uploadedById: userId, deletedAt: null, id: { notIn: keepIds } },
  });
  for (const p of detached) {
    await db.photo.update({ where: { id: p.id }, data: { deletedAt: new Date(), retentionStatus: "DELETED" } });
    await storage().delete(p.storagePath).catch(() => {});
  }
  return detached.length;
}

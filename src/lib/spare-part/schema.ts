import { z } from "zod";

import { PHOTO_RULES } from "@/lib/photo/rules";

// Order Spare Part = dokumentasi spare part yang rusak, tanpa status (ADR-016).
export const SPARE_PART_RULES = {
  partNameMax: 120,
  kerusakanMax: 2000,
  lokasiMax: 150,
} as const;

export const sparePartSchema = z.object({
  id: z.uuid(),
  unitId: z.uuid({ error: "Pilih unit" }),
  partName: z
    .string()
    .trim()
    .min(1, "Nama spare part wajib diisi")
    .max(SPARE_PART_RULES.partNameMax, `Maksimal ${SPARE_PART_RULES.partNameMax} karakter`),
  kerusakan: z
    .string()
    .trim()
    .min(1, "Deskripsi kerusakan wajib diisi")
    .max(SPARE_PART_RULES.kerusakanMax, `Maksimal ${SPARE_PART_RULES.kerusakanMax} karakter`),
  lokasi: z
    .string()
    .trim()
    .min(1, "Lokasi wajib diisi")
    .max(SPARE_PART_RULES.lokasiMax, `Maksimal ${SPARE_PART_RULES.lokasiMax} karakter`),
  photoIds: z
    .string()
    .transform((v) => v.split(",").filter(Boolean))
    .pipe(
      z
        .array(z.uuid())
        .min(PHOTO_RULES.minPerRecord, "Tambahkan minimal 1 foto")
        .max(PHOTO_RULES.maxPerRecord, `Maksimal ${PHOTO_RULES.maxPerRecord} foto`),
    ),
});

export type SparePartInput = z.output<typeof sparePartSchema>;

import { z } from "zod";

export const PLANNING_RULES = { namaMax: 150, lokasiMax: 150, deskripsiMax: 2000 } as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Planning Job (PRD §16, ADR-017). Tanpa foto.
export const planningSchema = z
  .object({
    id: z.uuid(),
    supervisorId: z.uuid({ error: "Pilih Pengawas" }),
    unitId: z.uuid({ error: "Pilih unit" }),
    namaPekerjaan: z
      .string()
      .trim()
      .min(1, "Nama pekerjaan wajib diisi")
      .max(PLANNING_RULES.namaMax, `Maksimal ${PLANNING_RULES.namaMax} karakter`),
    lokasi: z
      .string()
      .trim()
      .min(1, "Lokasi wajib diisi")
      .max(PLANNING_RULES.lokasiMax, `Maksimal ${PLANNING_RULES.lokasiMax} karakter`),
    deskripsi: z
      .string()
      .trim()
      .min(1, "Deskripsi wajib diisi")
      .max(PLANNING_RULES.deskripsiMax, `Maksimal ${PLANNING_RULES.deskripsiMax} karakter`),
    estimasiMulai: z.string().regex(ISO_DATE, "Estimasi mulai wajib diisi"),
    estimasiSelesai: z.string().regex(ISO_DATE, "Estimasi selesai wajib diisi"),
  })
  .refine((d) => d.estimasiSelesai >= d.estimasiMulai, {
    path: ["estimasiSelesai"],
    message: "Estimasi selesai tidak boleh sebelum estimasi mulai",
  });

export type PlanningInput = z.output<typeof planningSchema>;

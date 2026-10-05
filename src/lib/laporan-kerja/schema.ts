import { z } from "zod";

import { PHOTO_RULES } from "@/lib/photo/rules";

// Aturan ADR-014. Nilai SEMENTARA ditandai.
export const LAPORAN_RULES = {
  /** SEMENTARA: HM = total jam kerja per laporan. */
  hmMax: 24,
  bbmOptions: [1, 2, 3, 4, 5, 6] as const,
  operatorMax: 100,
  lokasiMax: 150,
  deskripsiMax: 2000,
} as const;

/** "7,5" / "7.5" / " 8 " → angka; null jika bukan angka desimal yang valid. */
export function parseDecimalInput(input: string): number | null {
  const normalized = input.trim().replace(",", ".");
  if (!/^\d{1,3}(\.\d+)?$/.test(normalized)) return null;
  return Number(normalized);
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function laporanSchema(today: string) {
  return z.object({
    id: z.uuid(),
    tanggal: z
      .string()
      .regex(ISO_DATE, "Tanggal wajib diisi")
      .refine((d) => d <= today, "Tanggal tidak boleh melewati hari ini"),
    unitId: z.uuid({ error: "Pilih unit" }),
    operatorName: z
      .string()
      .trim()
      .min(1, "Nama operator wajib diisi")
      .max(LAPORAN_RULES.operatorMax, `Maksimal ${LAPORAN_RULES.operatorMax} karakter`),
    hmJam: z
      .string()
      .trim()
      .min(1, "HM wajib diisi")
      .transform((v, ctx) => {
        const n = parseDecimalInput(v);
        if (n === null) {
          ctx.addIssue({ code: "custom", message: "HM berupa angka, contoh 7,5" });
          return z.NEVER;
        }
        return n;
      })
      .refine((n) => n <= LAPORAN_RULES.hmMax, `HM maksimal ${LAPORAN_RULES.hmMax} jam`)
      .refine((n) => Math.round(n * 10) / 10 === n, "HM maksimal 1 angka di belakang koma"),
    bbm: z.coerce
      .number({ error: "Pilih BBM 1–6" })
      .int("Pilih BBM 1–6")
      .min(1, "Pilih BBM 1–6")
      .max(6, "Pilih BBM 1–6"),
    lokasi: z
      .string()
      .trim()
      .min(1, "Lokasi wajib diisi")
      .max(LAPORAN_RULES.lokasiMax, `Maksimal ${LAPORAN_RULES.lokasiMax} karakter`),
    deskripsi: z
      .string()
      .trim()
      .min(1, "Deskripsi pekerjaan wajib diisi")
      .max(LAPORAN_RULES.deskripsiMax, `Maksimal ${LAPORAN_RULES.deskripsiMax} karakter`),
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
}

export type LaporanInput = z.output<ReturnType<typeof laporanSchema>>;

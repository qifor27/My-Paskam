import { z } from "zod";

import { PHOTO_RULES } from "@/lib/photo/rules";

// Aturan ADR-014. Nilai SEMENTARA ditandai.
export const LAPORAN_RULES = {
  /** HM = total jam kerja per laporan (ADR-014, dikonfirmasi). */
  hmMax: 24,
  /** BBM (Solar) = jumlah (ADR-016); batas atas = kapasitas kolom DECIMAL(6,1). */
  bbmMax: 99999.9,
  operatorMax: 100,
  lokasiMax: 150,
  deskripsiMax: 2000,
} as const;

/** "7,5" / "7.5" / " 8 " → angka; null jika bukan angka desimal yang valid. */
export function parseDecimalInput(input: string): number | null {
  const normalized = input.trim().replace(",", ".");
  if (!/^\d{1,5}(\.\d+)?$/.test(normalized)) return null;
  return Number(normalized);
}

/** Field angka desimal (koma/titik), >= 0, maks. 1 angka di belakang koma. */
export function decimalField(label: string, max: number, example: string, unit = "") {
  return z
    .string()
    .trim()
    .min(1, `${label} wajib diisi`)
    .transform((v, ctx) => {
      const n = parseDecimalInput(v);
      if (n === null) {
        ctx.addIssue({ code: "custom", message: `${label} berupa angka, contoh ${example}` });
        return z.NEVER;
      }
      return n;
    })
    .refine((n) => n <= max, `${label} maksimal ${String(max).replace(".", ",")}${unit ? ` ${unit}` : ""}`)
    .refine((n) => Math.round(n * 10) / 10 === n, `${label} maksimal 1 angka di belakang koma`);
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
    hmJam: decimalField("HM", LAPORAN_RULES.hmMax, "7,5", "jam"),
    bbm: decimalField("BBM", LAPORAN_RULES.bbmMax, "40"),
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

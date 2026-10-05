import { z } from "zod";

import { monthStartISO } from "@/lib/format";
import { PLANNING_STATUSES } from "@/lib/planning/status";
import { PRIORITIES } from "@/lib/spare-part/priority";

export const DATA_MODULES = ["kerja", "spare-part", "planning"] as const;
export type DataModule = (typeof DATA_MODULES)[number];

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const uuidOrAll = z.uuid().optional().catch(undefined);

/**
 * Filter Laporan Data dari query string (PRD §17). Nilai tidak valid diabaikan
 * (fallback ke default) agar URL rusak tidak membuat halaman error.
 */
export function parseFilters(params: Record<string, string | string[] | undefined>, today: string) {
  const one = (k: string) => (Array.isArray(params[k]) ? params[k][0] : params[k]) || undefined;
  const schema = z.object({
    modul: z.enum(DATA_MODULES).catch("kerja"),
    dari: z.string().regex(ISO).catch(monthStartISO(today)),
    sampai: z.string().regex(ISO).catch(today),
    unit: uuidOrAll,
    pengawas: uuidOrAll,
    status: z.enum(PLANNING_STATUSES).optional().catch(undefined),
    prioritas: z.enum(PRIORITIES).optional().catch(undefined),
    hal: z.coerce.number().int().min(1).max(50).catch(1),
  });
  const f = schema.parse({
    modul: one("modul") ?? "kerja",
    dari: one("dari") ?? monthStartISO(today),
    sampai: one("sampai") ?? today,
    unit: one("unit"),
    pengawas: one("pengawas"),
    status: one("status"),
    prioritas: one("prioritas"),
    hal: one("hal") ?? 1,
  });
  // Rentang terbalik → tukar, bukan error.
  if (f.dari > f.sampai) [f.dari, f.sampai] = [f.sampai, f.dari];
  return f;
}

export type DataFilters = ReturnType<typeof parseFilters>;

/** Query string untuk link (tab modul, halaman berikutnya) yang mempertahankan filter. */
export function filtersToQuery(f: DataFilters, patch: Partial<Record<keyof DataFilters, string | number | undefined>> = {}) {
  const merged: Record<string, string | number | undefined> = { ...f, ...patch };
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "" && !(k === "hal" && v === 1)) q.set(k, String(v));
  return q.toString();
}

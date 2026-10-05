import "server-only";

import { can } from "@/lib/auth/permissions";
import type { CurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { dateToISO } from "@/lib/format";
import { photoCounts } from "@/lib/photo/service";

export const PAGE_SIZE = 20;

export type LaporanRow = {
  id: string;
  tanggal: string;
  unitName: string;
  operatorName: string;
  hmJam: number;
  bbm: number;
  lokasi: string;
  supervisorName: string;
  photoCount: number;
};

/** Daftar laporan sesuai visibilitas ADR-014, terbaru dulu. */
export async function listLaporan(user: CurrentUser, limit: number) {
  const rows = await db.laporanKerja.findMany({
    where: { deletedAt: null, ...(can(user.role, "laporan-kerja:view-all") ? {} : { supervisorId: user.id }) },
    orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
    take: limit + 1,
    include: { unit: { select: { name: true } }, supervisor: { select: { name: true } } },
  });
  const page = rows.slice(0, limit);
  const countBy = await photoCounts("LAPORAN_KERJA", page.map((r) => r.id));

  const items: LaporanRow[] = page.map((r) => ({
    id: r.id,
    tanggal: dateToISO(r.tanggal),
    unitName: r.unit.name,
    operatorName: r.operatorName,
    hmJam: Number(r.hmJam),
    bbm: Number(r.bbm),
    lokasi: r.lokasi,
    supervisorName: r.supervisor.name,
    photoCount: countBy.get(r.id) ?? 0,
  }));
  return { items, hasMore: rows.length > limit };
}

/** Unit untuk dipilih di form. Unit nonaktif hanya muncul jika sedang dipakai laporan yang diedit. */
export function selectableUnits(currentUnitId?: string) {
  return db.unit.findMany({
    where: currentUnitId ? { OR: [{ isActive: true }, { id: currentUnitId }] } : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
}

/** Saran isian dari laporan sebelumnya milik Pengawas ini (mengurangi ketik, PRD §9). */
export async function fieldSuggestions(supervisorId: string) {
  const recent = await db.laporanKerja.findMany({
    where: { supervisorId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { operatorName: true, lokasi: true },
  });
  const unique = (values: string[]) => [...new Set(values)].slice(0, 10);
  return {
    operators: unique(recent.map((r) => r.operatorName)),
    lokasi: unique(recent.map((r) => r.lokasi)),
  };
}

import "server-only";

import { can } from "@/lib/auth/permissions";
import type { CurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { dateToISO } from "@/lib/format";

import { TAB_STATUSES, type PlanningStatus, type PlanningTab } from "./status";

export type PlanningRow = {
  id: string;
  namaPekerjaan: string;
  unitName: string;
  lokasi: string;
  supervisorName: string;
  estimasiMulai: string;
  estimasiSelesai: string;
  status: PlanningStatus;
};

function scope(user: CurrentUser) {
  return can(user.role, "planning-job:view-all") ? {} : { supervisorId: user.id };
}

export async function listPlanning(user: CurrentUser, tab: PlanningTab, limit = 100) {
  const rows = await db.planningJob.findMany({
    where: { deletedAt: null, status: { in: [...TAB_STATUSES[tab]] }, ...scope(user) },
    // Aktif: yang paling dekat mulai di atas. Selesai/batal: terbaru di atas.
    orderBy: tab === "aktif" ? [{ estimasiMulai: "asc" }, { createdAt: "asc" }] : [{ updatedAt: "desc" }],
    take: limit,
    include: { unit: { select: { name: true } }, supervisor: { select: { name: true } } },
  });
  return rows.map(
    (r): PlanningRow => ({
      id: r.id,
      namaPekerjaan: r.namaPekerjaan,
      unitName: r.unit.name,
      lokasi: r.lokasi,
      supervisorName: r.supervisor.name,
      estimasiMulai: dateToISO(r.estimasiMulai),
      estimasiSelesai: dateToISO(r.estimasiSelesai),
      status: r.status,
    }),
  );
}

export async function countByTab(user: CurrentUser) {
  const groups = await db.planningJob.groupBy({ by: ["status"], where: { deletedAt: null, ...scope(user) }, _count: true });
  const n = (s: PlanningStatus[]) => groups.filter((g) => s.includes(g.status)).reduce((a, g) => a + g._count, 0);
  return { aktif: n([...TAB_STATUSES.aktif]), selesai: n([...TAB_STATUSES.selesai]), dibatalkan: n([...TAB_STATUSES.dibatalkan]) };
}

export function activePengawas() {
  return db.user.findMany({
    where: { role: "PENGAWAS", isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, kodePengawas: true },
  });
}

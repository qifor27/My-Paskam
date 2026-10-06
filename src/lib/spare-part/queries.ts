import "server-only";

import { can } from "@/lib/auth/permissions";
import type { CurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { recorderName } from "@/lib/people";
import { todayISO } from "@/lib/format";
import { photoCounts } from "@/lib/photo/service";

import type { Priority } from "./priority";

export const PAGE_SIZE = 20;

export type SparePartRow = {
  id: string;
  /** Tanggal dicatat (zona aplikasi), untuk pengelompokan. */
  tanggal: string;
  createdAt: Date;
  unitName: string;
  partName: string;
  quantity: number;
  priority: Priority;
  lokasi: string;
  supervisorName: string;
  photoCount: number;
};

export async function listSpareParts(user: CurrentUser, limit: number) {
  const rows = await db.orderSparePart.findMany({
    where: { deletedAt: null, ...(can(user.role, "spare-part:view-all") ? {} : { supervisorId: user.id }) },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    include: { unit: { select: { name: true } }, supervisor: { select: { name: true, role: true } } },
  });
  const page = rows.slice(0, limit);
  const countBy = await photoCounts("ORDER_SPARE_PART", page.map((r) => r.id));
  const items: SparePartRow[] = page.map((r) => ({
    id: r.id,
    tanggal: todayISO(r.createdAt),
    createdAt: r.createdAt,
    unitName: r.unit.name,
    partName: r.partName,
    quantity: r.quantity,
    priority: r.priority,
    lokasi: r.lokasi,
    supervisorName: recorderName(r.supervisor),
    photoCount: countBy.get(r.id) ?? 0,
  }));
  return { items, hasMore: rows.length > limit };
}

/** Saran isian dari catatan sebelumnya milik Pengawas ini. */
export async function sparePartSuggestions(supervisorId: string) {
  const recent = await db.orderSparePart.findMany({
    where: { supervisorId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { partName: true, lokasi: true },
  });
  const unique = (values: string[]) => [...new Set(values)].slice(0, 10);
  return { partNames: unique(recent.map((r) => r.partName)), lokasi: unique(recent.map((r) => r.lokasi)) };
}

import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { recorderName } from "@/lib/people";
import { dateToISO, shiftISO, todayISO, zonedDayStart } from "@/lib/format";
import { photoCounts } from "@/lib/photo/service";
import type { PlanningStatus } from "@/lib/planning/status";
import type { Priority } from "@/lib/spare-part/priority";

import type { DataFilters } from "./filters";

export const DATA_PAGE_SIZE = 50;
/** Batas baris per export PDF (menjaga ukuran file & waktu proses). */
export const EXPORT_MAX_ROWS = 2000;
const asDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

// --- Laporan Kerja: filter tanggal laporan, unit, Pengawas.
export async function reportLaporanKerja(f: DataFilters, opts: { limit?: number } = {}) {
  const where: Prisma.LaporanKerjaWhereInput = {
    deletedAt: null,
    tanggal: { gte: asDate(f.dari), lte: asDate(f.sampai) },
    ...(f.unit ? { unitId: f.unit } : {}),
    ...(f.pengawas ? { supervisorId: f.pengawas } : {}),
  };
  const limit = opts.limit ?? f.hal * DATA_PAGE_SIZE;
  const [rows, agg, perUnit] = await Promise.all([
    db.laporanKerja.findMany({
      where,
      orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
      take: limit + 1,
      include: { unit: { select: { name: true } }, supervisor: { select: { name: true, role: true } } },
    }),
    db.laporanKerja.aggregate({ where, _count: true, _sum: { hmJam: true, bbm: true } }),
    db.laporanKerja.groupBy({ by: ["unitId"], where, _count: true, _sum: { hmJam: true, bbm: true } }),
  ]);
  const page = rows.slice(0, limit);
  const photos = await photoCounts("LAPORAN_KERJA", page.map((r) => r.id));
  const unitNames = await unitNameMap(perUnit.map((u) => u.unitId));
  return {
    summary: { count: agg._count, hm: Number(agg._sum.hmJam ?? 0), bbm: Number(agg._sum.bbm ?? 0) },
    perUnit: perUnit
      .map((u) => ({ unit: unitNames.get(u.unitId) ?? "-", count: u._count, hm: Number(u._sum.hmJam ?? 0), bbm: Number(u._sum.bbm ?? 0) }))
      .sort((a, b) => b.hm - a.hm),
    rows: page.map((r) => ({
      id: r.id,
      tanggal: dateToISO(r.tanggal),
      unit: r.unit.name,
      pengawas: recorderName(r.supervisor),
      operator: r.operatorName,
      hm: Number(r.hmJam),
      bbm: Number(r.bbm),
      lokasi: r.lokasi,
      photos: photos.get(r.id) ?? 0,
    })),
    hasMore: rows.length > limit,
  };
}

// --- Spare part: filter waktu dicatat (zona aplikasi), unit, Pengawas, prioritas.
export async function reportSparePart(f: DataFilters, opts: { limit?: number } = {}) {
  const where: Prisma.OrderSparePartWhereInput = {
    deletedAt: null,
    createdAt: { gte: zonedDayStart(f.dari), lt: zonedDayStart(shiftISO(f.sampai, 1)) },
    ...(f.unit ? { unitId: f.unit } : {}),
    ...(f.pengawas ? { supervisorId: f.pengawas } : {}),
    ...(f.prioritas ? { priority: f.prioritas } : {}),
  };
  const limit = opts.limit ?? f.hal * DATA_PAGE_SIZE;
  const [rows, agg, perPriority] = await Promise.all([
    db.orderSparePart.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      include: { unit: { select: { name: true } }, supervisor: { select: { name: true, role: true } } },
    }),
    db.orderSparePart.aggregate({ where, _count: true, _sum: { quantity: true } }),
    db.orderSparePart.groupBy({ by: ["priority"], where, _count: true }),
  ]);
  const page = rows.slice(0, limit);
  const photos = await photoCounts("ORDER_SPARE_PART", page.map((r) => r.id));
  return {
    summary: {
      count: agg._count,
      quantity: agg._sum.quantity ?? 0,
      byPriority: Object.fromEntries(perPriority.map((p) => [p.priority, p._count])) as Partial<Record<Priority, number>>,
    },
    rows: page.map((r) => ({
      id: r.id,
      tanggal: todayISO(r.createdAt),
      createdAt: r.createdAt,
      unit: r.unit.name,
      pengawas: recorderName(r.supervisor),
      partName: r.partName,
      partNumber: r.partNumber,
      quantity: r.quantity,
      priority: r.priority,
      lokasi: r.lokasi,
      photos: photos.get(r.id) ?? 0,
    })),
    hasMore: rows.length > limit,
  };
}

// --- Planning: filter estimasi mulai, unit, Pengawas, status.
export async function reportPlanning(f: DataFilters, opts: { limit?: number } = {}) {
  const where: Prisma.PlanningJobWhereInput = {
    deletedAt: null,
    estimasiMulai: { gte: asDate(f.dari), lte: asDate(f.sampai) },
    ...(f.unit ? { unitId: f.unit } : {}),
    ...(f.pengawas ? { supervisorId: f.pengawas } : {}),
    ...(f.status ? { status: f.status } : {}),
  };
  const limit = opts.limit ?? f.hal * DATA_PAGE_SIZE;
  const [rows, perStatus] = await Promise.all([
    db.planningJob.findMany({
      where,
      orderBy: [{ estimasiMulai: "desc" }, { createdAt: "desc" }],
      take: limit + 1,
      include: { unit: { select: { name: true } }, supervisor: { select: { name: true, role: true } } },
    }),
    db.planningJob.groupBy({ by: ["status"], where, _count: true }),
  ]);
  const page = rows.slice(0, limit);
  const byStatus = Object.fromEntries(perStatus.map((p) => [p.status, p._count])) as Partial<Record<PlanningStatus, number>>;
  return {
    summary: { count: perStatus.reduce((a, p) => a + p._count, 0), byStatus },
    rows: page.map((r) => ({
      id: r.id,
      nama: r.namaPekerjaan,
      unit: r.unit.name,
      pengawas: recorderName(r.supervisor),
      mulai: dateToISO(r.estimasiMulai),
      selesai: dateToISO(r.estimasiSelesai),
      status: r.status,
      lokasi: r.lokasi,
    })),
    hasMore: rows.length > limit,
  };
}

async function unitNameMap(ids: string[]) {
  const units = await db.unit.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
  return new Map(units.map((u) => [u.id, u.name]));
}

/** Pilihan filter: semua unit & Pengawas (termasuk nonaktif, karena data lama tetap ada). */
export async function filterOptions() {
  const [units, pengawas] = await Promise.all([
    db.unit.findMany({ orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }], select: { id: true, name: true, isActive: true } }),
    // Owner ikut di filter karena bisa mencatat laporan & spare part (ADR-021).
    db.user.findMany({ orderBy: [{ role: "desc" }, { isActive: "desc" }, { name: "asc" }], select: { id: true, name: true, role: true, isActive: true } }),
  ]);
  return { units, pengawas: pengawas.map((p) => ({ ...p, name: recorderName(p) })) };
}

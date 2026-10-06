import "server-only";

import type { CurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatDateTime, formatDecimal, formatISODate, formatTime } from "@/lib/format";
import { renderReportPdf, type ReportSection } from "@/lib/pdf/report";
import { PLANNING_STATUSES, PLANNING_STATUS_META } from "@/lib/planning/status";
import { PRIORITIES, PRIORITY_META } from "@/lib/spare-part/priority";

import type { DataFilters } from "./filters";
import { EXPORT_MAX_ROWS, reportLaporanKerja, reportPlanning, reportSparePart } from "./queries";

const TITLES = { kerja: "Laporan Kerja", "spare-part": "Order Spare Part", planning: "Planning Job" } as const;
const DATE_LABEL = { kerja: "Tanggal laporan", "spare-part": "Tanggal dicatat", planning: "Estimasi mulai" } as const;

async function filterLabels(f: DataFilters) {
  const [unit, pengawas] = await Promise.all([
    f.unit ? db.unit.findUnique({ where: { id: f.unit }, select: { name: true } }) : null,
    f.pengawas ? db.user.findUnique({ where: { id: f.pengawas }, select: { name: true } }) : null,
  ]);
  return [
    unit ? `Unit ${unit.name}` : "Semua unit",
    pengawas ? `Pengawas ${pengawas.name}` : "Semua Pengawas",
    ...(f.modul === "planning" && f.status ? [`Status ${PLANNING_STATUS_META[f.status].label}`] : []),
    ...(f.modul === "spare-part" && f.prioritas ? [`Prioritas ${PRIORITY_META[f.prioritas].label}`] : []),
  ];
}

const truncatedNote = (shown: number, more: boolean) =>
  more ? `Menampilkan ${shown.toLocaleString("id-ID")} data pertama. Persempit filter untuk data lengkap.` : undefined;

/** Bangun PDF untuk filter Laporan Data saat ini. */
export async function buildLaporanDataPdf(user: CurrentUser, f: DataFilters) {
  let sections: ReportSection[];
  let count: number;

  if (f.modul === "kerja") {
    const r = await reportLaporanKerja(f, { limit: EXPORT_MAX_ROWS });
    count = r.summary.count;
    sections = [
      {
        kind: "summary",
        items: [
          { label: "Jumlah laporan", value: r.summary.count.toLocaleString("id-ID") },
          { label: "Total HM (jam)", value: formatDecimal(r.summary.hm) },
          { label: "Total BBM (Solar)", value: formatDecimal(r.summary.bbm) },
        ],
      },
      {
        kind: "table",
        title: "Ringkasan per unit",
        columns: [
          { header: "Unit", width: 3 },
          { header: "Laporan", width: 1.5, align: "right" },
          { header: "Total HM (jam)", width: 2, align: "right" },
          { header: "Total BBM", width: 2, align: "right" },
        ],
        rows: r.perUnit.map((u) => [u.unit, String(u.count), formatDecimal(u.hm), formatDecimal(u.bbm)]),
      },
      {
        kind: "table",
        title: "Detail laporan",
        note: truncatedNote(r.rows.length, r.hasMore),
        columns: [
          { header: "Tanggal", width: 1.6 },
          { header: "Unit", width: 1.4 },
          { header: "Pengawas", width: 2 },
          { header: "Operator", width: 2 },
          { header: "HM", width: 0.9, align: "right" },
          { header: "BBM", width: 0.9, align: "right" },
          { header: "Lokasi", width: 2.4 },
          { header: "Foto", width: 0.7, align: "right" },
        ],
        rows: r.rows.map((x) => [formatISODate(x.tanggal), x.unit, x.pengawas, x.operator, formatDecimal(x.hm), formatDecimal(x.bbm), x.lokasi, String(x.photos)]),
      },
    ];
  } else if (f.modul === "spare-part") {
    const r = await reportSparePart(f, { limit: EXPORT_MAX_ROWS });
    count = r.summary.count;
    sections = [
      {
        kind: "summary",
        items: [
          { label: "Jumlah catatan", value: r.summary.count.toLocaleString("id-ID") },
          { label: "Total spare part", value: r.summary.quantity.toLocaleString("id-ID") },
          ...PRIORITIES.map((p) => ({ label: `Prioritas ${PRIORITY_META[p].label}`, value: String(r.summary.byPriority[p] ?? 0) })),
        ],
      },
      {
        kind: "table",
        title: "Detail spare part rusak",
        note: truncatedNote(r.rows.length, r.hasMore),
        columns: [
          { header: "Dicatat", width: 1.8 },
          { header: "Unit", width: 1.3 },
          { header: "Spare part", width: 2.4 },
          { header: "No. part", width: 1.6 },
          { header: "Jml", width: 0.7, align: "right" },
          { header: "Prioritas", width: 1.1 },
          { header: "Pengawas", width: 1.8 },
          { header: "Lokasi", width: 1.8 },
        ],
        rows: r.rows.map((x) => [
          `${formatISODate(x.tanggal)} ${formatTime(x.createdAt)}`,
          x.unit,
          x.partName,
          x.partNumber ?? "-",
          String(x.quantity),
          PRIORITY_META[x.priority].label,
          x.pengawas,
          x.lokasi,
        ]),
      },
    ];
  } else {
    const r = await reportPlanning(f, { limit: EXPORT_MAX_ROWS });
    count = r.summary.count;
    sections = [
      {
        kind: "summary",
        items: [
          { label: "Jumlah planning", value: r.summary.count.toLocaleString("id-ID") },
          ...PLANNING_STATUSES.map((s) => ({ label: PLANNING_STATUS_META[s].label, value: String(r.summary.byStatus[s] ?? 0) })),
        ],
      },
      {
        kind: "table",
        title: "Detail planning",
        note: truncatedNote(r.rows.length, r.hasMore),
        columns: [
          { header: "Pekerjaan", width: 3 },
          { header: "Unit", width: 1.3 },
          { header: "Pengawas", width: 1.8 },
          { header: "Estimasi", width: 2.4 },
          { header: "Status", width: 1.3 },
          { header: "Lokasi", width: 1.8 },
        ],
        rows: r.rows.map((x) => [
          x.nama,
          x.unit,
          x.pengawas,
          x.mulai === x.selesai ? formatISODate(x.mulai) : `${formatISODate(x.mulai)} – ${formatISODate(x.selesai)}`,
          PLANNING_STATUS_META[x.status].label,
          x.lokasi,
        ]),
      },
    ];
  }

  const bytes = await renderReportPdf({
    title: TITLES[f.modul],
    subtitle: `${DATE_LABEL[f.modul]}: ${formatISODate(f.dari)} – ${formatISODate(f.sampai)}`,
    filters: await filterLabels(f),
    printedBy: user.name,
    printedAt: formatDateTime(new Date()),
    sections,
  });
  const filename = `paskam-${f.modul === "kerja" ? "laporan-kerja" : f.modul}-${f.dari}_${f.sampai}.pdf`;
  return { bytes, filename, count };
}

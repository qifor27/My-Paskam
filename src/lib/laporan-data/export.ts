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

/** Dokumentasi di PDF = jumlah foto (foto ada di aplikasi, lihat ADR-023). */
const photoLabel = (n: number) => (n === 0 ? "-" : `${n} foto`);

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
        // Urutan & nama kolom = lembar Excel Owner (2026-10-06); Unit = kolom tambahan.
        columns: [
          { header: "Pengawas", width: 1.9 },
          { header: "Hari, tanggal", width: 2.1 },
          { header: "Operator", width: 1.9 },
          { header: "BBM", width: 0.9, align: "right" },
          { header: "Jam/HM", width: 0.9, align: "right" },
          { header: "Lokasi", width: 2 },
          { header: "Unit", width: 1.2 },
          { header: "Dokumentasi", width: 1.2 },
        ],
        rows: r.rows.map((x) => [
          x.pengawas,
          formatISODate(x.tanggal, "day"),
          x.operator,
          formatDecimal(x.bbm),
          formatDecimal(x.hm),
          x.lokasi,
          x.unit,
          photoLabel(x.photos),
        ]),
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
          { header: "Nama unit", width: 1.2 },
          { header: "Spare part", width: 2.2 },
          { header: "Lokasi", width: 1.7 },
          { header: "Dokumentasi", width: 1.1 },
          { header: "Jml", width: 0.6, align: "right" },
          { header: "Prioritas", width: 1 },
          { header: "No. part", width: 1.5 },
          { header: "Dicatat", width: 2.1 },
          { header: "Pengawas", width: 1.7 },
        ],
        rows: r.rows.map((x) => [
          x.unit,
          x.partName,
          x.lokasi,
          photoLabel(x.photos),
          String(x.quantity),
          PRIORITY_META[x.priority].label,
          x.partNumber ?? "-",
          `${formatISODate(x.tanggal, "day")} ${formatTime(x.createdAt)}`,
          x.pengawas,
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
          { header: "Nama pengawas", width: 1.6 },
          { header: "Nama job", width: 2.1 },
          { header: "Lokasi job", width: 1.5 },
          { header: "Pekerjaan", width: 2.5 },
          { header: "Estimasi mulai", width: 1.8 },
          { header: "Estimasi selesai", width: 1.8 },
          { header: "Status", width: 1.5 },
          { header: "Unit", width: 1 },
        ],
        rows: r.rows.map((x) => [
          x.pengawas,
          x.nama,
          x.lokasi,
          x.deskripsi,
          formatISODate(x.mulai),
          formatISODate(x.selesai),
          PLANNING_STATUS_META[x.status].label,
          x.unit,
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

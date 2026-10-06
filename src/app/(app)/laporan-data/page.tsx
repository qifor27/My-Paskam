import { ChevronRight, SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AccessDenied } from "@/components/access-denied";
import { EmptyState } from "@/components/empty-state";
import { NavIcon } from "@/components/nav-icon";
import { PageHeader } from "@/components/page-header";
import { PlanningStatusBadge } from "@/components/planning-status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { formatDecimal, formatISODate, formatTime, todayISO } from "@/lib/format";
import { filtersToQuery, parseFilters, type DataFilters, type DataModule } from "@/lib/laporan-data/filters";
import { dataPinState } from "@/lib/laporan-data/pin";
import { filterOptions, reportLaporanKerja, reportPlanning, reportSparePart } from "@/lib/laporan-data/queries";
import { PLANNING_STATUSES, PLANNING_STATUS_META } from "@/lib/planning/status";
import { PRIORITIES, PRIORITY_META } from "@/lib/spare-part/priority";
import { cn } from "@/lib/utils";

import { ExportPdfButton } from "./export-button";
import { LockButton } from "./lock-button";
import { SetPinForm, UnlockForm } from "./pin-gate";

export const metadata: Metadata = { title: "Laporan Data" };

const MODULE_TABS: { key: DataModule; label: string; icon: "laporan-kerja" | "spare-part" | "planning-job" }[] = [
  { key: "kerja", label: "Laporan Kerja", icon: "laporan-kerja" },
  { key: "spare-part", label: "Spare Part", icon: "spare-part" },
  { key: "planning", label: "Planning", icon: "planning-job" },
];

const DATE_FIELD: Record<DataModule, string> = { kerja: "Tanggal laporan", "spare-part": "Tanggal dicatat", planning: "Estimasi mulai" };

export default async function LaporanDataPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser();
  if (!can(user.role, "laporan-data:access")) return <AccessDenied />;

  // Gerbang PIN (ADR-018): data tidak di-query sebelum PIN benar.
  const gate = await dataPinState(user);
  if (gate.state !== "unlocked") {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Laporan Data" />
        {gate.state === "unset" ? (
          <SetPinForm pinLength={AUTH_CONFIG.pinLength} mode="create" />
        ) : (
          <UnlockForm pinLength={AUTH_CONFIG.pinLength} minutes={AUTH_CONFIG.dataPinUnlockMinutes} />
        )}
      </div>
    );
  }

  const today = todayISO();
  const f = parseFilters(await searchParams, today);
  const options = await filterOptions();
  const activeFilters = [
    f.unit && options.units.find((u) => u.id === f.unit)?.name,
    f.pengawas && options.pengawas.find((p) => p.id === f.pengawas)?.name,
    f.modul === "planning" && f.status && PLANNING_STATUS_META[f.status].label,
    f.modul === "spare-part" && f.prioritas && `Prioritas ${PRIORITY_META[f.prioritas].label}`,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Laporan Data" description={`Terbuka sampai ${formatTime(gate.until)}`} />
        {/* Tombol di baris sendiri di HP agar judul tidak terpotong. */}
        <div className="flex items-start gap-2">
          <LockButton />
          <ExportPdfButton query={filtersToQuery(f, { hal: undefined })} />
        </div>
      </div>

      <nav aria-label="Modul" className="grid grid-cols-3 gap-1 rounded-full border border-border bg-surface p-1 shadow-card">
        {MODULE_TABS.map((t) => (
          <Link
            key={t.key}
            href={`/laporan-data?${filtersToQuery(f, { modul: t.key, status: undefined, prioritas: undefined, hal: undefined })}`}
            aria-current={f.modul === t.key ? "page" : undefined}
            className={cn(
              "flex h-10 items-center justify-center gap-1.5 rounded-full px-1 text-sm font-semibold",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20",
              f.modul === t.key ? "bg-brand-50 text-brand-700" : "text-ink-muted hover:text-ink",
            )}
          >
            <NavIcon name={t.icon} className="hidden size-4 sm:block" />
            <span className="truncate">{t.label}</span>
          </Link>
        ))}
      </nav>

      <FilterPanel f={f} options={options} activeFilters={activeFilters} />

      {f.modul === "kerja" ? <KerjaReport f={f} /> : f.modul === "spare-part" ? <SparePartReport f={f} /> : <PlanningReport f={f} />}
    </div>
  );
}

function FilterPanel({
  f,
  options,
  activeFilters,
}: {
  f: DataFilters;
  options: Awaited<ReturnType<typeof filterOptions>>;
  activeFilters: string[];
}) {
  return (
    <Card className="p-0">
      {/* <details> = filter bisa dilipat di HP tanpa JavaScript tambahan. */}
      <details className="group" open={activeFilters.length > 0 || undefined}>
        <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
          <SlidersHorizontal className="size-5 text-brand-700" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">Filter</span>
            <span className="block truncate text-sm tabular-nums text-ink-muted">
              {DATE_FIELD[f.modul]}: {formatISODate(f.dari)} – {formatISODate(f.sampai)}
              {activeFilters.length ? ` · ${activeFilters.join(" · ")}` : ""}
            </span>
          </span>
          <ChevronRight className="size-5 text-ink-muted transition-transform group-open:rotate-90" aria-hidden />
        </summary>
        <form method="get" action="/laporan-data" className="grid gap-4 border-t border-border p-4 sm:grid-cols-2">
          <input type="hidden" name="modul" value={f.modul} />
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Dari
            <Input type="date" name="dari" defaultValue={f.dari} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Sampai
            <Input type="date" name="sampai" defaultValue={f.sampai} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Unit
            <Select name="unit" defaultValue={f.unit ?? ""}>
              <option value="">Semua unit</option>
              {options.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                  {u.isActive ? "" : " (nonaktif)"}
                </option>
              ))}
            </Select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Pengawas
            <Select name="pengawas" defaultValue={f.pengawas ?? ""}>
              <option value="">Semua Pengawas</option>
              {options.pengawas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.isActive ? "" : " (nonaktif)"}
                </option>
              ))}
            </Select>
          </label>
          {f.modul === "planning" ? (
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Status
              <Select name="status" defaultValue={f.status ?? ""}>
                <option value="">Semua status</option>
                {PLANNING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {PLANNING_STATUS_META[s].label}
                  </option>
                ))}
              </Select>
            </label>
          ) : null}
          {f.modul === "spare-part" ? (
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Prioritas
              <Select name="prioritas" defaultValue={f.prioritas ?? ""}>
                <option value="">Semua prioritas</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </Select>
            </label>
          ) : null}
          <div className="flex gap-2 sm:col-span-2 sm:justify-end">
            <Link href={`/laporan-data?modul=${f.modul}`} className={cn(buttonVariants({ variant: "secondary" }), "flex-1 sm:flex-none")}>
              Reset
            </Link>
            <button type="submit" className={cn(buttonVariants(), "flex-1 sm:flex-none")}>
              Terapkan
            </button>
          </div>
        </form>
      </details>
    </Card>
  );
}

function Stats({ items }: { items: { label: string; value: string }[] }) {
  return (
    <Card className={cn("grid gap-px overflow-hidden bg-border p-0", items.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
      {items.map((s) => (
        <div key={s.label} className="flex flex-col gap-0.5 bg-surface p-4">
          <span className="text-xs text-ink-muted sm:text-sm">{s.label}</span>
          <span className="text-xl font-bold tabular-nums sm:text-2xl">{s.value}</span>
        </div>
      ))}
    </Card>
  );
}

function LoadMore({ f, hasMore }: { f: DataFilters; hasMore: boolean }) {
  if (!hasMore) return null;
  return (
    <Link href={`/laporan-data?${filtersToQuery(f, { hal: f.hal + 1 })}`} scroll={false} className={cn(buttonVariants({ variant: "secondary" }), "self-center")}>
      Muat lebih banyak
    </Link>
  );
}

const th = "px-4 py-3 text-left text-xs font-semibold text-ink-muted";
const td = "px-4 py-3 align-top";

async function KerjaReport({ f }: { f: DataFilters }) {
  const r = await reportLaporanKerja(f);
  if (r.summary.count === 0) return <EmptyState icon={SlidersHorizontal} title="Tidak ada laporan kerja" description="Tidak ada data untuk filter ini. Ubah rentang tanggal atau filter lain." />;
  return (
    <>
      <Stats
        items={[
          { label: "Laporan", value: String(r.summary.count) },
          { label: "Total HM (jam)", value: formatDecimal(r.summary.hm) },
          { label: "Total BBM", value: formatDecimal(r.summary.bbm) },
        ]}
      />
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Per unit</h2>
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm tabular-nums">
            <thead className="border-b border-border">
              <tr>
                <th className={th}>Unit</th>
                <th className={cn(th, "text-right")}>Laporan</th>
                <th className={cn(th, "text-right")}>HM</th>
                <th className={cn(th, "text-right")}>BBM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {r.perUnit.map((u) => (
                <tr key={u.unit}>
                  <td className={cn(td, "font-semibold")}>{u.unit}</td>
                  <td className={cn(td, "text-right")}>{u.count}</td>
                  <td className={cn(td, "text-right")}>{formatDecimal(u.hm)}</td>
                  <td className={cn(td, "text-right")}>{formatDecimal(u.bbm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Detail laporan</h2>
        <Card className="overflow-hidden p-0">
          <table className="hidden w-full text-sm tabular-nums md:table">
            <thead className="border-b border-border">
              <tr>
                <th className={th}>Tanggal</th>
                <th className={th}>Unit</th>
                <th className={th}>Pengawas</th>
                <th className={th}>Operator</th>
                <th className={cn(th, "text-right")}>HM</th>
                <th className={cn(th, "text-right")}>BBM</th>
                <th className={th}>Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {r.rows.map((x) => (
                <tr key={x.id} className="hover:bg-canvas">
                  <td className={td}>
                    <Link href={`/laporan-kerja/${x.id}`} className="font-medium text-brand-700 hover:underline">
                      {formatISODate(x.tanggal)}
                    </Link>
                  </td>
                  <td className={td}>{x.unit}</td>
                  <td className={td}>{x.pengawas}</td>
                  <td className={td}>{x.operator}</td>
                  <td className={cn(td, "text-right")}>{formatDecimal(x.hm)}</td>
                  <td className={cn(td, "text-right")}>{formatDecimal(x.bbm)}</td>
                  <td className={td}>{x.lokasi}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="divide-y divide-border md:hidden">
            {r.rows.map((x) => (
              <li key={x.id}>
                <Link href={`/laporan-kerja/${x.id}`} className="flex items-center gap-3 p-4 hover:bg-canvas">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {x.unit} · {formatDecimal(x.hm)} jam · BBM {formatDecimal(x.bbm)}
                    </span>
                    <span className="block truncate text-sm tabular-nums text-ink-muted">
                      {formatISODate(x.tanggal)} · {x.pengawas} · {x.operator}
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-ink-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </section>
      <LoadMore f={f} hasMore={r.hasMore} />
    </>
  );
}

async function SparePartReport({ f }: { f: DataFilters }) {
  const r = await reportSparePart(f);
  if (r.summary.count === 0) return <EmptyState icon={SlidersHorizontal} title="Tidak ada catatan spare part" description="Tidak ada data untuk filter ini. Ubah rentang tanggal atau filter lain." />;
  return (
    <>
      <Stats
        items={[
          { label: "Catatan", value: String(r.summary.count) },
          { label: "Total spare part", value: String(r.summary.quantity) },
        ]}
      />
      <Card className="flex flex-wrap items-center gap-2 p-4">
        <span className="mr-1 text-sm text-ink-muted">Per prioritas:</span>
        {PRIORITIES.map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5 text-sm tabular-nums">
            <PriorityBadge priority={p} /> {r.summary.byPriority[p] ?? 0}
          </span>
        ))}
      </Card>
      <Card className="divide-y divide-border overflow-hidden p-0">
        {r.rows.map((x) => (
          <Link key={x.id} href={`/spare-part/${x.id}`} className="flex items-center gap-3 p-4 hover:bg-canvas">
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate font-semibold">
                  {x.partName} <span className="font-normal tabular-nums text-ink-muted">×{x.quantity}</span>
                </span>
                <PriorityBadge priority={x.priority} />
              </span>
              <span className="block truncate text-sm tabular-nums text-ink-muted">
                {formatISODate(x.tanggal)} {formatTime(x.createdAt)} · {x.unit} · {x.pengawas}
                {x.partNumber ? ` · ${x.partNumber}` : ""}
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-ink-muted" aria-hidden />
          </Link>
        ))}
      </Card>
      <LoadMore f={f} hasMore={r.hasMore} />
    </>
  );
}

async function PlanningReport({ f }: { f: DataFilters }) {
  const r = await reportPlanning(f);
  if (r.summary.count === 0) return <EmptyState icon={SlidersHorizontal} title="Tidak ada planning" description="Tidak ada data untuk filter ini. Ubah rentang tanggal atau filter lain." />;
  return (
    <>
      <Stats items={[{ label: "Planning", value: String(r.summary.count) }, { label: "Selesai", value: String(r.summary.byStatus.SELESAI ?? 0) }]} />
      <Card className="flex flex-wrap items-center gap-2 p-4">
        <span className="mr-1 text-sm text-ink-muted">Per status:</span>
        {PLANNING_STATUSES.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 text-sm tabular-nums">
            <PlanningStatusBadge status={s} /> {r.summary.byStatus[s] ?? 0}
          </span>
        ))}
      </Card>
      <Card className="divide-y divide-border overflow-hidden p-0">
        {r.rows.map((x) => (
          <Link key={x.id} href={`/planning-job/${x.id}`} className="flex items-center gap-3 p-4 hover:bg-canvas">
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span className="font-semibold">{x.nama}</span>
                <PlanningStatusBadge status={x.status} />
              </span>
              <span className="block truncate text-sm tabular-nums text-ink-muted">
                {formatISODate(x.mulai)}
                {x.selesai !== x.mulai ? ` – ${formatISODate(x.selesai)}` : ""} · {x.unit} · {x.pengawas}
              </span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-ink-muted" aria-hidden />
          </Link>
        ))}
      </Card>
      <LoadMore f={f} hasMore={r.hasMore} />
    </>
  );
}

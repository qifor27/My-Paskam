import { ArrowRight, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/avatar";
import { ModuleTile } from "@/components/nav-icon";
import { PlanningStatusBadge } from "@/components/planning-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { dayLabel, formatDecimal, formatISODate, greeting } from "@/lib/format";
import { listLaporan } from "@/lib/laporan-kerja/queries";
import { listPlanning } from "@/lib/planning/queries";
import { navFor } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const GRID_COLS: Record<number, string> = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };

// Beranda (PRD §13, ADR-013): sapaan, hero aksi utama, aksi cepat, aktivitas.
// Tanpa widget dekoratif; ringkasan angka ditambah saat data modul tersedia.
export default async function DashboardPage() {
  const user = await requireUser();
  const items = navFor(user.role);
  const quick = items.filter((i) => i.quickAction);
  const isOwner = can(user.role, "pengawas:manage");
  const [activePengawas, recent, myPlanning] = await Promise.all([
    isOwner ? db.user.count({ where: { role: "PENGAWAS", isActive: true } }) : 0,
    can(user.role, "laporan-kerja:access") ? listLaporan(user, 3) : { items: [], hasMore: false },
    // Pengawas: pekerjaan aktif yang ditugaskan Owner (ADR-017).
    !isOwner && can(user.role, "planning-job:access") ? listPlanning(user, "aktif", 3) : [],
  ]);

  return (
    <div className="flex flex-col gap-7">
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted">{greeting()}</p>
          <h1 className="truncate text-2xl font-bold tracking-tight">{user.name}</h1>
        </div>
        <Link href="/akun" aria-label="Akun" className="rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20 md:hidden">
          <Avatar name={user.name} />
        </Link>
      </header>

      {/* Hero: satu-satunya kartu bergradien di halaman. */}
      <section className="rounded-[var(--radius-card)] bg-primary-gradient p-5 text-white shadow-primary">
        {isOwner ? (
          <>
            <p className="text-sm font-medium text-white">Ringkasan</p>
            <h2 className="mt-1 text-xl font-bold">Pantau operasional</h2>
            <p className="mt-1 text-sm text-white">
              <span className="font-semibold tabular-nums">{activePengawas}</span> Pengawas aktif. Lihat dan export laporan dari semua
              Pengawas.
            </p>
            <Link href="/laporan-data" className={cn(buttonVariants({ variant: "inverse", size: "sm" }), "mt-4")}>
              Buka Laporan Data <ArrowRight aria-hidden />
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-white">Hari ini</p>
            <h2 className="mt-1 text-xl font-bold">Catat pekerjaan unit</h2>
            <p className="mt-1 text-sm text-white">HM, BBM, operator, dan foto langsung dari lapangan.</p>
            <Link href="/laporan-kerja/baru" className={cn(buttonVariants({ variant: "inverse", size: "sm" }), "mt-4")}>
              <Plus aria-hidden /> Buat laporan
            </Link>
          </>
        )}
      </section>

      <section aria-labelledby="quick-title" className="flex flex-col gap-3">
        <h2 id="quick-title" className="text-base font-semibold">
          Menu
        </h2>
        <ul className={cn("grid gap-3", GRID_COLS[quick.length] ?? "grid-cols-4")}>
          {quick.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-full flex-col items-center gap-2 rounded-[var(--radius-card)] border border-border/70 bg-surface px-1 py-3 text-center shadow-card hover:border-brand-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20"
              >
                <ModuleTile icon={item.icon} color={item.tile} />
                <span className="text-xs font-medium leading-tight">{item.shortLabel}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {isOwner ? (
        <section aria-labelledby="admin-title" className="flex flex-col gap-3">
          <h2 id="admin-title" className="text-base font-semibold">
            Administrasi
          </h2>
          <Card>
            <Link href="/pengawas" className="flex items-center gap-3 p-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20 rounded-[var(--radius-card)]">
              <ModuleTile icon="pengawas" color="cyan" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">Pengawas</span>
                <span className="block text-sm text-ink-muted">Kelola akun, reset PIN, aktif/nonaktif</span>
              </span>
              <span className="text-sm font-semibold tabular-nums text-brand-700">{activePengawas} aktif</span>
              <ChevronRight className="size-5 text-ink-muted" aria-hidden />
            </Link>
          </Card>
        </section>
      ) : null}

      {myPlanning.length > 0 ? (
        <section aria-labelledby="planning-title" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="planning-title" className="text-base font-semibold">
              Planning untuk Anda
            </h2>
            <Link href="/planning-job" className="text-sm font-semibold text-brand-700 hover:underline">
              Lihat semua
            </Link>
          </div>
          <Card className="divide-y divide-border overflow-hidden">
            {myPlanning.map((p) => (
              <Link key={p.id} href={`/planning-job/${p.id}`} className="flex items-center gap-3 p-4 hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none">
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 font-semibold">{p.namaPekerjaan}</span>
                  <span className="mt-1.5 flex items-center gap-2 text-sm tabular-nums text-ink-muted">
                    <PlanningStatusBadge status={p.status} />
                    <span className="truncate">
                      {p.unitName} · mulai {formatISODate(p.estimasiMulai)}
                    </span>
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-ink-muted" aria-hidden />
              </Link>
            ))}
          </Card>
        </section>
      ) : null}

      <section aria-labelledby="recent-title" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="recent-title" className="text-base font-semibold">
            Aktivitas terbaru
          </h2>
          <Link href="/laporan-kerja" className="text-sm font-semibold text-brand-700 hover:underline">
            Lihat semua
          </Link>
        </div>
        {recent.items.length === 0 ? (
          <Card className="flex items-center gap-3 p-4">
            <ModuleTile icon="laporan-kerja" color="blue" />
            <div>
              <p className="font-semibold">Belum ada aktivitas</p>
              <p className="text-sm text-ink-muted">Laporan kerja yang dibuat akan muncul di sini.</p>
            </div>
          </Card>
        ) : (
          <Card className="divide-y divide-border overflow-hidden">
            {recent.items.map((r) => (
              <Link
                key={r.id}
                href={`/laporan-kerja/${r.id}`}
                className="flex items-center gap-3 p-4 hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none"
              >
                <ModuleTile icon="laporan-kerja" color="blue" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {r.unitName} · {formatDecimal(r.hmJam)} jam
                  </span>
                  <span className="block truncate text-sm text-ink-muted">
                    {dayLabel(r.tanggal)} · {isOwner ? r.supervisorName : r.operatorName}
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-ink-muted" aria-hidden />
              </Link>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}

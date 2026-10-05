import { CalendarDays, CalendarRange, ChevronRight, MapPin, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AccessDenied } from "@/components/access-denied";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PlanningStatusBadge } from "@/components/planning-status-badge";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { formatISODate } from "@/lib/format";
import { countByTab, listPlanning } from "@/lib/planning/queries";
import { TAB_STATUSES, type PlanningTab } from "@/lib/planning/status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Planning Job" };

const TABS: { key: PlanningTab; label: string }[] = [
  { key: "aktif", label: "Aktif" },
  { key: "selesai", label: "Selesai" },
  { key: "dibatalkan", label: "Dibatalkan" },
];

export default async function PlanningListPage({ searchParams }: { searchParams: Promise<{ tab?: string; dihapus?: string }> }) {
  const user = await requireUser();
  if (!can(user.role, "planning-job:access")) return <AccessDenied />;
  const { tab: rawTab, dihapus } = await searchParams;
  const tab: PlanningTab = rawTab && rawTab in TAB_STATUSES ? (rawTab as PlanningTab) : "aktif";
  const [rows, counts] = await Promise.all([listPlanning(user, tab), countByTab(user)]);
  const isOwner = can(user.role, "planning-job:create");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Planning Job"
        description={isOwner ? "Rencana pekerjaan untuk Pengawas" : "Pekerjaan yang ditugaskan kepada Anda"}
        action={
          isOwner ? (
            <Link href="/planning-job/baru" className={cn(buttonVariants({ size: "sm" }))}>
              <Plus aria-hidden /> Buat
            </Link>
          ) : undefined
        }
      />
      {dihapus ? <Alert tone="success">Planning dihapus.</Alert> : null}

      <nav aria-label="Filter status" className="grid grid-cols-3 gap-1 rounded-full border border-border bg-surface p-1 shadow-card">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/planning-job?tab=${t.key}`}
            aria-current={tab === t.key ? "page" : undefined}
            className={cn(
              "flex h-10 items-center justify-center gap-1.5 rounded-full text-sm font-semibold",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20",
              tab === t.key ? "bg-brand-50 text-brand-700" : "text-ink-muted hover:text-ink",
            )}
          >
            {t.label} <span className="tabular-nums opacity-70">{counts[t.key]}</span>
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={tab === "aktif" ? "Tidak ada planning aktif" : tab === "selesai" ? "Belum ada planning selesai" : "Tidak ada planning dibatalkan"}
          description={isOwner ? "Planning yang dibuat untuk Pengawas akan muncul di sini." : "Pekerjaan dari Owner akan muncul di sini."}
          action={
            isOwner && tab === "aktif" ? (
              <Link href="/planning-job/baru" className={buttonVariants()}>
                <Plus aria-hidden /> Buat planning
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {rows.map((r) => (
            <Link key={r.id} href={`/planning-job/${r.id}`} className="flex items-center gap-3 p-4 hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none">
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{r.namaPekerjaan}</p>
                  <PlanningStatusBadge status={r.status} />
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm tabular-nums text-ink-muted">
                  <span className="inline-flex items-center gap-1">
                    <CalendarRange className="size-4" aria-hidden />
                    {formatISODate(r.estimasiMulai)}
                    {r.estimasiSelesai !== r.estimasiMulai ? ` – ${formatISODate(r.estimasiSelesai)}` : ""}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-4" aria-hidden /> {r.lokasi}
                  </span>
                </p>
                <p className="mt-0.5 truncate text-sm text-ink-muted">
                  {r.unitName}
                  {isOwner ? ` · ${r.supervisorName}` : ""}
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-ink-muted" aria-hidden />
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}

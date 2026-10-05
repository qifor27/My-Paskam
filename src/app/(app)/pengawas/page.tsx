import { ChevronRight, Plus, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AccessDenied } from "@/components/access-denied";
import { Avatar } from "@/components/avatar";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pengawas" };

export default async function PengawasListPage({
  searchParams,
}: {
  searchParams: Promise<{ dibuat?: string }>;
}) {
  const user = await requireUser();
  if (!can(user.role, "pengawas:manage")) return <AccessDenied />;

  const { dibuat } = await searchParams;
  const list = await db.user.findMany({
    where: { role: "PENGAWAS" },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: { id: true, name: true, kodePengawas: true, isActive: true, lastLoginAt: true },
  });

  const addButton = (
    <Link href="/pengawas/baru" className={cn(buttonVariants({ size: "sm" }))}>
      <Plus aria-hidden /> Tambah
    </Link>
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Pengawas" backHref="/akun" action={list.length > 0 ? addButton : undefined} />

      {dibuat ? <Alert tone="success">Akun Pengawas berhasil dibuat.</Alert> : null}

      {list.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="Belum ada Pengawas"
          description="Buat akun agar Pengawas bisa masuk dengan Kode dan PIN."
          action={
            <Link href="/pengawas/baru" className={buttonVariants()}>
              <Plus aria-hidden /> Tambah Pengawas
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius-card)] border border-border/70 bg-surface shadow-card">
          {list.map((p) => (
            <li key={p.id}>
              <Link
                href={`/pengawas/${p.id}`}
                className="flex min-h-[4.5rem] items-center gap-3 px-4 py-3 hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none"
              >
                <Avatar name={p.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="text-sm tabular-nums text-ink-muted">
                    <code>{p.kodePengawas}</code>
                    {" · "}
                    {p.lastLoginAt ? `Terakhir masuk ${formatDateTime(p.lastLoginAt)}` : "Belum pernah masuk"}
                  </p>
                </div>
                <StatusBadge tone={p.isActive ? "success" : "neutral"}>{p.isActive ? "Aktif" : "Nonaktif"}</StatusBadge>
                <ChevronRight className="size-5 text-ink-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

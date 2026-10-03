import { ChevronRight, Plus, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AccessDenied } from "@/components/access-denied";
import { PageHeader } from "@/components/page-header";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pengawas" };

const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

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
      <Plus aria-hidden /> TAMBAH
    </Link>
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Pengawas" backHref="/" action={list.length > 0 ? addButton : undefined} />

      {dibuat ? <Alert tone="success">Akun Pengawas berhasil dibuat.</Alert> : null}

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-control)] border border-dashed border-border bg-surface px-4 py-10 text-center">
          <UserRound className="size-8 text-ink-muted" aria-hidden />
          <div>
            <p className="font-medium">Belum ada Pengawas</p>
            <p className="text-sm text-ink-muted">Buat akun agar Pengawas bisa masuk dengan Kode dan PIN.</p>
          </div>
          <Link href="/pengawas/baru" className={buttonVariants()}>
            <Plus aria-hidden /> TAMBAH PENGAWAS
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius-control)] border border-border bg-surface">
          {list.map((p) => (
            <li key={p.id}>
              <Link
                href={`/pengawas/${p.id}`}
                className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-brand-50 focus-visible:bg-brand-50 focus-visible:outline-none"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-sm text-ink-muted">
                    <code>{p.kodePengawas}</code>
                    {" · "}
                    {p.lastLoginAt ? `Terakhir masuk ${dateFormat.format(p.lastLoginAt)}` : "Belum pernah masuk"}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-xs font-semibold",
                    p.isActive ? "bg-green-50 text-success-600" : "bg-canvas text-ink-muted",
                  )}
                >
                  {p.isActive ? "AKTIF" : "NONAKTIF"}
                </span>
                <ChevronRight className="size-5 text-ink-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

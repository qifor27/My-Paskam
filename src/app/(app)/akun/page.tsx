import { ChevronRight, KeyRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Avatar } from "@/components/avatar";
import { InstallApp } from "@/components/install-app";
import { ModuleTile } from "@/components/nav-icon";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { navFor } from "@/lib/navigation";

import { LogoutButton } from "../logout-button";

export const metadata: Metadata = { title: "Akun" };

const ROLE_LABEL = { SUPER_ADMIN: "Owner", PENGAWAS: "Pengawas" } as const;

export default async function AkunPage() {
  const user = await requireUser();
  const detail = await db.user.findUnique({
    where: { id: user.id },
    select: { email: true, username: true, kodePengawas: true },
  });
  const admin = navFor(user.role).filter((i) => i.group === "admin");
  const identity = user.role === "PENGAWAS" ? detail?.kodePengawas : (detail?.email ?? detail?.username);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Akun" />
      <Card className="flex items-center gap-4 p-5">
        <Avatar name={user.name} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{user.name}</p>
          <p className="text-sm text-ink-muted">
            {ROLE_LABEL[user.role]}
            {identity ? <> · <span className="tabular-nums">{identity}</span></> : null}
          </p>
        </div>
      </Card>

      {admin.length > 0 ? (
        <Card className="divide-y divide-border overflow-hidden">
          {admin.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 p-4 hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none">
              <ModuleTile icon={item.icon} color={item.tile} />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{item.label}</span>
                <span className="block text-sm text-ink-muted">{item.description}</span>
              </span>
              <ChevronRight className="size-5 text-ink-muted" aria-hidden />
            </Link>
          ))}
        </Card>
      ) : null}

      {can(user.role, "laporan-data:access") ? (
        <Card className="overflow-hidden">
          <Link href="/laporan-data/pin" className="flex items-center gap-3 p-4 hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-tile-green-bg text-tile-green-fg">
              <KeyRound className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">PIN Laporan Data</span>
              <span className="block text-sm text-ink-muted">Buat atau ganti PIN untuk membuka Laporan Data</span>
            </span>
            <ChevronRight className="size-5 text-ink-muted" aria-hidden />
          </Link>
        </Card>
      ) : null}

      <InstallApp />

      <LogoutButton />
    </div>
  );
}

import Link from "next/link";

import { BottomNav, SideNav } from "@/components/app-nav";
import { Avatar } from "@/components/avatar";
import { BrandMark, Wordmark } from "@/components/brand";
import { CreateSheet } from "@/components/create-sheet";
import { NetworkBanner } from "@/components/network-status";
import { SyncBanner, SyncProvider } from "@/components/sync-provider";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { bottomNavFor, createActionsFor, navFor } from "@/lib/navigation";

const ROLE_LABEL = { SUPER_ADMIN: "Owner", PENGAWAS: "Pengawas" } as const;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const items = navFor(user.role);
  const createActions = createActionsFor(user.role);

  return (
    <SyncProvider userId={user.id} warmOffline={can(user.role, "laporan-kerja:create")}>
    <div className="min-h-dvh md:flex">
      <aside className="hidden w-64 shrink-0 flex-col gap-6 border-r border-border bg-surface px-4 py-6 md:sticky md:top-0 md:flex md:h-dvh">
        <Link href="/" className="flex items-center gap-3 px-1">
          <BrandMark />
          <Wordmark className="text-lg" />
        </Link>
        {createActions.length > 0 ? <CreateSheet actions={createActions} trigger="sidebar" /> : null}
        <SideNav items={items} />
        <Link
          href="/akun"
          className="mt-auto flex items-center gap-3 rounded-[var(--radius-control)] p-2 hover:bg-canvas focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20"
        >
          <Avatar name={user.name} size="sm" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold">{user.name}</span>
            <span className="block text-xs text-ink-muted">{ROLE_LABEL[user.role]}</span>
          </span>
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pt-[env(safe-area-inset-top)]">
        <NetworkBanner />
        <SyncBanner />
        {/* pb: ruang untuk bottom navigation + tombol + di mobile. */}
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-32 pt-5 md:px-8 md:pb-10 md:pt-8">{children}</main>
      </div>

      <BottomNav items={bottomNavFor(user.role)} createActions={createActions} />
    </div>
    </SyncProvider>
  );
}

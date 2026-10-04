import Link from "next/link";

import { BottomNav, SideNav } from "@/components/app-nav";
import { NetworkBanner } from "@/components/network-status";
import { requireUser } from "@/lib/auth/session";
import { navFor } from "@/lib/navigation";

import { LogoutButton } from "./logout-button";

const ROLE_LABEL = { SUPER_ADMIN: "Owner", PENGAWAS: "Pengawas" } as const;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const items = navFor(user.role);

  return (
    <div className="min-h-dvh md:flex">
      <aside className="hidden w-60 shrink-0 flex-col bg-brand-800 px-3 py-5 text-white md:sticky md:top-0 md:flex md:h-dvh">
        <Link href="/" className="mb-6 px-3 text-lg font-bold tracking-wide">
          MY PASKAM
        </Link>
        <SideNav items={items} />
        <div className="mt-auto flex items-center gap-2 border-t border-brand-700 px-1 pt-4">
          <div className="min-w-0 flex-1 px-2 leading-tight">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-xs text-brand-100">{ROLE_LABEL[user.role]}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 bg-brand-700 text-white md:hidden">
          <div className="flex h-14 items-center justify-between gap-3 px-4">
            <Link href="/" className="text-lg font-bold tracking-wide">
              MY PASKAM
            </Link>
            <div className="flex items-center gap-2">
              <div className="text-right leading-tight">
                <p className="max-w-36 truncate text-sm font-medium">{user.name}</p>
                <p className="text-xs text-brand-100">{ROLE_LABEL[user.role]}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </header>
        <NetworkBanner />
        {/* pb: ruang untuk bottom navigation di mobile. */}
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-8">{children}</main>
      </div>

      <BottomNav items={items} />
    </div>
  );
}

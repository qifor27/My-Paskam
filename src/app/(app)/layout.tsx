import Link from "next/link";

import { requireUser } from "@/lib/auth/session";

import { LogoutButton } from "./logout-button";

const ROLE_LABEL = { SUPER_ADMIN: "Owner", PENGAWAS: "Pengawas" } as const;

// Kerangka sementara; navigasi lengkap dibuat di Sprint 2 (Dashboard).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-brand-700 text-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
          <Link href="/" className="text-lg font-bold tracking-wide">
            MY PASKAM
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-brand-100">{ROLE_LABEL[user.role]}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">{children}</main>
    </div>
  );
}

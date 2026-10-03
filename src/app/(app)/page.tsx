import { ChevronRight, Users } from "lucide-react";
import Link from "next/link";

import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";

// Halaman sementara setelah login. Dashboard sebenarnya dibuat di Sprint 2.
export default async function HomePage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold">Halo, {user.name}</h1>

      {can(user.role, "pengawas:manage") ? (
        <Link
          href="/pengawas"
          className="flex items-center gap-3 rounded-[var(--radius-control)] border border-border bg-surface p-4 hover:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        >
          <Users className="size-5 text-brand-600" aria-hidden />
          <span className="flex-1">
            <span className="block font-medium">Kelola Pengawas</span>
            <span className="block text-sm text-ink-muted">Tambah akun, reset PIN, aktif/nonaktif</span>
          </span>
          <ChevronRight className="size-5 text-ink-muted" aria-hidden />
        </Link>
      ) : (
        <p className="text-ink-muted">Modul Laporan Kerja, Order Spare Part, dan Planning Job tersedia pada rilis berikutnya.</p>
      )}
    </div>
  );
}

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { NavIcon } from "@/components/nav-icon";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { navFor, type NavItem } from "@/lib/navigation";

// Dashboard (PRD §13): shortcut ke modul, tanpa widget dekoratif.
// Ringkasan angka operasional ditambahkan saat modul datanya tersedia.
export default async function DashboardPage() {
  const user = await requireUser();
  const items = navFor(user.role).filter((i) => i.href !== "/");
  const modules = items.filter((i) => i.group === "main");
  const admin = items.filter((i) => i.group === "admin");

  const activePengawas = admin.some((i) => i.href === "/pengawas")
    ? await db.user.count({ where: { role: "PENGAWAS", isActive: true } })
    : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Halo, {user.name}</h1>

      <ShortcutList title="Menu" items={modules} />

      {admin.length > 0 ? (
        <ShortcutList
          title="Administrasi"
          items={admin}
          meta={{ "/pengawas": activePengawas === null ? undefined : `${activePengawas} aktif` }}
        />
      ) : null}
    </div>
  );
}

function ShortcutList({
  title,
  items,
  meta = {},
}: {
  title: string;
  items: NavItem[];
  meta?: Record<string, string | undefined>;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">{title}</h2>
      <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius-control)] border border-border bg-surface">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex min-h-[4.5rem] items-center gap-4 px-4 py-3 hover:bg-brand-50 focus-visible:bg-brand-50 focus-visible:outline-none"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <NavIcon name={item.icon} className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{item.label}</span>
                <span className="block text-sm text-ink-muted">{item.description}</span>
              </span>
              {meta[item.href] ? <span className="text-sm font-medium text-brand-700">{meta[item.href]}</span> : null}
              <ChevronRight className="size-5 shrink-0 text-ink-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavIcon } from "@/components/nav-icon";
import { isActive, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Navigasi bawah untuk mobile: mudah dijangkau satu tangan (PRD §9). */
export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const visible = items.filter((i) => i.bottomNav);

  return (
    // Satu-satunya pemakaian glass di area aplikasi: floating navigation (PRD §6).
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-lg" style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))` }}>
        {visible.map((item) => {
          const active = isActive(item, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600",
                  active ? "text-brand-700" : "text-ink-muted",
                )}
              >
                {/* Indikator aktif: garis + bobot, tidak hanya warna. */}
                <span className={cn("h-0.5 w-6 rounded-full", active ? "bg-brand-700" : "bg-transparent")} />
                <NavIcon name={item.icon} className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                <span className={cn(active && "font-semibold")}>{item.shortLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Sidebar untuk layar ≥ md. */
export function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const groups = [
    { key: "main", label: null },
    { key: "admin", label: "Administrasi" },
  ] as const;

  return (
    <nav aria-label="Navigasi utama" className="flex flex-col gap-5">
      {groups.map(({ key, label }) => {
        const groupItems = items.filter((i) => i.group === key);
        if (groupItems.length === 0) return null;
        return (
          <div key={key} className="flex flex-col gap-1">
            {label ? <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-brand-100/70">{label}</p> : null}
            {groupItems.map((item) => {
              const active = isActive(item, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-md px-3 text-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                    active ? "bg-white font-semibold text-brand-800" : "text-brand-50 hover:bg-brand-700",
                  )}
                >
                  <NavIcon name={item.icon} className="size-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

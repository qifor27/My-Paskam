"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CreateSheet } from "@/components/create-sheet";
import { NavIcon } from "@/components/nav-icon";
import { isActive, type NavItem, type NavIconName, type TileColor } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type CreateAction = { href: string; label: string; icon: NavIconName; tile: TileColor };

/**
 * Navigasi bawah mobile: 2 item + tombol "+" oranye + 2 item (PRD §9, ADR-013).
 * Satu-satunya glass di area aplikasi selain overlay sheet (PRD §6).
 */
export function BottomNav({ items, createActions }: { items: NavItem[]; createActions: CreateAction[] }) {
  const pathname = usePathname();
  const half = Math.ceil(items.length / 2);

  const renderItem = (item: NavItem) => {
    const active = isActive(item, pathname);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex h-16 flex-col items-center justify-center gap-1 text-[11px]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600",
            active ? "font-semibold text-brand-700" : "font-medium text-ink-muted",
          )}
        >
          <NavIcon name={item.icon} className="size-6" strokeWidth={active ? 2.25 : 1.75} />
          {item.shortLabel}
        </Link>
      </li>
    );
  };

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md reduced-transparency:bg-surface reduced-transparency:backdrop-blur-none md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 items-start">
        {items.slice(0, half).map(renderItem)}
        <li className="flex justify-center">
          {createActions.length > 0 ? <CreateSheet actions={createActions} trigger="fab" /> : null}
        </li>
        {items.slice(half).map(renderItem)}
      </ul>
    </nav>
  );
}

/** Sidebar terang untuk layar ≥ md. */
export function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const groups = [
    { key: "main", label: null },
    { key: "admin", label: "Administrasi" },
  ] as const;

  return (
    <nav aria-label="Navigasi utama" className="flex flex-col gap-6">
      {groups.map(({ key, label }) => {
        const groupItems = items.filter((i) => i.group === key);
        if (groupItems.length === 0) return null;
        return (
          <div key={key} className="flex flex-col gap-1">
            {label ? <p className="px-3 pb-1 text-xs font-semibold text-ink-muted">{label}</p> : null}
            {groupItems.map((item) => {
              const active = isActive(item, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-full px-3 text-sm",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20",
                    active ? "bg-brand-50 font-semibold text-brand-700" : "text-ink-muted hover:bg-canvas hover:text-ink",
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

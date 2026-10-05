"use client";

import { ChevronRight, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { ModuleTile } from "@/components/nav-icon";
import type { NavIconName, TileColor } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type CreateAction = { href: string; label: string; icon: NavIconName; tile: TileColor };

/**
 * Tombol "+" oranye + menu "Buat baru" (ADR-013). Memakai <dialog> bawaan:
 * fokus terkunci di dalam sheet dan tombol Esc menutupnya tanpa kode tambahan.
 * Mobile: sheet dari bawah. Desktop: dialog di tengah.
 */
export function CreateSheet({ actions, trigger }: { actions: CreateAction[]; trigger: "fab" | "sidebar" }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();

  return (
    <>
      {trigger === "fab" ? (
        <button
          type="button"
          onClick={() => ref.current?.showModal()}
          aria-label="Buat baru"
          className={cn(
            "-mt-7 flex size-14 items-center justify-center rounded-full bg-accent-600 text-white shadow-accent ring-4 ring-canvas",
            "transition-transform active:scale-95 motion-reduce:active:scale-100",
            "focus-visible:outline-none focus-visible:ring-accent-500/40",
          )}
        >
          <Plus className="size-7" strokeWidth={2.5} aria-hidden />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.showModal()}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent-600 text-[15px] font-semibold text-white shadow-accent hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-500/30"
        >
          <Plus className="size-5" aria-hidden /> Buat baru
        </button>
      )}

      <dialog
        ref={ref}
        aria-labelledby="create-sheet-title"
        onClick={(e) => e.target === e.currentTarget && close()}
        className={cn(
          // Overlay: satu dari sedikit tempat glass diizinkan (PRD §6).
          "backdrop:bg-ink/40 backdrop:backdrop-blur-sm reduced-transparency:backdrop:backdrop-blur-none",
          "m-0 mt-auto w-full max-w-none bg-transparent p-0",
          "md:m-auto md:max-w-md",
        )}
      >
        <div className="rounded-t-[var(--radius-sheet)] bg-surface px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-raised md:rounded-[var(--radius-sheet)] md:pb-6">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border-strong md:hidden" aria-hidden />
          <div className="mb-3 flex items-center justify-between">
            <h2 id="create-sheet-title" className="text-lg font-semibold">
              Buat baru
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Tutup"
              className="flex size-11 items-center justify-center rounded-full text-ink-muted hover:bg-canvas"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {actions.map((a) => (
              <li key={a.href}>
                <Link
                  href={a.href}
                  onClick={close}
                  className="flex min-h-16 items-center gap-3 rounded-[var(--radius-control)] border border-border px-3 py-2 hover:bg-canvas focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20"
                >
                  <ModuleTile icon={a.icon} color={a.tile} />
                  <span className="flex-1 font-medium">{a.label}</span>
                  <ChevronRight className="size-5 text-ink-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}

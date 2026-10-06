"use client";

import { ArrowLeftRight, Truck } from "lucide-react";

import { DumpTruckIcon, ExcavatorIcon, TowTruckIcon } from "@/components/unit-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { unitKind, UNIT_TILE, type UnitKind } from "@/lib/unit-visual";
import { cn } from "@/lib/utils";

type Unit = { id: string; name: string };

const TILE_CLASS = {
  blue: "bg-tile-blue-bg text-tile-blue-fg",
  orange: "bg-tile-orange-bg text-tile-orange-fg",
  violet: "bg-tile-violet-bg text-tile-violet-fg",
  green: "bg-tile-green-bg text-tile-green-fg",
  cyan: "bg-tile-cyan-bg text-tile-cyan-fg",
} as const;

const ICON: Record<UnitKind, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  excavator: ExcavatorIcon,
  dump: DumpTruckIcon,
  towing: TowTruckIcon,
  other: Truck,
};

export function UnitIconTile({ name, size = "md", className }: { name: string; size?: "md" | "lg"; className?: string }) {
  const kind = unitKind(name);
  const Icon = ICON[kind];
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[var(--radius-control)]",
        size === "lg" ? "size-[4.5rem]" : "size-11",
        TILE_CLASS[UNIT_TILE[kind]],
        className,
      )}
    >
      <Icon className={size === "lg" ? "size-11" : "size-6"} strokeWidth={size === "lg" ? 1.75 : 2} />
    </span>
  );
}

/**
 * Langkah pertama form Laporan Kerja / Spare Part: pilih unit lewat kartu besar
 * (permintaan Owner 2026-10-06). Di sisi browser saja agar tetap jalan offline.
 */
export function UnitPicker({
  units,
  title,
  description,
  selectedId,
  onSelect,
  onCancel,
}: {
  units: Unit[];
  title: string;
  description: string;
  selectedId?: string;
  onSelect: (unitId: string) => void;
  onCancel?: () => void;
}) {
  return (
    <section aria-labelledby="unit-picker-title" className="flex flex-col gap-4">
      <div>
        <h2 id="unit-picker-title" className="text-lg font-bold">
          {title}
        </h2>
        <p className="text-sm text-ink-muted">{description}</p>
      </div>
      {units.length === 0 ? (
        <Card className="p-5 text-sm text-ink-muted">Belum ada unit aktif. Minta Owner menambahkan unit di menu Unit.</Card>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {units.map((u) => {
            const selected = u.id === selectedId;
            return (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => onSelect(u.id)}
                  aria-pressed={selected}
                  className={cn(
                    "flex h-full min-h-32 w-full flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border bg-surface p-4 text-center shadow-card transition-[border-color,transform]",
                    "active:scale-[0.98] motion-reduce:active:scale-100",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/25",
                    selected ? "border-brand-600 ring-2 ring-brand-600/20" : "border-border/70 hover:border-brand-200",
                  )}
                >
                  <UnitIconTile name={u.name} size="lg" />
                  <span className="text-base font-bold tracking-tight">{u.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {onCancel ? (
        <Button type="button" variant="secondary" onClick={onCancel} className="self-start">
          Batal
        </Button>
      ) : null}
    </section>
  );
}

/** Unit terpilih di dalam form + tombol Ganti. */
export function SelectedUnit({
  buttonId,
  unit,
  onChange,
  invalid,
}: {
  buttonId: string;
  unit: Unit | undefined;
  onChange: () => void;
  invalid?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-control)] border bg-surface p-3",
        invalid ? "border-danger-600" : "border-border",
      )}
    >
      {unit ? <UnitIconTile name={unit.name} /> : null}
      <span className="min-w-0 flex-1 truncate text-base font-bold">{unit?.name ?? "Unit belum dipilih"}</span>
      <Button id={buttonId} type="button" variant="ghost" size="sm" onClick={onChange}>
        <ArrowLeftRight aria-hidden /> {unit ? "Ganti" : "Pilih"}
      </Button>
    </div>
  );
}

"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Input jumlah dengan tombol −/+ 48 px (mudah dengan sarung tangan) dan
 * keypad angka. Nilai disimpan sebagai string agar isian setengah jadi tetap aman.
 */
export function QuantityInput({
  id,
  value,
  onChange,
  min = 1,
  max = 9999,
  invalid,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  invalid?: boolean;
  describedBy?: string;
}) {
  const n = Number.parseInt(value, 10);
  const step = (d: number) => onChange(String(Math.min(max, Math.max(min, (Number.isFinite(n) ? n : min - d) + d))));
  const btn =
    "flex size-12 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-ink hover:bg-brand-50 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20";

  return (
    <div className="flex items-center gap-2">
      <button type="button" className={btn} onClick={() => step(-1)} disabled={Number.isFinite(n) && n <= min} aria-label="Kurangi">
        <Minus className="size-5" aria-hidden />
      </button>
      <input
        id={id}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-12 w-24 rounded-[var(--radius-control)] border bg-surface text-center text-lg font-semibold tabular-nums text-ink",
          "focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/15",
          invalid ? "border-danger-600" : "border-border",
        )}
      />
      <button type="button" className={btn} onClick={() => step(1)} disabled={Number.isFinite(n) && n >= max} aria-label="Tambah">
        <Plus className="size-5" aria-hidden />
      </button>
    </div>
  );
}

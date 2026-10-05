"use client";

import { cn } from "@/lib/utils";

/**
 * Pilihan tunggal berbentuk chip (radio group) untuk opsi sedikit: unit, BBM,
 * tanggal cepat. Lebih cepat dari dropdown di HP (PRD §9: minim ketik).
 */
export function ChoiceChips<T extends string>({
  name,
  options,
  value,
  onChange,
  invalid,
  describedBy,
  labelledBy,
  className,
  size = "md",
}: {
  name: string;
  options: readonly { value: T; label: string }[];
  value: T | "";
  onChange: (value: T) => void;
  invalid?: boolean;
  describedBy?: string;
  labelledBy?: string;
  className?: string;
  size?: "md" | "square";
}) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {options.map((o) => {
        const checked = value === o.value;
        return (
          <label
            key={o.value}
            className={cn(
              "relative inline-flex cursor-pointer select-none items-center justify-center rounded-full border text-sm font-semibold transition-colors",
              "has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-600/25",
              size === "square" ? "size-12" : "h-11 px-4",
              checked
                ? "border-brand-600 bg-brand-600 text-white"
                : cn("bg-surface text-ink hover:bg-brand-50", invalid ? "border-danger-600" : "border-border-strong"),
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={checked}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            <span className="tabular-nums">{o.label}</span>
          </label>
        );
      })}
    </div>
  );
}

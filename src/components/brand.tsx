import { HardHat } from "lucide-react";

import { cn } from "@/lib/utils";

/** Logo sementara: tile gradien + ikon helm proyek. Ganti saat logo resmi ada. */
export function BrandMark({ size = "md", className }: { size?: "md" | "lg"; className?: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-primary-gradient text-white shadow-primary",
        size === "lg" ? "size-16 rounded-[1.25rem]" : "size-10 rounded-[var(--radius-control)]",
        className,
      )}
      aria-hidden
    >
      <HardHat className={size === "lg" ? "size-8" : "size-5"} />
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-bold tracking-tight", className)}>
      My <span className="text-brand-600">PASKAM</span>
    </span>
  );
}

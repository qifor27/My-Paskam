import { cn } from "@/lib/utils";

// Satu level kartu saja: jangan menaruh Card di dalam Card (PRD §4).
export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-[var(--radius-card)] border border-border/70 bg-surface shadow-card", className)}
      {...props}
    />
  );
}

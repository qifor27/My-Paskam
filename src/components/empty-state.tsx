import type { LucideIcon } from "lucide-react";

// Empty state bukan error (PRD §28): jelaskan kondisi + aksi berikutnya.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-control)] border border-dashed border-border bg-surface px-4 py-10 text-center">
      <Icon className="size-8 text-ink-muted" aria-hidden />
      <div>
        <p className="font-medium">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-ink-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

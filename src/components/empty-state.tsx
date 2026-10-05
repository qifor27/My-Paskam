import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

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
    <Card className="flex flex-col items-center gap-4 px-5 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-[var(--radius-control)] bg-tile-blue-bg text-tile-blue-fg">
        <Icon className="size-6" aria-hidden />
      </span>
      <div>
        <p className="text-base font-semibold">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      </div>
      {action}
    </Card>
  );
}

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export function PageHeader({
  title,
  description,
  backHref,
  action,
}: {
  title: string;
  description?: string;
  backHref?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      {backHref ? (
        <Link
          href={backHref}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink shadow-card hover:bg-canvas focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20"
          aria-label="Kembali"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-2xl font-bold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-ink-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

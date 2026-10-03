import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export function PageHeader({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {backHref ? (
        <Link
          href={backHref}
          className="-ml-2 flex size-11 items-center justify-center rounded-md text-ink-muted hover:bg-brand-50"
          aria-label="Kembali"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
      ) : null}
      <h1 className="flex-1 text-xl font-semibold">{title}</h1>
      {action}
    </div>
  );
}

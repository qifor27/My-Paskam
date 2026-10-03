import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

// Banner untuk kondisi sistem / hasil aksi (PRD §22). Bukan modal.
const STYLES = {
  error: { box: "border-danger-600/30 bg-red-50 text-danger-700", Icon: CircleAlert },
  warning: { box: "border-warning-600/30 bg-amber-50 text-amber-900", Icon: TriangleAlert },
  success: { box: "border-success-600/30 bg-green-50 text-green-900", Icon: CircleCheck },
  info: { box: "border-brand-600/25 bg-brand-50 text-brand-900", Icon: Info },
} as const;

function Alert({
  tone = "info",
  className,
  children,
  action,
}: {
  tone?: keyof typeof STYLES;
  className?: string;
  children: React.ReactNode;
  /** Tombol pemulihan, mis. COBA LAGI. */
  action?: React.ReactNode;
}) {
  const { box, Icon } = STYLES[tone];
  return (
    <div
      role={tone === "error" || tone === "warning" ? "alert" : "status"}
      className={cn("flex flex-col gap-3 rounded-[var(--radius-control)] border p-3 text-sm", box, className)}
    >
      <div className="flex gap-2">
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div className="flex-1">{children}</div>
      </div>
      {action}
    </div>
  );
}

export { Alert };

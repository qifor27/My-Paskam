import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/** Select native (picker bawaan HP lebih cepat & aksesibel) dengan gaya Input. */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-12 w-full appearance-none rounded-[var(--radius-control)] border border-border bg-surface pl-4 pr-11 text-base text-ink shadow-[0_1px_2px_rgb(15_23_42/0.04)]",
          "focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/15",
          "aria-invalid:border-danger-600",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-ink-muted" aria-hidden />
    </div>
  );
}

export { Select };

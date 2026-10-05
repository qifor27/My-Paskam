import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-[var(--radius-control)] border border-border bg-surface px-4 py-3 text-base text-ink shadow-[0_1px_2px_rgb(15_23_42/0.04)]",
        "placeholder:text-placeholder",
        "transition-[border-color,box-shadow] focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/15",
        "aria-invalid:border-danger-600 aria-invalid:focus-visible:ring-danger-600/15",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

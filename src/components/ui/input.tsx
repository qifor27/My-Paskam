import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-[var(--radius-control)] border border-border bg-surface px-3 text-base text-ink",
        "placeholder:text-ink-muted/70",
        "focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/25",
        "disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-70",
        "aria-invalid:border-danger-600 aria-invalid:focus-visible:ring-danger-600/25",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

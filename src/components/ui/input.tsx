import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-[var(--radius-control)] border border-border bg-surface px-4 text-base text-ink shadow-[0_1px_2px_rgb(15_23_42/0.04)]",
        "placeholder:text-placeholder",
        "transition-[border-color,box-shadow] focus-visible:border-brand-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/15",
        "disabled:cursor-not-allowed disabled:bg-canvas disabled:opacity-70",
        "aria-invalid:border-danger-600 aria-invalid:focus-visible:ring-danger-600/15",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

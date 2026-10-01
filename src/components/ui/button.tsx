import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

// PRD §8: state normal, hover, pressed, disabled, loading, focus.
// Pressed memakai translate selain warna agar tidak hanya mengandalkan warna.
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)]",
    "font-semibold tracking-wide transition-colors select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-600",
    "active:translate-y-px",
    "disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0",
    "[&_svg]:size-5 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: "bg-action-600 text-white hover:bg-action-700 active:bg-action-700",
        secondary:
          "border border-border bg-surface text-ink hover:bg-brand-50 active:bg-brand-100",
        danger: "bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700",
        ghost: "text-brand-700 hover:bg-brand-50 active:bg-brand-100",
      },
      size: {
        // PRD §9: touch target minimal 44–48 px.
        md: "h-12 px-5 text-sm",
        sm: "h-11 px-4 text-sm",
        icon: "size-12",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    /** Teks saat loading, mis. "MENYIMPAN...". */
    loadingText?: string;
  };

function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, block }), className)}
      // PRD §29: tidak bisa ditekan berkali-kali saat request berjalan.
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <LoaderCircle className="animate-spin" aria-hidden />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

// PRD §8: state normal, hover, pressed, disabled, loading, focus.
// Gaya pill (ADR-013). Pressed = skala sedikit mengecil, tidak hanya warna.
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full",
    "font-semibold transition-[background-color,box-shadow,transform,opacity] select-none",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/30",
    "active:scale-[0.98] motion-reduce:active:scale-100",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:scale-100",
    "[&_svg]:size-5 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        // Aksi utama: gradien biru → indigo.
        primary: "bg-primary-gradient text-white shadow-primary hover:brightness-110",
        // Aksen oranye: khusus aksi "buat baru" yang menonjol (jarang dipakai).
        accent: "bg-accent-600 text-white shadow-accent hover:bg-accent-700",
        secondary: "border border-border-strong bg-surface text-ink hover:bg-brand-50",
        // Tombol putih di atas hero card biru.
        inverse: "bg-surface text-brand-700 hover:bg-brand-50",
        danger: "bg-danger-600 text-white hover:bg-danger-700",
        "danger-outline": "border border-danger-600/40 bg-surface text-danger-800 hover:bg-danger-50",
        ghost: "text-brand-700 hover:bg-brand-50",
      },
      size: {
        // PRD §9: touch target minimal 44–48 px.
        lg: "h-14 px-7 text-base",
        md: "h-12 px-6 text-[15px]",
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
    /** Teks saat loading, mis. "Menyimpan…". */
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
          <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };

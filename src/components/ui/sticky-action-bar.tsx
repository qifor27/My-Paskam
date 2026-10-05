import { cn } from "@/lib/utils";

/**
 * Aksi utama form selalu di zona jempol (Hoober): di mobile menempel di atas
 * bottom navigation; di desktop menjadi baris biasa di akhir form.
 */
export function StickyActionBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 -mx-4 mt-2 flex flex-col-reverse gap-3 border-t border-border bg-canvas px-4 py-3",
        "sm:flex-row sm:justify-end",
        "md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

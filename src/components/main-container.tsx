"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

// Halaman data berbentuk tabel butuh lebar lebih; form & daftar tetap sempit agar nyaman dibaca.
const WIDE_PATHS = ["/laporan-data"];

export function MainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const wide = WIDE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  return (
    <main className={cn("mx-auto w-full flex-1 px-4 pb-32 pt-5 md:px-8 md:pb-10 md:pt-8", wide ? "max-w-6xl" : "max-w-3xl")}>
      {children}
    </main>
  );
}

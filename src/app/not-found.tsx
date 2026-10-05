import { SearchX } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-[var(--radius-control)] bg-tile-blue-bg text-tile-blue-fg">
        <SearchX className="size-6" aria-hidden />
      </span>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Halaman tidak ditemukan</h1>
        <p className="text-ink-muted">Alamat yang dibuka tidak tersedia atau data sudah tidak ada.</p>
      </div>
      <Link href="/" className={buttonVariants({ variant: "secondary" })}>
        Ke beranda
      </Link>
    </main>
  );
}

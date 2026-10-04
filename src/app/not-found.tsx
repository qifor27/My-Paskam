import { SearchX } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <SearchX className="size-8 text-ink-muted" aria-hidden />
      <div>
        <h1 className="text-xl font-semibold">Halaman tidak ditemukan</h1>
        <p className="text-ink-muted">Alamat yang dibuka tidak tersedia atau data sudah tidak ada.</p>
      </div>
      <Link href="/" className={buttonVariants({ variant: "secondary" })}>
        KE BERANDA
      </Link>
    </main>
  );
}

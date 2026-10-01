import { Wrench } from "lucide-react";

// Sementara sampai /login dibuat di Sprint 1.
export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <header className="bg-brand-700 px-4 py-4 text-white">
        <p className="text-lg font-bold tracking-wide">MY PASKAM</p>
      </header>
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-3 px-4 text-center">
        <Wrench className="mx-auto size-8 text-brand-600" aria-hidden />
        <h1 className="text-xl font-semibold">Aplikasi sedang disiapkan</h1>
        <p className="text-ink-muted">Halaman login tersedia pada rilis berikutnya.</p>
      </section>
    </main>
  );
}

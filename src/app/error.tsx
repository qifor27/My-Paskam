"use client";

import { ErrorScreen } from "@/components/error-screen";

// Error di layout (mis. cek sesi gagal karena database tidak terjangkau).
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col">
      <header className="bg-brand-700 px-4 py-4 text-white">
        <p className="text-lg font-bold tracking-wide">MY PASKAM</p>
      </header>
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <ErrorScreen digest={error.digest} reset={reset} />
      </div>
    </main>
  );
}

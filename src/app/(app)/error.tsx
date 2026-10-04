"use client";

import { ErrorScreen } from "@/components/error-screen";

// Error di dalam halaman: navigasi aplikasi tetap tampil.
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorScreen digest={error.digest} reset={reset} />;
}

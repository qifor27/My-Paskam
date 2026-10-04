// Feedback saat halaman dimuat (PRD §29). Bentuk menyerupai daftar agar
// tata letak tidak melompat saat konten muncul.
export default function Loading() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-live="polite">
      <span className="sr-only">Memuat…</span>
      <div className="h-7 w-48 animate-pulse rounded bg-border/70" />
      <div className="divide-y divide-border overflow-hidden rounded-[var(--radius-control)] border border-border bg-surface">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="size-10 animate-pulse rounded-md bg-border/70" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-border/70" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-border/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

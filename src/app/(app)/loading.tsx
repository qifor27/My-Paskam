// Feedback saat halaman dimuat (PRD §29). Bentuk menyerupai konten agar
// tata letak tidak melompat saat konten muncul.
export default function Loading() {
  const block = "animate-pulse rounded-[var(--radius-control)] bg-border/70 motion-reduce:animate-none";
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite">
      <span className="sr-only">Memuat…</span>
      <div className="flex flex-col gap-2">
        <div className={`${block} h-4 w-24`} />
        <div className={`${block} h-7 w-48`} />
      </div>
      <div className={`${block} h-36 rounded-[var(--radius-card)]`} />
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${block} h-24 rounded-[var(--radius-card)]`} />
        ))}
      </div>
    </div>
  );
}

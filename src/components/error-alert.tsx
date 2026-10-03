import { Alert } from "@/components/ui/alert";
import type { PublicError } from "@/lib/errors/public-error";

/** Menampilkan PublicError + kode referensi untuk dicari di log (PRD §26). */
export function ErrorAlert({ error, action }: { error: PublicError; action?: React.ReactNode }) {
  const tone = error.category === "NETWORK" ? "warning" : "error";
  return (
    <Alert tone={tone} action={error.retryable ? action : undefined}>
      <p>{error.message}</p>
      {error.errorId && error.category !== "VALIDATION" && error.category !== "AUTHENTICATION" ? (
        <p className="mt-1 text-xs opacity-80">
          Kode laporan: <code>{error.errorId}</code>
        </p>
      ) : null}
    </Alert>
  );
}

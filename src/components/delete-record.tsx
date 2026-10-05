"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ErrorAlert } from "@/components/error-alert";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import type { PublicError } from "@/lib/errors/public-error";

type Action = (formData: FormData) => Promise<{ ok: true; data: unknown } | { ok: false; error: PublicError }>;

// Hapus dengan konfirmasi dua langkah (PRD §22). Dipakai semua modul data lapangan.
export function DeleteRecord({ id, action, redirectTo, noun }: { id: string; action: Action; redirectTo: string; noun: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const { pending, submit, error } = useServerAction(action, {
    onSuccess: () => {
      router.push(redirectTo);
      router.refresh();
    },
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      {error ? (
        <ErrorAlert
          error={error}
          action={
            <Button type="submit" variant="secondary" size="sm" loading={pending}>
              Coba lagi
            </Button>
          }
        />
      ) : null}
      {confirming ? (
        <Alert tone="error">
          <p>Hapus {noun} ini? Data tidak akan tampil lagi.</p>
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setConfirming(false)}>
              Batal
            </Button>
            <Button type="submit" variant="danger" size="sm" loading={pending} loadingText="Menghapus…">
              Ya, hapus
            </Button>
          </div>
        </Alert>
      ) : (
        <Button type="button" variant="danger-outline" block onClick={() => setConfirming(true)}>
          <Trash2 aria-hidden /> Hapus {noun}
        </Button>
      )}
    </form>
  );
}

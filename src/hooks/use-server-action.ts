"use client";

import { useState, useTransition, type FormEvent } from "react";

import { networkError } from "@/lib/errors/client";
import type { PublicError } from "@/lib/errors/public-error";

type Result<T> = { ok: true; data: T } | { ok: false; error: PublicError };

/**
 * Menjalankan server action dari form tanpa mereset isian (PRD §23):
 * form tidak memakai prop `action`, jadi React tidak mengosongkan field.
 * Kegagalan transport (offline, koneksi putus) diubah menjadi error NETWORK.
 */
export function useServerAction<T>(
  action: (formData: FormData) => Promise<Result<T>>,
  options: { onSuccess?: (data: T, form: HTMLFormElement) => void } = {},
) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Result<T> | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return; // PRD §29: cegah submit ganda
    const form = event.currentTarget;
    // Sertakan tombol submit yang ditekan (name/value), mis. pilihan status.
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(form, submitter instanceof HTMLButtonElement ? submitter : null);

    startTransition(async () => {
      let next: Result<T>;
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        next = { ok: false, error: networkError() };
      } else {
        try {
          next = await action(formData);
        } catch {
          next = { ok: false, error: networkError() };
        }
      }
      setResult(next);
      if (next.ok) options.onSuccess?.(next.data, form);
    });
  }

  const error = result && !result.ok ? result.error : null;

  /** Hapus error satu field saat diubah ("reward early"); pasang di onInput form. */
  function clearFieldError(name: string) {
    setResult((prev) => {
      if (!prev || prev.ok || !prev.error.fieldErrors?.[name]) return prev;
      const rest = Object.fromEntries(Object.entries(prev.error.fieldErrors).filter(([k]) => k !== name));
      return { ok: false, error: { ...prev.error, fieldErrors: rest } };
    });
  }

  return {
    clearFieldError,
    pending,
    submit,
    error,
    fieldErrors: error?.fieldErrors ?? {},
    succeeded: result?.ok === true,
    reset: () => setResult(null),
  };
}

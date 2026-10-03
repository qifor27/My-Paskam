import "server-only";

import { z } from "zod";

import { AppError, toPublicError, type FieldErrors, type PublicError } from "@/lib/errors";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: PublicError };

/** Bungkus server action: semua error menjadi PublicError (ADR-006). */
export async function runAction<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    return { ok: false, error: toPublicError(error, { action: name }) };
  }
}

// Pesan bawaan Zod (non-kustom) memakai Bahasa Indonesia.
z.config(z.locales.id());

export function parseForm<S extends z.ZodType>(schema: S, formData: FormData): z.output<S> {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (result.success) return result.data;
  const fieldErrors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "form");
    // Field yang tidak terkirim sama sekali: jangan tampilkan pesan teknis tipe data.
    fieldErrors[field] ??= issue.code === "invalid_type" ? "Wajib diisi" : issue.message;
  }
  throw new AppError("VALIDATION", { fieldErrors });
}

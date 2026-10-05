import type { z } from "zod";

import type { FieldErrors } from "./app-error";

/** Ubah error zod menjadi field error (sama dengan parseForm di server). */
export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    out[field] ??= issue.code === "invalid_type" ? "Wajib diisi" : issue.message;
  }
  return out;
}

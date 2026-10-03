import type { PublicError } from "./public-error";
import { DEFAULT_ERROR_MESSAGES } from "./messages";

// Error yang terjadi sebelum request sampai ke server (offline / koneksi putus).
// Tidak ada errorId server karena tidak ada yang tercatat di log server.
export function networkError(): PublicError {
  return { category: "NETWORK", errorId: "", ...DEFAULT_ERROR_MESSAGES.NETWORK };
}

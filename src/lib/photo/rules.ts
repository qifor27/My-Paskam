// Aturan foto yang dipakai client (kompresi) dan server (validasi).
export const PHOTO_RULES = {
  /** ADR-014: foto wajib, minimal 1. */
  minPerRecord: 1,
  /** SEMENTARA (ADR-014): maksimal per laporan. */
  maxPerRecord: 6,
  /** PRD §39.3: dimensi maksimum ±1600 px, kualitas 75–80. */
  maxDimension: 1600,
  quality: 0.8,
  /** Batas server setelah kompresi (target 200–500 KB). */
  maxBytes: 2 * 1024 * 1024,
} as const;

export type ImageKind = "jpg" | "webp";

/** Deteksi tipe dari isi file (magic bytes), bukan dari nama/header yang bisa dipalsukan. */
export function detectImageKind(bytes: Uint8Array): ImageKind | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export const MIME: Record<ImageKind, string> = { jpg: "image/jpeg", webp: "image/webp" };

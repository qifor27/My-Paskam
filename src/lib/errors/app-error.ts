// Kategori error minimum menurut PRD §21, ditambah STORAGE_FULL (PRD §39.10).
export const ERROR_CATEGORIES = [
  "VALIDATION",
  "AUTHENTICATION",
  "AUTHORIZATION",
  "NETWORK",
  "SERVER",
  "UPLOAD",
  "STORAGE_FULL",
  "SESSION_EXPIRED",
  "UNEXPECTED",
] as const;

export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];

/** field -> pesan, untuk inline error (PRD §22). */
export type FieldErrors = Record<string, string>;

export function createErrorId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(3));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `ERR-${hex.toUpperCase()}`;
}

export class AppError extends Error {
  readonly category: ErrorCategory;
  readonly errorId: string;
  readonly fieldErrors?: FieldErrors;
  /** Pesan untuk user. Jika kosong, dipakai pesan default kategori. */
  readonly userMessage?: string;

  constructor(
    category: ErrorCategory,
    options: {
      userMessage?: string;
      fieldErrors?: FieldErrors;
      cause?: unknown;
      /** Pesan teknis untuk log, tidak pernah ditampilkan ke user. */
      detail?: string;
    } = {},
  ) {
    super(options.detail ?? category, { cause: options.cause });
    this.name = "AppError";
    this.category = category;
    this.errorId = createErrorId();
    this.userMessage = options.userMessage;
    this.fieldErrors = options.fieldErrors;
  }
}

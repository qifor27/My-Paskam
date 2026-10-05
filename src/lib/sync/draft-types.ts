// Tipe bersama draft data lapangan di IndexedDB (ADR-015, ADR-019).
export type DraftPhoto = {
  id: string;
  width: number;
  height: number;
  uploaded: boolean;
  /** Ada selama foto belum terunggah. */
  blob?: Blob;
};

/** Status antrean kirim. Tanpa `sync` = draft biasa (masih diisi). */
export type DraftSync =
  | { status: "queued"; queuedAt: number; lastError?: string }
  | { status: "failed"; queuedAt: number; error: string };

export type BaseDraft<F> = {
  id: string;
  /** Pemilik draft: hanya dikirim/ditampilkan untuk akun ini (perangkat bersama). */
  userId: string;
  mode: "create" | "edit";
  updatedAt: number;
  fields: F;
  photos: DraftPhoto[];
  sync?: DraftSync;
};

export const DRAFTS_CHANGED = "paskam:drafts-changed";

export function notifyDraftsChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(DRAFTS_CHANGED));
}

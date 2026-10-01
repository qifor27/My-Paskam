// Status sinkronisasi data offline (PRD §25). Berbeda dari status bisnis
// (mis. status Laporan Kerja) yang masih menunggu keputusan Owner.
export const SYNC_STATUSES = [
  "DRAFT",
  "PENDING_SYNC",
  "SYNCING",
  "SYNCED",
  "SYNC_FAILED",
] as const;

export type SyncStatus = (typeof SYNC_STATUSES)[number];

const TRANSITIONS: Record<SyncStatus, readonly SyncStatus[]> = {
  DRAFT: ["PENDING_SYNC"],
  // Kembali ke DRAFT jika user mengedit sebelum terkirim.
  PENDING_SYNC: ["SYNCING", "DRAFT"],
  SYNCING: ["SYNCED", "SYNC_FAILED"],
  // RETRY = kembali ke antrean.
  SYNC_FAILED: ["PENDING_SYNC", "DRAFT"],
  SYNCED: [],
};

export function canTransition(from: SyncStatus, to: SyncStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function transition(from: SyncStatus, to: SyncStatus): SyncStatus {
  if (!canTransition(from, to)) {
    throw new Error(`Transisi sync tidak valid: ${from} -> ${to}`);
  }
  return to;
}

export const SYNC_STATUS_LABEL: Record<SyncStatus, string> = {
  DRAFT: "Draft",
  PENDING_SYNC: "Menunggu sinkronisasi",
  SYNCING: "Menyinkronkan",
  SYNCED: "Tersimpan",
  SYNC_FAILED: "Gagal sinkronisasi",
};

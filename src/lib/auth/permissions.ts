import type { Role } from "@/generated/prisma/enums";

// Permission foundation (US-1.6). Hanya izin yang sudah jelas di PRD.
// Visibilitas data antar-Pengawas (Q16) ditambahkan saat modul data dibuat.
export const PERMISSIONS = {
  "pengawas:manage": ["SUPER_ADMIN"], // PRD §12
  // Akses modul (PRD §13). Aturan per-record menyusul di sprint modul.
  "laporan-kerja:access": ["SUPER_ADMIN", "PENGAWAS"],
  // ADR-014: Pengawas membuat laporan (namanya tercatat otomatis), Owner melihat semua.
  // ADR-021: Owner juga boleh mencatat (cadangan bila tidak ada Pengawas).
  "laporan-kerja:create": ["SUPER_ADMIN", "PENGAWAS"],
  "laporan-kerja:view-all": ["SUPER_ADMIN"],
  "unit:manage": ["SUPER_ADMIN"], // ADR-014: unit bisa ditambah
  "spare-part:access": ["SUPER_ADMIN", "PENGAWAS"],
  // ADR-016: dokumentasi spare part rusak; Pengawas mencatat, Owner melihat semua.
  "spare-part:create": ["SUPER_ADMIN", "PENGAWAS"],
  "spare-part:view-all": ["SUPER_ADMIN"],
  "planning-job:access": ["SUPER_ADMIN", "PENGAWAS"],
  // ADR-017: Owner membuat & mengelola planning; Pengawas melihat yang ditugaskan.
  "planning-job:create": ["SUPER_ADMIN"],
  "planning-job:view-all": ["SUPER_ADMIN"],
  // SEMENTARA (Q13): hanya Owner sampai diputuskan apakah Pengawas boleh melihat.
  "laporan-data:access": ["SUPER_ADMIN"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

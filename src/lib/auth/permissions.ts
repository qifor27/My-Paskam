import type { Role } from "@/generated/prisma/enums";

// Permission foundation (US-1.6). Hanya izin yang sudah jelas di PRD.
// Visibilitas data antar-Pengawas (Q16) ditambahkan saat modul data dibuat.
export const PERMISSIONS = {
  "pengawas:manage": ["SUPER_ADMIN"], // PRD §12
  // Akses modul (PRD §13). Aturan per-record menyusul di sprint modul.
  "laporan-kerja:access": ["SUPER_ADMIN", "PENGAWAS"],
  // ADR-014: Pengawas membuat laporan (namanya tercatat otomatis), Owner melihat semua.
  "laporan-kerja:create": ["PENGAWAS"],
  "laporan-kerja:view-all": ["SUPER_ADMIN"],
  "unit:manage": ["SUPER_ADMIN"], // ADR-014: unit bisa ditambah
  "spare-part:access": ["SUPER_ADMIN", "PENGAWAS"],
  "planning-job:access": ["SUPER_ADMIN", "PENGAWAS"],
  // SEMENTARA (Q13): hanya Owner sampai diputuskan apakah Pengawas boleh melihat.
  "laporan-data:access": ["SUPER_ADMIN"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

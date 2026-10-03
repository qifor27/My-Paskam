import type { Role } from "@/generated/prisma/enums";

// Permission foundation (US-1.6). Hanya izin yang sudah jelas di PRD.
// Visibilitas data antar-Pengawas (Q16) ditambahkan saat modul data dibuat.
export const PERMISSIONS = {
  "pengawas:manage": ["SUPER_ADMIN"], // PRD §12
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

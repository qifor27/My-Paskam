import { can } from "@/lib/auth/permissions";
import type { CurrentUser } from "@/lib/auth/session";

type Owned = { supervisorId: string; createdById: string; deletedAt: Date | null };

// ADR-014: Owner melihat semua; Pengawas hanya laporan miliknya.
export function canViewLaporan(user: Pick<CurrentUser, "id" | "role">, laporan: Owned): boolean {
  if (laporan.deletedAt) return false;
  return can(user.role, "laporan-kerja:view-all") || laporan.supervisorId === user.id;
}

// ADR-014: hanya Pengawas pembuat yang boleh mengubah/menghapus.
export function canEditLaporan(user: Pick<CurrentUser, "id" | "role">, laporan: Owned): boolean {
  if (laporan.deletedAt) return false;
  return can(user.role, "laporan-kerja:create") && laporan.createdById === user.id;
}

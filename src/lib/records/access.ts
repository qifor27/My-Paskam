import { can, type Permission } from "@/lib/auth/permissions";
import type { CurrentUser } from "@/lib/auth/session";

// Aturan kepemilikan record lapangan (ADR-014, ADR-016): Owner melihat semua,
// Pengawas hanya miliknya; hanya pembuat yang boleh mengubah/menghapus.
export type OwnedRecord = { supervisorId: string; createdById: string; deletedAt: Date | null };
type Actor = Pick<CurrentUser, "id" | "role">;

export function canViewOwned(user: Actor, record: OwnedRecord, viewAll: Permission): boolean {
  if (record.deletedAt) return false;
  return can(user.role, viewAll) || record.supervisorId === user.id;
}

export function canEditOwned(user: Actor, record: OwnedRecord, create: Permission): boolean {
  if (record.deletedAt) return false;
  return can(user.role, create) && record.createdById === user.id;
}

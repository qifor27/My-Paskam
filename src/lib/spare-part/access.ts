import type { CurrentUser } from "@/lib/auth/session";
import { canEditOwned, canViewOwned, type OwnedRecord } from "@/lib/records/access";

type Actor = Pick<CurrentUser, "id" | "role">;

// ADR-016 (disamakan dengan Laporan Kerja): Owner melihat semua, Pengawas miliknya.
export const canViewSparePart = (user: Actor, r: OwnedRecord) => canViewOwned(user, r, "spare-part:view-all");
export const canEditSparePart = (user: Actor, r: OwnedRecord) => canEditOwned(user, r, "spare-part:create");

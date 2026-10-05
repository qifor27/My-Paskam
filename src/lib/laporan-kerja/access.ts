import type { CurrentUser } from "@/lib/auth/session";
import { canEditOwned, canViewOwned, type OwnedRecord } from "@/lib/records/access";

type Actor = Pick<CurrentUser, "id" | "role">;

// ADR-014: Owner melihat semua; Pengawas hanya laporan miliknya.
export const canViewLaporan = (user: Actor, laporan: OwnedRecord) => canViewOwned(user, laporan, "laporan-kerja:view-all");

// ADR-014: hanya Pengawas pembuat yang boleh mengubah/menghapus.
export const canEditLaporan = (user: Actor, laporan: OwnedRecord) => canEditOwned(user, laporan, "laporan-kerja:create");

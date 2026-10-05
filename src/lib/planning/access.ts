import { can } from "@/lib/auth/permissions";
import type { CurrentUser } from "@/lib/auth/session";

import { canTransition, type PlanningStatus } from "./status";

type Actor = Pick<CurrentUser, "id" | "role">;
type Job = { supervisorId: string; status: PlanningStatus; deletedAt: Date | null };

// ADR-017: Owner melihat semua; Pengawas hanya planning yang ditugaskan kepadanya.
export function canViewPlanning(user: Actor, job: Job): boolean {
  if (job.deletedAt) return false;
  return can(user.role, "planning-job:view-all") || job.supervisorId === user.id;
}

// ADR-017: hanya Owner yang membuat, mengubah isi, dan menghapus planning.
export function canEditPlanning(user: Actor, job: Job): boolean {
  return !job.deletedAt && can(user.role, "planning-job:create");
}

// Pengawas: hanya planning miliknya dan sesuai tabel transisi. Owner: semua.
export function canChangeStatus(user: Actor, job: Job, to: PlanningStatus): boolean {
  if (!canViewPlanning(user, job)) return false;
  if (user.role === "PENGAWAS" && job.supervisorId !== user.id) return false;
  return canTransition(user.role, job.status, to);
}

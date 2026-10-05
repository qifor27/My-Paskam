import { CircleCheck, CircleDashed, CircleDot, CircleX, type LucideIcon } from "lucide-react";

import type { StatusTone } from "@/components/ui/status-badge";
import type { Role } from "@/generated/prisma/enums";

// Status Planning Job (ADR-017). Ikon satu keluarga lingkaran (pola Linear):
// putus-putus = belum mulai, bertitik = berjalan, centang = selesai, silang = batal.
export const PLANNING_STATUSES = ["DIRENCANAKAN", "BERJALAN", "SELESAI", "DIBATALKAN"] as const;
export type PlanningStatus = (typeof PLANNING_STATUSES)[number];

export const PLANNING_STATUS_META: Record<PlanningStatus, { label: string; tone: StatusTone; icon: LucideIcon }> = {
  DIRENCANAKAN: { label: "Direncanakan", tone: "neutral", icon: CircleDashed },
  BERJALAN: { label: "Berjalan", tone: "info", icon: CircleDot },
  SELESAI: { label: "Selesai", tone: "success", icon: CircleCheck },
  DIBATALKAN: { label: "Dibatalkan", tone: "neutral", icon: CircleX },
};

// Pengawas hanya maju satu langkah; Owner boleh ke status mana pun (ADR-017).
const PENGAWAS_TRANSITIONS: Partial<Record<PlanningStatus, PlanningStatus[]>> = {
  DIRENCANAKAN: ["BERJALAN"],
  BERJALAN: ["SELESAI"],
};

export function allowedTransitions(role: Role, from: PlanningStatus): PlanningStatus[] {
  if (role === "SUPER_ADMIN") return PLANNING_STATUSES.filter((s) => s !== from);
  return PENGAWAS_TRANSITIONS[from] ?? [];
}

export function canTransition(role: Role, from: PlanningStatus, to: PlanningStatus): boolean {
  return allowedTransitions(role, from).includes(to);
}

/** Kolom waktu aktual yang ikut berubah saat status berubah. */
export function timestampsFor(to: PlanningStatus, current: { startedAt: Date | null }, now = new Date()) {
  return {
    startedAt: to === "DIRENCANAKAN" ? null : to === "BERJALAN" || to === "SELESAI" ? (current.startedAt ?? now) : current.startedAt,
    completedAt: to === "SELESAI" ? now : null,
  };
}

/** Label tombol aksi untuk Pengawas. */
export const PENGAWAS_ACTION_LABEL: Partial<Record<PlanningStatus, string>> = {
  BERJALAN: "Mulai pekerjaan",
  SELESAI: "Tandai selesai",
};

export const TAB_STATUSES = {
  aktif: ["DIRENCANAKAN", "BERJALAN"],
  selesai: ["SELESAI"],
  dibatalkan: ["DIBATALKAN"],
} as const satisfies Record<string, readonly PlanningStatus[]>;
export type PlanningTab = keyof typeof TAB_STATUSES;

import "server-only";

import type { AuditResult } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { logger, redact } from "@/lib/logger";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGIN_LOCKED"
  | "LOGOUT"
  | "PENGAWAS_CREATED"
  | "PENGAWAS_UPDATED"
  | "PENGAWAS_ACTIVATED"
  | "PENGAWAS_DEACTIVATED"
  | "PENGAWAS_PIN_RESET"
  | "LAPORAN_CREATED"
  | "LAPORAN_UPDATED"
  | "LAPORAN_DELETED"
  | "SPARE_PART_CREATED"
  | "SPARE_PART_UPDATED"
  | "SPARE_PART_DELETED"
  | "PLANNING_CREATED"
  | "PLANNING_UPDATED"
  | "PLANNING_DELETED"
  | "PLANNING_STATUS_CHANGED"
  | "DATA_PIN_SET"
  | "DATA_PIN_FAILED"
  | "DATA_PIN_LOCKED"
  | "DATA_UNLOCKED"
  | "DATA_LOCKED"
  | "UNIT_CREATED"
  | "UNIT_UPDATED"
  | "UNIT_ACTIVATED"
  | "UNIT_DEACTIVATED";

// Audit log tidak boleh membuat aksi utama gagal: jika penulisan gagal,
// cukup dicatat di log aplikasi.
export async function audit(entry: {
  action: AuditAction;
  result: AuditResult;
  userId?: string | null;
  detail?: Record<string, unknown>;
  errorId?: string;
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        action: entry.action,
        result: entry.result,
        userId: entry.userId ?? null,
        detail: entry.detail ? (redact(entry.detail) as object) : undefined,
        errorId: entry.errorId,
      },
    });
  } catch (error) {
    logger.error("audit_write_failed", {
      action: entry.action,
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

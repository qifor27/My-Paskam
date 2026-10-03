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
  | "PENGAWAS_PIN_RESET";

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

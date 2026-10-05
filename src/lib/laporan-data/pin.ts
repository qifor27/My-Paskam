import "server-only";

import type { CurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

/** Status gerbang PIN Laporan Data untuk sesi ini (ADR-018). */
export async function dataPinState(user: CurrentUser): Promise<{ state: "unset" } | { state: "locked" } | { state: "unlocked"; until: Date }> {
  const [account, session] = await Promise.all([
    db.user.findUnique({ where: { id: user.id }, select: { dataPinHash: true } }),
    db.session.findUnique({ where: { id: user.sessionId }, select: { dataUnlockedUntil: true } }),
  ]);
  if (!account?.dataPinHash) return { state: "unset" };
  const until = session?.dataUnlockedUntil;
  return until && until > new Date() ? { state: "unlocked", until } : { state: "locked" };
}

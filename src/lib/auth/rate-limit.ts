import "server-only";

import { db } from "@/lib/db";

import { AUTH_CONFIG } from "./config";
import { lockedFor, registerFailure, type RateLimitRule } from "./rate-limit-policy";

const { windowMinutes, lockMinutes, maxFailuresPerIdentifier, maxFailuresPerIp } =
  AUTH_CONFIG.rateLimit;
const base = { windowMs: windowMinutes * 60_000, lockMs: lockMinutes * 60_000 };
const RULES = {
  identifier: { ...base, max: maxFailuresPerIdentifier },
  ip: { ...base, max: maxFailuresPerIp },
} satisfies Record<string, RateLimitRule>;

export function loginKeys(identifier: string, ip: string | null) {
  return [
    { key: `login:id:${identifier}`, rule: RULES.identifier },
    ...(ip ? [{ key: `login:ip:${ip}`, rule: RULES.ip }] : []),
  ];
}

/** Percobaan PIN Laporan Data per akun (ADR-018). */
export function dataPinKeys(userId: string) {
  return [{ key: `datapin:${userId}`, rule: RULES.identifier }];
}

type Keys = { key: string; rule: RateLimitRule }[];

/** Sisa waktu kunci terlama (ms), 0 jika tidak terkunci. */
export async function loginLockRemaining(keys: Keys, now = new Date()): Promise<number> {
  const rows = await db.rateLimit.findMany({ where: { key: { in: keys.map((k) => k.key) } } });
  return Math.max(0, ...rows.map((row) => lockedFor(row, now)));
}

export async function recordLoginFailure(keys: Keys, now = new Date()): Promise<void> {
  for (const { key, rule } of keys) {
    const current = await db.rateLimit.findUnique({ where: { key } });
    const next = registerFailure(current, rule, now);
    await db.rateLimit.upsert({ where: { key }, create: { key, ...next }, update: next });
  }
}

export async function clearRateLimit(keys: Keys): Promise<void> {
  await db.rateLimit.deleteMany({ where: { key: { in: keys.map((k) => k.key) } } });
}

export async function clearLoginFailures(identifier: string): Promise<void> {
  await db.rateLimit.deleteMany({ where: { key: `login:id:${identifier}` } });
}

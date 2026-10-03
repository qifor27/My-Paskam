import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import type { Role } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

import { AUTH_CONFIG, SESSION_COOKIE } from "./config";
import { can, type Permission } from "./permissions";

export type CurrentUser = {
  id: string;
  role: Role;
  name: string;
  sessionId: string;
};

// Token mentah hanya ada di cookie; DB menyimpan SHA-256-nya sehingga
// kebocoran tabel session tidak bisa dipakai untuk login.
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(user: { id: string; role: Role }, userAgent: string | null) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + AUTH_CONFIG.sessionHours[user.role] * 3_600_000);
  await db.session.create({
    data: { id: hashToken(token), userId: user.id, expiresAt, userAgent },
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}

type SessionLookup = { user: CurrentUser | null; hadCookie: boolean };

const lookupSession = cache(async (): Promise<SessionLookup> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return { user: null, hadCookie: false };

  const session = await db.session.findUnique({
    where: { id: hashToken(token) },
    include: { user: { select: { id: true, role: true, name: true, isActive: true } } },
  });
  if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
    if (session) await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return { user: null, hadCookie: true };
  }
  const { id, role, name } = session.user;
  return { user: { id, role, name, sessionId: session.id }, hadCookie: true };
});

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return (await lookupSession()).user;
}

/** Untuk halaman: arahkan ke /login (dengan pesan sesi berakhir jika relevan). */
export async function requireUser(): Promise<CurrentUser> {
  const { user, hadCookie } = await lookupSession();
  if (!user) redirect(hadCookie ? "/login?sesi=berakhir" : "/login");
  return user;
}

/** Untuk server action: lempar AppError agar UI bisa menampilkan pesan yang tepat. */
export async function requirePermission(permission: Permission): Promise<CurrentUser> {
  const { user } = await lookupSession();
  if (!user) throw new AppError("SESSION_EXPIRED");
  if (!can(user.role, permission)) {
    throw new AppError("AUTHORIZATION", { detail: `missing ${permission}` });
  }
  return user;
}

export async function revokeUserSessions(userId: string): Promise<void> {
  await db.session.deleteMany({ where: { userId } });
}

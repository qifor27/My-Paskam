import "server-only";

import { NextResponse } from "next/server";

import { toPublicError, type ErrorCategory } from "@/lib/errors";

const STATUS: Partial<Record<ErrorCategory, number>> = {
  VALIDATION: 422,
  AUTHENTICATION: 401,
  SESSION_EXPIRED: 401,
  AUTHORIZATION: 403,
  UPLOAD: 400,
  STORAGE_FULL: 507,
};

/** Bungkus route handler: semua error → JSON PublicError (ADR-006). */
export async function handleRoute(name: string, fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (error) {
    const publicError = toPublicError(error, { route: name });
    return NextResponse.json({ ok: false, error: publicError }, { status: STATUS[publicError.category] ?? 500 });
  }
}

/** Tolak POST lintas situs (cookie SameSite=Lax sudah mencegah sebagian besar). */
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    throw Object.assign(new Error("cross-origin"), { crossOrigin: true });
  }
}

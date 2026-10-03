// Logika murni rate limit (fixed window), dipisah dari DB agar mudah dites.
export type RateLimitState = {
  count: number;
  windowStart: Date;
  lockedUntil: Date | null;
};

export type RateLimitRule = {
  max: number;
  windowMs: number;
  lockMs: number;
};

export function lockedFor(state: RateLimitState | null, now: Date): number {
  if (!state?.lockedUntil) return 0;
  return Math.max(0, state.lockedUntil.getTime() - now.getTime());
}

export function registerFailure(
  state: RateLimitState | null,
  rule: RateLimitRule,
  now: Date,
): RateLimitState {
  const windowExpired = !state || now.getTime() - state.windowStart.getTime() >= rule.windowMs;
  const count = windowExpired ? 1 : state.count + 1;
  const windowStart = windowExpired ? now : state.windowStart;
  const lockedUntil = count >= rule.max ? new Date(now.getTime() + rule.lockMs) : null;
  return { count, windowStart, lockedUntil };
}

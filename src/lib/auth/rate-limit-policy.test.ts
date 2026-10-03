import { describe, expect, it } from "vitest";

import { lockedFor, registerFailure } from "./rate-limit-policy";

const rule = { max: 3, windowMs: 15 * 60_000, lockMs: 15 * 60_000 };
const t0 = new Date("2026-10-03T08:00:00Z");
const at = (minutes: number) => new Date(t0.getTime() + minutes * 60_000);

describe("rate limit policy", () => {
  it("mengunci setelah mencapai batas dalam satu window", () => {
    let s = registerFailure(null, rule, t0);
    s = registerFailure(s, rule, at(1));
    expect(s.lockedUntil).toBeNull();
    s = registerFailure(s, rule, at(2));
    expect(s.count).toBe(3);
    expect(s.lockedUntil).toEqual(at(17));
    expect(lockedFor(s, at(10))).toBe(7 * 60_000);
    expect(lockedFor(s, at(17))).toBe(0);
  });

  it("mereset hitungan jika window sudah lewat", () => {
    let s = registerFailure(null, rule, t0);
    s = registerFailure(s, rule, at(1));
    s = registerFailure(s, rule, at(20));
    expect(s.count).toBe(1);
    expect(s.windowStart).toEqual(at(20));
    expect(s.lockedUntil).toBeNull();
  });

  it("tidak terkunci jika belum ada catatan", () => {
    expect(lockedFor(null, t0)).toBe(0);
  });
});

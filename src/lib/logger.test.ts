import { describe, expect, it } from "vitest";

import { redact } from "./logger";

describe("redact", () => {
  it("menyensor credential di semua level", () => {
    expect(
      redact({
        userId: "u1",
        password: "rahasia",
        newPin: "123456",
        access_token: "abc",
        nested: { Authorization: "Bearer x", items: [{ sessionId: "s" }] },
      }),
    ).toEqual({
      userId: "u1",
      password: "[REDACTED]",
      newPin: "[REDACTED]",
      access_token: "[REDACTED]",
      nested: { Authorization: "[REDACTED]", items: [{ sessionId: "[REDACTED]" }] },
    });
  });

  it("tidak menyensor key yang hanya mengandung huruf 'pin'", () => {
    expect(redact({ shipping: 1, mapping: 2, pinned: 3 })).toEqual({
      shipping: 1,
      mapping: 2,
      pinned: 3,
    });
  });
});

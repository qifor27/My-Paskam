import { describe, expect, it } from "vitest";

import { formatDateTime } from "./format";

describe("formatDateTime", () => {
  it("memakai zona waktu aplikasi, bukan zona server", () => {
    // 02:30 UTC = 09:30 WIB
    expect(formatDateTime(new Date("2026-10-04T02:30:00Z"))).toBe("4 Okt 2026, 09.30");
  });
});

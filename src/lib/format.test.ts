import { describe, expect, it } from "vitest";

import { formatDateTime, greeting } from "./format";

describe("formatDateTime", () => {
  it("memakai zona waktu aplikasi, bukan zona server", () => {
    // 02:30 UTC = 09:30 WIB
    expect(formatDateTime(new Date("2026-10-04T02:30:00Z"))).toBe("4 Okt 2026, 09.30");
  });
});

describe("greeting", () => {
  it("mengikuti jam WIB, bukan jam server", () => {
    expect(greeting(new Date("2026-10-04T00:30:00Z"))).toBe("Selamat pagi"); // 07.30 WIB
    expect(greeting(new Date("2026-10-04T05:00:00Z"))).toBe("Selamat siang"); // 12.00
    expect(greeting(new Date("2026-10-04T09:00:00Z"))).toBe("Selamat sore"); // 16.00
    expect(greeting(new Date("2026-10-04T13:00:00Z"))).toBe("Selamat malam"); // 20.00
  });
});

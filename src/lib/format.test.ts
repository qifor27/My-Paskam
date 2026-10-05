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

describe("tanggal tanpa jam", () => {
  it("todayISO memakai zona aplikasi", async () => {
    const { todayISO, dayLabel } = await import("./format");
    // 20.00 UTC tgl 4 = 03.00 WIB tgl 5
    expect(todayISO(new Date("2026-10-04T20:00:00Z"))).toBe("2026-10-05");
    const now = new Date("2026-10-05T03:00:00Z");
    expect(dayLabel("2026-10-05", now)).toBe("Hari ini");
    expect(dayLabel("2026-10-04", now)).toBe("Kemarin");
    expect(dayLabel("2026-10-01", now)).toBe("Kamis, 1 Oktober 2026");
  });
});

describe("zonedDayStart", () => {
  it("00.00 WIB = 17.00 UTC hari sebelumnya", async () => {
    const { zonedDayStart, monthStartISO } = await import("./format");
    expect(zonedDayStart("2026-10-05").toISOString()).toBe("2026-10-04T17:00:00.000Z");
    expect(monthStartISO("2026-10-05")).toBe("2026-10-01");
  });
});

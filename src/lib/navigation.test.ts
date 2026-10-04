import { describe, expect, it } from "vitest";

import { NAV_ITEMS, isActive, navFor } from "./navigation";

const hrefs = (role: "SUPER_ADMIN" | "PENGAWAS") => navFor(role).map((i) => i.href);

describe("navFor", () => {
  it("Owner melihat semua modul dan menu Pengawas", () => {
    expect(hrefs("SUPER_ADMIN")).toEqual([
      "/",
      "/laporan-kerja",
      "/spare-part",
      "/planning-job",
      "/laporan-data",
      "/pengawas",
    ]);
  });

  it("Pengawas tidak melihat Laporan Data dan menu Pengawas", () => {
    expect(hrefs("PENGAWAS")).toEqual(["/", "/laporan-kerja", "/spare-part", "/planning-job"]);
  });

  it("bottom navigation maksimal 5 item untuk role mana pun", () => {
    for (const role of ["SUPER_ADMIN", "PENGAWAS"] as const) {
      expect(navFor(role).filter((i) => i.bottomNav).length).toBeLessThanOrEqual(5);
    }
  });
});

describe("isActive", () => {
  const [home, laporan] = NAV_ITEMS;
  it("Beranda hanya aktif di /", () => {
    expect(isActive(home!, "/")).toBe(true);
    expect(isActive(home!, "/laporan-kerja")).toBe(false);
  });
  it("modul aktif juga di sub-halaman, tapi tidak untuk prefix lain", () => {
    expect(isActive(laporan!, "/laporan-kerja/123")).toBe(true);
    expect(isActive(laporan!, "/laporan-kerja-lain")).toBe(false);
  });
});

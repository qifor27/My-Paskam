import { describe, expect, it } from "vitest";

import { NAV_ITEMS, bottomNavFor, createActionsFor, isActive, navFor } from "./navigation";

const hrefs = (items: { href: string }[]) => items.map((i) => i.href);

describe("navFor", () => {
  it("Owner melihat semua modul, menu Pengawas, dan Akun", () => {
    expect(hrefs(navFor("SUPER_ADMIN"))).toEqual([
      "/",
      "/laporan-kerja",
      "/spare-part",
      "/planning-job",
      "/laporan-data",
      "/pengawas",
      "/unit",
      "/akun",
    ]);
  });

  it("Pengawas tidak melihat Laporan Data dan menu Pengawas", () => {
    expect(hrefs(navFor("PENGAWAS"))).toEqual(["/", "/laporan-kerja", "/spare-part", "/planning-job", "/akun"]);
  });
});

describe("bottomNavFor", () => {
  it("4 item per role (tombol + berada di tengah)", () => {
    expect(hrefs(bottomNavFor("PENGAWAS"))).toEqual(["/", "/laporan-kerja", "/spare-part", "/akun"]);
    expect(hrefs(bottomNavFor("SUPER_ADMIN"))).toEqual(["/", "/laporan-kerja", "/laporan-data", "/akun"]);
  });
});

describe("createActionsFor", () => {
  it("menu Buat baru mengikuti izin role", () => {
    expect(hrefs(createActionsFor("PENGAWAS"))).toEqual(["/laporan-kerja/baru", "/spare-part/baru", "/planning-job/baru"]);
    expect(hrefs(createActionsFor("SUPER_ADMIN"))).toContain("/pengawas/baru");
    // ADR-014: laporan kerja dibuat Pengawas, Owner hanya melihat.
    expect(hrefs(createActionsFor("SUPER_ADMIN"))).not.toContain("/laporan-kerja/baru");
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

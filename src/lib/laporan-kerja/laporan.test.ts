import { describe, expect, it } from "vitest";

import { canEditLaporan, canViewLaporan } from "./access";
import { laporanSchema, parseDecimalInput } from "./schema";

const today = "2026-10-05";
const valid = {
  id: "8c7a3f0e-5b1d-4c2a-9e8f-1a2b3c4d5e6f",
  tanggal: today,
  unitId: "0a1f6c2e-1d1e-4a51-9a10-000000000001",
  operatorName: " Joko ",
  hmJam: "7,5",
  bbm: "40,5",
  lokasi: "Pit Utara",
  deskripsi: "Perawatan unit",
  photoIds: "2f1c1d3e-0b4a-4c8e-9a6b-1d2e3f4a5b6c",
};
const issues = (patch: object) =>
  laporanSchema(today).safeParse({ ...valid, ...patch }).error?.issues.map((i) => [i.path[0], i.message]);

describe("parseDecimalInput", () => {
  it("menerima koma atau titik", () => {
    expect(parseDecimalInput("7,5")).toBe(7.5);
    expect(parseDecimalInput(" 8 ")).toBe(8);
    expect(parseDecimalInput("12.25")).toBe(12.25);
  });
  it("menolak teks, negatif, dan pemisah ganda", () => {
    for (const v of ["", "abc", "-1", "1,2,3", "7,5 jam", "1e3"]) expect(parseDecimalInput(v)).toBeNull();
  });
});

describe("laporanSchema", () => {
  it("menerima input valid dan menormalkan nilai", () => {
    const data = laporanSchema(today).parse(valid);
    expect(data.hmJam).toBe(7.5);
    expect(data.bbm).toBe(40.5);
    expect(data.operatorName).toBe("Joko");
    expect(data.photoIds).toHaveLength(1);
  });

  it("aturan ADR-014/016: foto wajib, maks. 6; BBM jumlah >= 0; HM 0–24 dengan 1 desimal", () => {
    expect(issues({ photoIds: "" })).toEqual([["photoIds", "Tambahkan minimal 1 foto"]]);
    const seven = Array.from({ length: 7 }, (_, i) => `2f1c1d3e-0b4a-4c8e-9a6b-1d2e3f4a5b6${i}`).join(",");
    expect(issues({ photoIds: seven })).toEqual([["photoIds", "Maksimal 6 foto"]]);
    expect(issues({ bbm: "0" })).toBeUndefined();
    expect(issues({ bbm: "120" })).toBeUndefined();
    expect(issues({ bbm: "" })).toEqual([["bbm", "BBM wajib diisi"]]);
    expect(issues({ bbm: "-5" })).toEqual([["bbm", "BBM berupa angka, contoh 40"]]);
    expect(issues({ bbm: "12,25" })).toEqual([["bbm", "BBM maksimal 1 angka di belakang koma"]]);
    expect(issues({ hmJam: "25" })).toEqual([["hmJam", "HM maksimal 24 jam"]]);
    expect(issues({ hmJam: "7,55" })).toEqual([["hmJam", "HM maksimal 1 angka di belakang koma"]]);
    expect(issues({ hmJam: "tujuh" })).toEqual([["hmJam", "HM berupa angka, contoh 7,5"]]);
    expect(issues({ hmJam: "100" })).toEqual([["hmJam", "HM maksimal 24 jam"]]);
  });

  it("tanggal tidak boleh di masa depan", () => {
    expect(issues({ tanggal: "2026-10-06" })).toEqual([["tanggal", "Tanggal tidak boleh melewati hari ini"]]);
  });
});

describe("akses laporan (ADR-014)", () => {
  const laporan = { supervisorId: "p1", createdById: "p1", deletedAt: null };
  it("Owner melihat semua, tidak mengubah", () => {
    const owner = { id: "o1", role: "SUPER_ADMIN" as const };
    expect(canViewLaporan(owner, laporan)).toBe(true);
    expect(canEditLaporan(owner, laporan)).toBe(false);
  });
  it("Pengawas hanya melihat & mengubah miliknya", () => {
    expect(canViewLaporan({ id: "p1", role: "PENGAWAS" }, laporan)).toBe(true);
    expect(canEditLaporan({ id: "p1", role: "PENGAWAS" }, laporan)).toBe(true);
    expect(canViewLaporan({ id: "p2", role: "PENGAWAS" }, laporan)).toBe(false);
    expect(canEditLaporan({ id: "p2", role: "PENGAWAS" }, laporan)).toBe(false);
  });
  it("laporan terhapus tidak bisa dilihat siapa pun", () => {
    const deleted = { ...laporan, deletedAt: new Date() };
    expect(canViewLaporan({ id: "o1", role: "SUPER_ADMIN" }, deleted)).toBe(false);
  });
});

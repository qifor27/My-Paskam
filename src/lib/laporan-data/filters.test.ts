import { describe, expect, it } from "vitest";

import { filtersToQuery, parseFilters } from "./filters";

const today = "2026-10-05";

describe("parseFilters", () => {
  it("default: modul Laporan Kerja, awal bulan s.d. hari ini", () => {
    expect(parseFilters({}, today)).toMatchObject({ modul: "kerja", dari: "2026-10-01", sampai: today, hal: 1 });
  });
  it("nilai rusak diabaikan, bukan error", () => {
    const f = parseFilters({ modul: "hack", dari: "kemarin", unit: "1 OR 1=1", status: "SELESAI", prioritas: "X", hal: "999" }, today);
    expect(f).toMatchObject({ modul: "kerja", dari: "2026-10-01", unit: undefined, status: "SELESAI", prioritas: undefined, hal: 1 });
  });
  it("rentang terbalik ditukar", () => {
    expect(parseFilters({ dari: "2026-10-05", sampai: "2026-09-01" }, today)).toMatchObject({ dari: "2026-09-01", sampai: "2026-10-05" });
  });
  it("query string mempertahankan filter dan bisa ditimpa", () => {
    const f = parseFilters({ modul: "planning", status: "BERJALAN" }, today);
    expect(filtersToQuery(f, { hal: 2 })).toBe("modul=planning&dari=2026-10-01&sampai=2026-10-05&status=BERJALAN&hal=2");
  });
});

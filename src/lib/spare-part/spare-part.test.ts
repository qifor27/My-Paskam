import { describe, expect, it } from "vitest";

import { canEditSparePart, canViewSparePart } from "./access";
import { sparePartSchema } from "./schema";

const valid = {
  id: "8c7a3f0e-5b1d-4c2a-9e8f-1a2b3c4d5e6f",
  unitId: "0a1f6c2e-1d1e-4a51-9a10-000000000001",
  partName: " Filter oli ",
  partNumber: "",
  quantity: "2",
  priority: "TINGGI",
  kerusakan: "Bocor di sambungan",
  lokasi: "Workshop",
  photoIds: "2f1c1d3e-0b4a-4c8e-9a6b-1d2e3f4a5b6c",
};
const issues = (patch: object) => sparePartSchema.safeParse({ ...valid, ...patch }).error?.issues.map((i) => i.path[0]);

describe("sparePartSchema (ADR-016)", () => {
  it("menerima input valid tanpa field status", () => {
    const data = sparePartSchema.parse({ ...valid, status: "DIPESAN" });
    expect(data.partName).toBe("Filter oli");
    expect(data.partNumber).toBeNull(); // opsional
    expect(data.quantity).toBe(2);
    expect(data).not.toHaveProperty("status");
  });
  it("jumlah bilangan bulat >= 1, prioritas dari daftar (ADR-017)", () => {
    expect(issues({ quantity: "0" })).toEqual(["quantity"]);
    expect(issues({ quantity: "1.5" })).toEqual(["quantity"]);
    expect(issues({ quantity: "" })).toEqual(["quantity"]);
    expect(issues({ priority: "DARURAT" })).toEqual(["priority"]);
    expect(sparePartSchema.parse({ ...valid, partNumber: " 600-211-1340 " }).partNumber).toBe("600-211-1340");
  });
  it("wajib: unit, nama part, kerusakan, lokasi, foto", () => {
    expect(issues({ unitId: "", partName: "", kerusakan: " ", lokasi: "", photoIds: "" })).toEqual([
      "unitId",
      "partName",
      "kerusakan",
      "lokasi",
      "photoIds",
    ]);
  });
});

describe("akses spare part", () => {
  const record = { supervisorId: "p1", createdById: "p1", deletedAt: null };
  it("Owner melihat semua & mengubah buatannya sendiri; Pengawas hanya miliknya (ADR-021)", () => {
    expect(canViewSparePart({ id: "o1", role: "SUPER_ADMIN" }, record)).toBe(true);
    expect(canEditSparePart({ id: "o1", role: "SUPER_ADMIN" }, record)).toBe(false);
    expect(canEditSparePart({ id: "o1", role: "SUPER_ADMIN" }, { supervisorId: "o1", createdById: "o1", deletedAt: null })).toBe(true);
    expect(canViewSparePart({ id: "p2", role: "PENGAWAS" }, record)).toBe(false);
    expect(canEditSparePart({ id: "p1", role: "PENGAWAS" }, record)).toBe(true);
  });
});

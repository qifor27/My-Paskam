import { describe, expect, it } from "vitest";

import { can } from "./permissions";
import { pengawasCreateSchema, pengawasLoginSchema } from "./validation";

const valid = {
  id: "8c7a3f0e-5b1d-4c2a-9e8f-1a2b3c4d5e6f",
  name: " Budi ",
  kodePengawas: " spv001 ",
  pin: "123456",
  pinConfirm: "123456",
};

describe("pengawasCreateSchema", () => {
  it("menormalkan nama dan kode (trim + huruf besar)", () => {
    const data = pengawasCreateSchema.parse(valid);
    expect(data.name).toBe("Budi");
    expect(data.kodePengawas).toBe("SPV001");
  });

  it("menolak PIN bukan angka / panjang salah dan konfirmasi berbeda", () => {
    const issues = (input: object) =>
      pengawasCreateSchema.safeParse({ ...valid, ...input }).error?.issues.map((i) => i.path[0]);
    expect(issues({ pin: "12ab56", pinConfirm: "12ab56" })).toContain("pin");
    expect(issues({ pin: "123", pinConfirm: "123" })).toContain("pin");
    expect(issues({ pinConfirm: "000000" })).toEqual(["pinConfirm"]);
    expect(issues({ kodePengawas: "SP 01" })).toContain("kodePengawas");
  });
});

describe("pengawasLoginSchema", () => {
  it("menormalkan kode agar login tidak sensitif huruf besar/kecil", () => {
    expect(pengawasLoginSchema.parse({ kodePengawas: "spv001 ", pin: "1" }).kodePengawas).toBe("SPV001");
  });
});

describe("permissions", () => {
  it("hanya Owner yang boleh mengelola Pengawas", () => {
    expect(can("SUPER_ADMIN", "pengawas:manage")).toBe(true);
    expect(can("PENGAWAS", "pengawas:manage")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import { canChangeStatus, canEditPlanning, canViewPlanning } from "./access";
import { planningSchema } from "./schema";
import { allowedTransitions, timestampsFor } from "./status";

describe("transisi status (ADR-017)", () => {
  it("Pengawas hanya maju satu langkah", () => {
    expect(allowedTransitions("PENGAWAS", "DIRENCANAKAN")).toEqual(["BERJALAN"]);
    expect(allowedTransitions("PENGAWAS", "BERJALAN")).toEqual(["SELESAI"]);
    expect(allowedTransitions("PENGAWAS", "SELESAI")).toEqual([]);
    expect(allowedTransitions("PENGAWAS", "DIBATALKAN")).toEqual([]);
  });
  it("Owner boleh ke status mana pun selain status sekarang", () => {
    expect(allowedTransitions("SUPER_ADMIN", "BERJALAN")).toEqual(["DIRENCANAKAN", "SELESAI", "DIBATALKAN"]);
  });
  it("waktu mulai/selesai aktual diisi otomatis", () => {
    const now = new Date("2026-10-05T03:00:00Z");
    expect(timestampsFor("BERJALAN", { startedAt: null }, now)).toEqual({ startedAt: now, completedAt: null });
    const started = new Date("2026-10-04T03:00:00Z");
    expect(timestampsFor("SELESAI", { startedAt: started }, now)).toEqual({ startedAt: started, completedAt: now });
    expect(timestampsFor("DIRENCANAKAN", { startedAt: started }, now)).toEqual({ startedAt: null, completedAt: null });
  });
});

describe("akses planning", () => {
  const job = { supervisorId: "p1", status: "DIRENCANAKAN" as const, deletedAt: null };
  const owner = { id: "o1", role: "SUPER_ADMIN" as const };
  it("Owner melihat, mengubah, dan membatalkan", () => {
    expect(canViewPlanning(owner, job)).toBe(true);
    expect(canEditPlanning(owner, job)).toBe(true);
    expect(canChangeStatus(owner, job, "DIBATALKAN")).toBe(true);
  });
  it("Pengawas yang ditugaskan hanya memulai; Pengawas lain tidak apa-apa", () => {
    expect(canChangeStatus({ id: "p1", role: "PENGAWAS" }, job, "BERJALAN")).toBe(true);
    expect(canChangeStatus({ id: "p1", role: "PENGAWAS" }, job, "DIBATALKAN")).toBe(false);
    expect(canEditPlanning({ id: "p1", role: "PENGAWAS" }, job)).toBe(false);
    expect(canViewPlanning({ id: "p2", role: "PENGAWAS" }, job)).toBe(false);
    expect(canChangeStatus({ id: "p2", role: "PENGAWAS" }, job, "BERJALAN")).toBe(false);
  });
});

describe("planningSchema", () => {
  const valid = {
    id: "8c7a3f0e-5b1d-4c2a-9e8f-1a2b3c4d5e6f",
    supervisorId: "9c7a3f0e-5b1d-4c2a-9e8f-1a2b3c4d5e6f",
    unitId: "0a1f6c2e-1d1e-4a51-9a10-000000000001",
    namaPekerjaan: "Perataan jalan hauling",
    lokasi: "Pit Utara",
    deskripsi: "Grading 2 km",
    estimasiMulai: "2026-10-06",
    estimasiSelesai: "2026-10-08",
  };
  it("estimasi selesai tidak boleh sebelum mulai", () => {
    expect(planningSchema.safeParse(valid).success).toBe(true);
    const r = planningSchema.safeParse({ ...valid, estimasiSelesai: "2026-10-05" });
    expect(r.error?.issues.map((i) => i.path[0])).toEqual(["estimasiSelesai"]);
  });
  it("Pengawas & unit wajib dipilih", () => {
    const r = planningSchema.safeParse({ ...valid, supervisorId: "", unitId: "" });
    expect(r.error?.issues.map((i) => i.message)).toEqual(["Pilih Pengawas", "Pilih unit"]);
  });
});

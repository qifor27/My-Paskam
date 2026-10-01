import { afterEach, describe, expect, it, vi } from "vitest";

import { AppError, createErrorId, toPublicError } from ".";

describe("createErrorId", () => {
  it("berformat ERR-XXXXXX", () => {
    expect(createErrorId()).toMatch(/^ERR-[0-9A-F]{6}$/);
  });
});

describe("toPublicError", () => {
  afterEach(() => vi.restoreAllMocks());

  it("tidak membocorkan detail error tak terduga ke user", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = toPublicError(new Error("connect ECONNREFUSED 10.0.0.1:5432"));

    expect(result.category).toBe("UNEXPECTED");
    expect(result.message).not.toContain("ECONNREFUSED");
    expect(result.message).toContain("tidak akan dihapus");
    expect(result.retryable).toBe(true);
    expect(JSON.stringify(result)).not.toContain("stack");
    // Detail teknis tetap tercatat di log dengan error ID yang sama.
    expect(spy.mock.calls[0]?.[0]).toContain(result.errorId);
    expect(spy.mock.calls[0]?.[0]).toContain("ECONNREFUSED");
  });

  it("meneruskan field error untuk inline validation", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = toPublicError(
      new AppError("VALIDATION", { fieldErrors: { lokasi: "Lokasi wajib diisi" } }),
    );
    expect(result.fieldErrors).toEqual({ lokasi: "Lokasi wajib diisi" });
    expect(result.retryable).toBe(false);
  });

  it("memakai pesan khusus bila diberikan", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = toPublicError(
      new AppError("AUTHENTICATION", { userMessage: "Kode Pengawas atau PIN tidak sesuai." }),
    );
    expect(result.message).toBe("Kode Pengawas atau PIN tidak sesuai.");
  });
});

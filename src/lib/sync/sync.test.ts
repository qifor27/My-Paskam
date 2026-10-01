import { describe, expect, it } from "vitest";

import { canTransition, createClientId, isClientId, transition } from ".";

describe("client id", () => {
  it("membuat UUID v4 yang valid dan unik", () => {
    const a = createClientId();
    const b = createClientId();
    expect(isClientId(a)).toBe(true);
    expect(a).not.toBe(b);
  });

  it("menolak nilai yang bukan UUID", () => {
    expect(isClientId("123")).toBe(false);
    expect(isClientId(undefined)).toBe(false);
  });
});

describe("sync status", () => {
  it("mengikuti alur DRAFT -> PENDING_SYNC -> SYNCING -> SYNCED", () => {
    let s = transition("DRAFT", "PENDING_SYNC");
    s = transition(s, "SYNCING");
    s = transition(s, "SYNCED");
    expect(s).toBe("SYNCED");
  });

  it("gagal sync bisa di-retry lewat antrean", () => {
    expect(canTransition("SYNCING", "SYNC_FAILED")).toBe(true);
    expect(canTransition("SYNC_FAILED", "PENDING_SYNC")).toBe(true);
  });

  it("menolak transisi yang tidak valid", () => {
    expect(() => transition("SYNCED", "SYNCING")).toThrow();
    expect(canTransition("DRAFT", "SYNCED")).toBe(false);
  });
});

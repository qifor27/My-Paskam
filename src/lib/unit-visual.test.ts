import { describe, expect, it } from "vitest";

import { unitKind } from "./unit-visual";

describe("unitKind", () => {
  it("memetakan nama unit ke jenis ikon", () => {
    expect(unitKind("PASKAM 1")).toBe("excavator");
    expect(unitKind("DUMP")).toBe("dump");
    expect(unitKind("Dump Truck 2")).toBe("dump");
    expect(unitKind("TOWING")).toBe("towing");
    expect(unitKind("GENSET")).toBe("other");
  });
});

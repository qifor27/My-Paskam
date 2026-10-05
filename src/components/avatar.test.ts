import { describe, expect, it } from "vitest";

import { initials } from "./avatar";

describe("initials", () => {
  it("mengambil huruf pertama nama depan dan belakang", () => {
    expect(initials("Budi Santoso")).toBe("BS");
    expect(initials("Andi Wijaya Kusuma")).toBe("AK");
    expect(initials(" citra ")).toBe("C");
    expect(initials("")).toBe("?");
  });
});

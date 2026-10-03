import { describe, expect, it } from "vitest";

import { hashSecret, verifySecret } from "./password";

describe("hashSecret / verifySecret", () => {
  it("memverifikasi secret yang benar dan menolak yang salah", async () => {
    const hash = await hashSecret("123456");
    expect(hash).toMatch(/^scrypt\$32768\$8\$3\$/);
    expect(hash).not.toContain("123456");
    expect(await verifySecret("123456", hash)).toBe(true);
    expect(await verifySecret("654321", hash)).toBe(false);
  });

  it("memakai salt acak sehingga hash selalu berbeda", async () => {
    expect(await hashSecret("sama")).not.toBe(await hashSecret("sama"));
  });

  it("menolak format hash yang rusak tanpa melempar error", async () => {
    expect(await verifySecret("x", "bukan-hash")).toBe(false);
    expect(await verifySecret("x", "bcrypt$1$2$3$a$b")).toBe(false);
  });
});

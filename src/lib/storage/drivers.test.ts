import { describe, expect, it, vi } from "vitest";

import { driverFromEnv, supabaseDriver } from "./drivers";

const KEY = "photos/laporan-kerja/8c7a3f0e-5b1d-4c2a-9e8f-1a2b3c4d5e6f/2f1c1d3e-0b4a-4c8e-9a6b-1d2e3f4a5b6c.jpg";

function mockFetch(responses: Response[]) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return responses.shift() ?? new Response("", { status: 500 });
  });
  return { fn: fn as unknown as typeof fetch, calls };
}

describe("supabaseDriver", () => {
  it("upload ke bucket privat dengan upsert dan kunci di header", async () => {
    const m = mockFetch([new Response("{}", { status: 200 })]);
    const d = supabaseDriver({ url: "https://abc.supabase.co/", key: "sb_secret_x", bucket: "paskam", fetchImpl: m.fn });
    await d.put(KEY, Buffer.from([0xff, 0xd8, 0xff]), "image/jpeg");
    expect(m.calls[0]!.url).toBe(`https://abc.supabase.co/storage/v1/object/paskam/${KEY}`);
    const h = m.calls[0]!.init!.headers as Record<string, string>;
    expect(h.apikey).toBe("sb_secret_x");
    expect(h["x-upsert"]).toBe("true");
    expect(h.Authorization).toBeUndefined(); // kunci baru cukup di apikey
  });

  it("kunci JWT lama juga dikirim sebagai Bearer", async () => {
    const m = mockFetch([new Response(new Uint8Array([1, 2, 3]), { status: 200 })]);
    const d = supabaseDriver({ url: "https://abc.supabase.co", key: "eyJhbGciOi.x.y", bucket: "paskam", fetchImpl: m.fn });
    const data = await d.get(KEY);
    expect([...data!]).toEqual([1, 2, 3]);
    expect(m.calls[0]!.url).toContain("/storage/v1/object/authenticated/paskam/");
    expect((m.calls[0]!.init!.headers as Record<string, string>).Authorization).toBe("Bearer eyJhbGciOi.x.y");
  });

  it("objek tidak ada → null; error lain → throw", async () => {
    const m = mockFetch([
      new Response('{"statusCode":"404","error":"not_found","message":"Object not found"}', { status: 400 }),
      new Response("boom", { status: 500 }),
    ]);
    const d = supabaseDriver({ url: "https://abc.supabase.co", key: "k", bucket: "paskam", fetchImpl: m.fn });
    expect(await d.get(KEY)).toBeNull();
    await expect(d.get(KEY)).rejects.toThrow("500");
  });

  it("hapus banyak objek per batch", async () => {
    const m = mockFetch([new Response("[]", { status: 200 })]);
    const d = supabaseDriver({ url: "https://abc.supabase.co", key: "k", bucket: "paskam", fetchImpl: m.fn });
    await d.deleteMany([KEY]);
    expect(m.calls[0]!.init!.method).toBe("DELETE");
    expect(JSON.parse(String(m.calls[0]!.init!.body))).toEqual({ prefixes: [KEY] });
  });

  it("menolak key berbahaya (path traversal)", async () => {
    const d = supabaseDriver({ url: "https://abc.supabase.co", key: "k", bucket: "paskam", fetchImpl: mockFetch([]).fn });
    await expect(d.put("../etc/passwd.jpg", Buffer.from([]), "image/jpeg")).rejects.toThrow("tidak valid");
  });
});

describe("driverFromEnv", () => {
  it("supabase tanpa kredensial → error jelas", () => {
    expect(() => driverFromEnv({ STORAGE_DRIVER: "supabase" } as unknown as NodeJS.ProcessEnv, "/tmp")).toThrow("SUPABASE_URL");
  });
});

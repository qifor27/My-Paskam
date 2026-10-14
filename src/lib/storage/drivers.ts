import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

// Implementasi driver storage tanpa "server-only" agar bisa dipakai juga oleh
// script CLI (data demo). Aplikasi memakai `storage()` dari ./index (server-only).
export interface StorageDriver {
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
  deleteMany(keys: string[]): Promise<void>;
}

export function assertSafeKey(key: string) {
  // Key dibuat server dari UUID; tetap dicek agar tidak bisa keluar dari folder/bucket.
  if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*\.(jpg|webp)$/.test(key)) throw new Error(`Storage key tidak valid: ${key}`);
}

export function localDriver(root: string): StorageDriver {
  const resolve = (key: string) => {
    assertSafeKey(key);
    return path.join(root, key);
  };
  const driver: StorageDriver = {
    async put(key, data) {
      const file = resolve(key);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, data);
    },
    async get(key) {
      try {
        return await readFile(resolve(key));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw error;
      }
    },
    async delete(key) {
      await rm(resolve(key), { force: true });
    },
    async deleteMany(keys) {
      for (const key of keys) await driver.delete(key);
    },
  };
  return driver;
}

/**
 * Supabase Storage lewat REST API (tanpa SDK). Bucket harus PRIVAT; kunci
 * service/secret hanya di server (ADR-024). Akses user tetap lewat /api/foto/:id.
 */
export function supabaseDriver(opts: { url: string; key: string; bucket: string; fetchImpl?: typeof fetch }): StorageDriver {
  const base = `${opts.url.replace(/\/+$/, "")}/storage/v1`;
  const doFetch = opts.fetchImpl ?? fetch;
  const objectPath = (key: string) => {
    assertSafeKey(key);
    return key.split("/").map(encodeURIComponent).join("/");
  };
  const headers = (extra: Record<string, string> = {}) => ({
    apikey: opts.key,
    // Kunci lama (JWT service_role) juga dikirim sebagai Bearer; kunci baru (sb_secret_…) cukup di apikey.
    ...(opts.key.startsWith("eyJ") ? { Authorization: `Bearer ${opts.key}` } : {}),
    ...extra,
  });
  const fail = async (action: string, res: Response) => {
    const body = await res.text().catch(() => "");
    throw new Error(`Supabase Storage ${action} gagal (${res.status}): ${body.slice(0, 200)}`);
  };

  return {
    async put(key, data, contentType) {
      const res = await doFetch(`${base}/object/${opts.bucket}/${objectPath(key)}`, {
        method: "POST",
        headers: headers({ "Content-Type": contentType, "x-upsert": "true", "Cache-Control": "max-age=31536000" }),
        body: new Uint8Array(data),
      });
      if (!res.ok) await fail("upload", res);
    },
    async get(key) {
      const res = await doFetch(`${base}/object/authenticated/${opts.bucket}/${objectPath(key)}`, { headers: headers() });
      if (res.ok) return Buffer.from(await res.arrayBuffer());
      // Supabase mengembalikan 400/404 dengan pesan "not found" untuk objek yang tidak ada.
      const body = await res.text().catch(() => "");
      if (res.status === 404 || /not.?found/i.test(body)) return null;
      throw new Error(`Supabase Storage download gagal (${res.status}): ${body.slice(0, 200)}`);
    },
    async delete(key) {
      await this.deleteMany([key]);
    },
    async deleteMany(keys) {
      for (let i = 0; i < keys.length; i += 500) {
        const batch = keys.slice(i, i + 500);
        batch.forEach(assertSafeKey);
        const res = await doFetch(`${base}/object/${opts.bucket}`, {
          method: "DELETE",
          headers: headers({ "Content-Type": "application/json" }),
          body: JSON.stringify({ prefixes: batch }),
        });
        if (!res.ok) await fail("hapus", res);
      }
    },
  };
}

/** Pilih driver dari environment: STORAGE_DRIVER = local (default) | supabase. */
export function driverFromEnv(env: NodeJS.ProcessEnv, localRoot: string): StorageDriver {
  const kind = env.STORAGE_DRIVER ?? "local";
  if (kind === "local") return localDriver(localRoot);
  if (kind === "supabase") {
    const url = env.SUPABASE_URL;
    const key = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("STORAGE_DRIVER=supabase butuh SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY");
    return supabaseDriver({ url, key, bucket: env.SUPABASE_STORAGE_BUCKET ?? "paskam" });
  }
  throw new Error(`STORAGE_DRIVER "${kind}" belum didukung`);
}

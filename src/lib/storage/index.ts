import "server-only";

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

// Abstraksi storage foto (PRD §39.13: bisa pindah tier tanpa ubah aplikasi).
// Driver "local" untuk development; driver Supabase ditambahkan saat
// kredensial tersedia (Q23). Pilih lewat env STORAGE_DRIVER.
export interface StorageDriver {
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
}

function assertSafeKey(key: string) {
  // Key dibuat server dari UUID; tetap dicek agar tidak bisa keluar dari folder.
  if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*\.(jpg|webp)$/.test(key)) throw new Error(`Storage key tidak valid: ${key}`);
}

function localDriver(root: string): StorageDriver {
  const resolve = (key: string) => {
    assertSafeKey(key);
    return path.join(root, key);
  };
  return {
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
  };
}

let driver: StorageDriver | undefined;

export function storage(): StorageDriver {
  if (driver) return driver;
  const kind = process.env.STORAGE_DRIVER ?? "local";
  if (kind === "local") {
    // turbopackIgnore: folder upload tidak boleh ikut ter-trace ke output server.
    driver = localDriver(path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.STORAGE_DIR ?? "storage"));
    return driver;
  }
  throw new Error(`STORAGE_DRIVER "${kind}" belum didukung`);
}

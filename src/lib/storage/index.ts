import "server-only";

import path from "node:path";

import { driverFromEnv, type StorageDriver } from "./drivers";

export type { StorageDriver } from "./drivers";

// Abstraksi storage foto (PRD §39.13). Development: folder lokal `storage/`;
// produksi (Vercel): Supabase Storage bucket privat (ADR-024).
let driver: StorageDriver | undefined;

export function storage(): StorageDriver {
  // turbopackIgnore: folder upload tidak boleh ikut ter-trace ke output server.
  driver ??= driverFromEnv(process.env, path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.STORAGE_DIR ?? "storage"));
  return driver;
}

import { defineConfig, env } from "prisma/config";

// Prisma 7 tidak membaca .env otomatis; .env opsional (CI memakai env var).
try {
  process.loadEnvFile();
} catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Migrasi butuh koneksi langsung/sesi (Supabase: port 5432); aplikasi di Vercel
  // memakai pooler transaksi (port 6543) lewat DATABASE_URL (ADR-024).
  datasource: { url: process.env.DIRECT_URL ? env("DIRECT_URL") : env("DATABASE_URL") },
});

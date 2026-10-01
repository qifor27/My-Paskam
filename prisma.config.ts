import { defineConfig, env } from "prisma/config";

// Prisma 7 tidak membaca .env otomatis; .env opsional (CI memakai env var).
try {
  process.loadEnvFile();
} catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});

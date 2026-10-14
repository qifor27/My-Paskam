import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

// Satu instance per proses; di dev, hot reload tidak boleh membuat koneksi baru terus.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // Serverless (Vercel): tiap instance cukup beberapa koneksi; pooler Supabase yang membagi (ADR-024).
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: Number(process.env.DATABASE_POOL_MAX ?? 5) });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

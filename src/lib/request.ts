import "server-only";

import { headers } from "next/headers";

// Catatan: x-forwarded-for hanya bisa dipercaya jika aplikasi berada di
// belakang proxy yang menimpanya (Vercel/Nginx). Tinjau ulang saat Q23 dijawab.
export async function getRequestMeta() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return {
    ip: forwarded || h.get("x-real-ip") || null,
    userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
  };
}

import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { findViewablePhoto } from "@/lib/photo/service";
import { storage } from "@/lib/storage";

// Akses foto hanya lewat server setelah cek otorisasi (PRD §39.12); tidak ada URL publik.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401 });
  if (!z.uuid().safeParse(id).success) return new Response(null, { status: 404 });

  const photo = await findViewablePhoto(user, id);
  // 404 (bukan 403) agar keberadaan foto milik orang lain tidak terungkap.
  if (!photo) return new Response(null, { status: 404 });
  const data = await storage().get(photo.storagePath);
  if (!data) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": photo.mimeType,
      "Content-Length": String(data.length),
      "Cache-Control": "private, max-age=86400, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

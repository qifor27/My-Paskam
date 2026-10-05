import { NextResponse } from "next/server";
import { z } from "zod";

import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { photoModule } from "@/lib/photo/modules";
import { PHOTO_RULES } from "@/lib/photo/rules";
import { savePhotoUpload } from "@/lib/photo/service";
import { assertSameOrigin, handleRoute } from "@/lib/route";

const fields = z.object({
  id: z.uuid(),
  module: z.enum(["LAPORAN_KERJA", "ORDER_SPARE_PART"]).default("LAPORAN_KERJA"),
  recordId: z.uuid(),
  width: z.coerce.number().int().min(1).max(10_000),
  height: z.coerce.number().int().min(1).max(10_000),
});

// Upload satu foto (PRD §18): client sudah mengompres; server tetap memvalidasi.
export async function POST(request: Request) {
  return handleRoute("foto.upload", async () => {
    try {
      assertSameOrigin(request);
    } catch {
      throw new AppError("AUTHORIZATION", { detail: "cross-origin upload" });
    }
    const user = await getCurrentUser();
    if (!user) throw new AppError("SESSION_EXPIRED");

    const length = Number(request.headers.get("content-length") ?? 0);
    if (length > PHOTO_RULES.maxBytes + 64 * 1024) {
      throw new AppError("UPLOAD", { userMessage: "Ukuran foto terlalu besar. Ambil ulang foto lalu coba lagi." });
    }

    const form = await request.formData();
    const parsed = fields.safeParse(Object.fromEntries(form));
    const file = form.get("file");
    if (!parsed.success || !(file instanceof File)) {
      throw new AppError("UPLOAD", { userMessage: "Data foto tidak lengkap. Coba lagi.", detail: "bad upload fields" });
    }

    // Izin upload mengikuti modul (Laporan Kerja / Spare Part).
    if (!can(user.role, photoModule(parsed.data.module).createPermission)) throw new AppError("AUTHORIZATION");
    const result = await savePhotoUpload(user, { ...parsed.data, file });
    return NextResponse.json({ ok: true, data: { id: result.id } }, { status: result.duplicate ? 200 : 201 });
  });
}

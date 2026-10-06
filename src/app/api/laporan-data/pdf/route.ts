import { audit } from "@/lib/audit";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
import { todayISO } from "@/lib/format";
import { buildLaporanDataPdf } from "@/lib/laporan-data/export";
import { parseFilters } from "@/lib/laporan-data/filters";
import { dataPinState } from "@/lib/laporan-data/pin";
import { logger } from "@/lib/logger";
import { createErrorId } from "@/lib/errors";

function plain(status: number, message: string) {
  return new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

// Export PDF Laporan Data (PRD §17, ADR-020). Aturan akses sama dengan halaman:
// Owner + PIN Laporan Data sedang terbuka untuk sesi ini.
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return plain(401, "Sesi Anda telah berakhir. Silakan login kembali.");
  if (!can(user.role, "laporan-data:access")) return plain(403, "Anda tidak memiliki akses untuk membuka halaman ini.");
  if ((await dataPinState(user)).state !== "unlocked") {
    return plain(403, "Laporan Data terkunci. Buka dengan PIN Laporan Data terlebih dahulu.");
  }

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const f = parseFilters(params, todayISO());
  try {
    const { bytes, filename, count } = await buildLaporanDataPdf(user, f);
    await audit({
      action: "DATA_EXPORTED",
      result: "SUCCESS",
      userId: user.id,
      detail: { modul: f.modul, dari: f.dari, sampai: f.sampai, unit: f.unit, pengawas: f.pengawas, status: f.status, prioritas: f.prioritas, count },
    });
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const errorId = createErrorId();
    logger.error("pdf_export_failed", { errorId, cause: error instanceof Error ? error.message : String(error) });
    return plain(500, `PDF gagal dibuat. Coba lagi. Kode laporan: ${errorId}`);
  }
}

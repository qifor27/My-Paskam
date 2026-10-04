// Format tanggal/waktu untuk tampilan. Zona waktu harus eksplisit: tanpa itu
// Intl memakai zona server (di hosting umumnya UTC) dan jam akan meleset.
// SEMENTARA (Q22): Asia/Jakarta (WIB). Bisa diubah lewat env APP_TIME_ZONE.
export const APP_TIME_ZONE = process.env.APP_TIME_ZONE ?? "Asia/Jakarta";

const dateTime = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: APP_TIME_ZONE,
});

export function formatDateTime(date: Date): string {
  return dateTime.format(date);
}

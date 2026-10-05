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

const hourFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: APP_TIME_ZONE });

/** Sapaan sesuai jam di zona waktu aplikasi. */
export function greeting(now: Date = new Date()): string {
  const hour = Number(hourFormat.format(now));
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

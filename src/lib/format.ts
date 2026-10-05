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

const timeOnly = new Intl.DateTimeFormat("id-ID", { timeStyle: "short", timeZone: APP_TIME_ZONE });

/** "14.05" di zona waktu aplikasi. */
export function formatTime(date: Date): string {
  return timeOnly.format(date);
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

const isoDate = new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });

/** Tanggal hari ini di zona waktu aplikasi, format YYYY-MM-DD. */
export function todayISO(now: Date = new Date()): string {
  return isoDate.format(now);
}

/** Geser tanggal YYYY-MM-DD sebanyak n hari. */
export function shiftISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Kolom DATE dari DB (UTC tengah malam) → YYYY-MM-DD tanpa pergeseran zona. */
export function dateToISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const dateOnly = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "UTC" });
const dateLong = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** "5 Okt 2026" dari YYYY-MM-DD. */
export function formatISODate(iso: string, style: "medium" | "long" = "medium"): string {
  return (style === "long" ? dateLong : dateOnly).format(new Date(`${iso}T00:00:00Z`));
}

/** Label grup daftar: "Hari ini", "Kemarin", atau tanggal panjang. */
export function dayLabel(iso: string, now: Date = new Date()): string {
  const today = todayISO(now);
  if (iso === today) return "Hari ini";
  if (iso === shiftISO(today, -1)) return "Kemarin";
  return formatISODate(iso, "long");
}

/** Angka desimal gaya Indonesia: 7.5 → "7,5". */
export function formatDecimal(value: number, digits = 1): string {
  return value.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: digits });
}

const offsetParts = new Intl.DateTimeFormat("en-US", {
  timeZone: APP_TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** Selisih zona aplikasi terhadap UTC (ms) pada instan tertentu. */
function zoneOffsetMs(instant: Date): number {
  const p = Object.fromEntries(offsetParts.formatToParts(instant).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** Instan UTC untuk pukul 00.00 tanggal YYYY-MM-DD di zona aplikasi. */
export function zonedDayStart(iso: string): Date {
  const guess = new Date(`${iso}T00:00:00Z`);
  return new Date(guess.getTime() - zoneOffsetMs(guess));
}

/** Tanggal 1 bulan berjalan (zona aplikasi). */
export function monthStartISO(today: string): string {
  return `${today.slice(0, 8)}01`;
}

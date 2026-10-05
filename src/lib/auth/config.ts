// Parameter autentikasi. Nilai bertanda SEMENTARA menunggu jawaban Owner
// (docs/prd-analysis.md) dan tercatat di ADR-007. Ubah di sini saja.
export const AUTH_CONFIG = {
  /** SEMENTARA (Q17): PIN Pengawas berupa angka dengan panjang tetap. */
  pinLength: 6,
  passwordMinLength: 10,
  rateLimit: {
    windowMinutes: 15,
    /** SEMENTARA (Q17): gagal per kode/email sebelum dikunci. */
    maxFailuresPerIdentifier: 5,
    maxFailuresPerIp: 30,
    /** SEMENTARA (Q17): lama penguncian. */
    lockMinutes: 15,
  },
  /** SEMENTARA (ADR-018): lama Laporan Data terbuka setelah PIN benar. */
  dataPinUnlockMinutes: 15,
  /** SEMENTARA (Q18): durasi sesi per role, dalam jam. */
  sessionHours: {
    SUPER_ADMIN: 12,
    PENGAWAS: 24 * 7,
  },
} as const;

export const SESSION_COOKIE = "paskam_session";

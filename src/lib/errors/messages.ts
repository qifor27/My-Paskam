import type { ErrorCategory } from "./app-error";

export type ErrorPresentation = {
  /** Apa yang terjadi + apakah data aman (PRD §20). */
  message: string;
  /** Apakah aksi COBA LAGI masuk akal. */
  retryable: boolean;
};

// Pesan actionable dalam Bahasa Indonesia. Pesan autentikasi sengaja generik
// untuk mencegah credential enumeration (PRD §21).
export const DEFAULT_ERROR_MESSAGES: Record<ErrorCategory, ErrorPresentation> = {
  VALIDATION: {
    message: "Periksa kembali isian yang ditandai.",
    retryable: false,
  },
  AUTHENTICATION: {
    message: "Data login tidak sesuai.",
    retryable: false,
  },
  AUTHORIZATION: {
    message: "Anda tidak memiliki akses untuk membuka halaman ini.",
    retryable: false,
  },
  NETWORK: {
    message:
      "Koneksi internet sedang tidak tersedia. Data Anda tetap tersimpan di perangkat dan akan dikirim saat koneksi kembali.",
    retryable: true,
  },
  SERVER: {
    message: "Server sedang mengalami gangguan. Data Anda belum dikirim.",
    retryable: true,
  },
  UPLOAD: {
    message: "Foto gagal diunggah. Periksa koneksi lalu coba lagi.",
    retryable: true,
  },
  STORAGE_FULL: {
    message: "Upload foto gagal karena penyimpanan hampir penuh. Data laporan Anda tetap aman.",
    retryable: true,
  },
  SESSION_EXPIRED: {
    message: "Sesi Anda telah berakhir. Silakan login kembali.",
    retryable: false,
  },
  UNEXPECTED: {
    message:
      "Terjadi masalah saat memproses permintaan. Data yang belum tersimpan tidak akan dihapus.",
    retryable: true,
  },
};

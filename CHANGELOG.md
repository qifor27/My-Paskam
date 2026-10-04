# Changelog

Semua perubahan penting pada My PASKAM dicatat di sini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/), versi mengikuti [SemVer](https://semver.org/lang/id/).

Setiap entri menyebut sprint dan story/ADR terkait, contoh: `- Login Pengawas dengan Kode + PIN (Sprint 1, US-1.2)`.

## [Unreleased]

### Added
- Dashboard Owner dan Pengawas dengan shortcut modul sesuai role (Sprint 2, US-2.1, US-2.2).
- Navigasi bawah di HP dan sidebar di desktop; menu mengikuti izin role (Sprint 2, US-2.3).
- Halaman loading, halaman error dengan kode laporan dan COBA LAGI, halaman 404, dan banner saat offline (Sprint 2, US-2.4).
- Halaman sementara untuk modul Laporan Kerja, Order Spare Part, Planning Job, dan Laporan Data (Sprint 2).
- Halaman `/login` dengan pilihan PENGAWAS/OWNER: login Pengawas (Kode + PIN) dan Owner (email/username + password) (Sprint 1, US-1.1–1.3).
- Sesi login aman + pesan "Sesi Anda telah berakhir" + tombol keluar (Sprint 1, US-1.4).
- Manajemen Pengawas untuk Owner: daftar, tambah, ubah, reset PIN, aktif/nonaktif (Sprint 1, US-1.5).
- Permission server-side `pengawas:manage` (Sprint 1, US-1.6).
- Perintah `npm run owner:create` untuk membuat akun Owner pertama (Sprint 1).
- Komponen Input, Field, Alert, ErrorAlert, PageHeader, AccessDenied (Sprint 1).
- Analisis PRD: gap, open questions, risiko, dan usulan roadmap (`docs/prd-analysis.md`).
- Kerangka dokumentasi: `CLAUDE.md`, `docs/` (architecture, database, design-system, security), `docs/agile/` (backlog, sprint, decisions), template dokumentasi fitur.
- Proyek Next.js 16 + TypeScript + Tailwind 4 + ESLint + Vitest, dengan perintah `npm run check` (Sprint 0, US-0.1).
- Design token biru/oranye (WCAG AA) dan komponen `Button` dengan state loading/disabled/focus/pressed (Sprint 0, US-0.2).
- Prisma 7: skema `user`, `session`, `audit_log`, `setting` + migrasi awal (Sprint 0, US-0.3).
- Workflow CI GitHub Actions (Sprint 0, US-0.5).
- Fondasi error handling: kategori error, error ID `ERR-XXXXXX`, pesan user berbahasa Indonesia (Sprint 0, US-0.6, ADR-006).
- Fondasi offline: client UUID dan status sinkronisasi (Sprint 0, US-0.7, ADR-004).

### Changed
- `prd.md` dipindah ke `docs/PRD.md` (US-0.8).

### Fixed
- Waktu "terakhir masuk" kini selalu ditampilkan dalam zona waktu aplikasi, bukan zona waktu server (Sprint 2).
- Error saat database tidak terjangkau kini tampil dengan desain aplikasi, bukan halaman darurat polos (Sprint 2).
- Pesan validasi bawaan Zod kini berbahasa Indonesia; field yang tidak terkirim menampilkan "Wajib diisi" (Sprint 1).

### Security
- Password & PIN di-hash scrypt; token sesi disimpan sebagai SHA-256 (Sprint 1, ADR-008).
- Penguncian login setelah percobaan gagal berulang, termasuk untuk kode/email yang tidak terdaftar (Sprint 1, US-1.7, ADR-009).
- Audit log untuk login, logout, dan semua perubahan akun Pengawas (Sprint 1, US-1.8).
- Nonaktifkan akun / reset PIN langsung mencabut semua sesi Pengawas tersebut (Sprint 1).
- Logger menyensor otomatis password, PIN, token, session, dan cookie (US-0.6).

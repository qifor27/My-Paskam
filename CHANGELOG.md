# Changelog

Semua perubahan penting pada My PASKAM dicatat di sini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/), versi mengikuti [SemVer](https://semver.org/lang/id/).

Setiap entri menyebut sprint dan story/ADR terkait, contoh: `- Login Pengawas dengan Kode + PIN (Sprint 1, US-1.2)`.

## [Unreleased]

### Added
- Aplikasi bisa dipasang di layar utama HP (ikon PASKAM, mode layar penuh) dengan petunjuk di halaman Akun (Sprint 7).
- Mode offline: form Laporan Kerja & Spare Part tetap bisa dibuka dan disimpan tanpa sinyal; data dan foto terkirim otomatis saat koneksi kembali, tanpa duplikat (Sprint 7, ADR-019).
- Banner jumlah data yang menunggu dikirim + tombol "Kirim sekarang", serta status per item (Draft di HP / Menunggu dikirim / Gagal dikirim) (Sprint 7).
- Halaman "Tidak ada koneksi" saat halaman belum tersimpan di HP (Sprint 7).
- Laporan Data (khusus Owner): Laporan Kerja, Spare Part, dan Planning dalam satu halaman dengan filter tanggal, unit, Pengawas, status/prioritas; ringkasan total HM, BBM, jumlah spare part, dan status planning (Sprint 6, ADR-018).
- Planning Job: Owner membuat rencana pekerjaan untuk Pengawas (unit, lokasi, estimasi mulai–selesai) dengan status Direncanakan → Berjalan → Selesai / Dibatalkan; Pengawas menekan "Mulai pekerjaan" dan "Tandai selesai" (Sprint 5, ADR-017).
- Beranda Pengawas menampilkan "Planning untuk Anda" (Sprint 5).
- Order Spare Part: jumlah (tombol −/+), prioritas (Rendah/Sedang/Tinggi), dan nomor part opsional (ADR-017).
- Order Spare Part: dokumentasi spare part yang rusak (unit, nama spare part, deskripsi kerusakan, lokasi, foto) tanpa status order; Owner melihat semua catatan (Sprint 4, ADR-016).
- Laporan Kerja: buat, lihat, ubah, hapus; tanggal, unit, operator, HM (total jam), BBM (Solar) 1–6, lokasi, deskripsi, dan foto wajib (Sprint 3, ADR-014).
- Foto dari Kamera atau Galeri: dikompres di HP, diunggah per foto dengan progress, bisa dicoba lagi, dan dicoba ulang otomatis saat online (Sprint 3).
- Laporan yang belum terkirim tersimpan otomatis di HP dan tampil di bagian "Belum terkirim" (Sprint 3).
- Nama Pengawas tercatat otomatis dari akun yang login; Owner melihat semua laporan, Pengawas hanya miliknya (Sprint 3).
- Halaman Unit untuk Owner: tambah, ubah nama, aktif/nonaktif (Sprint 3).
- Beranda menampilkan 3 laporan terbaru (Sprint 3).
- Tampilan baru "Soft Operational": tombol pill biru, kartu membulat, ikon pastel per modul, font Inter (ADR-013).
- Beranda baru: sapaan sesuai jam, kartu utama, grid menu, aktivitas terbaru.
- Tombol "+" oranye di navigasi bawah dan "Buat baru" di sidebar untuk membuat laporan/order/planning/akun Pengawas.
- Halaman Akun: profil, menu Pengawas (Owner), dan tombol Keluar.
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
- BBM (Solar) di Laporan Kerja kini diisi sebagai jumlah (angka), bukan pilihan 1–6 (ADR-016).
- Tombol utama kini biru (oranye menjadi aksen); label tombol memakai huruf biasa ("Simpan", "Coba lagi") (ADR-013).
- Header biru di HP diganti tampilan terang; tombol Keluar pindah ke halaman Akun.
- Teks status, pesan error, dan placeholder lebih kontras untuk dibaca di bawah matahari; warna peringatan kini kuning (ADR-012).
- Hasil riset UI dipindah ke `docs/research/`.
- `prd.md` dipindah ke `docs/PRD.md` (US-0.8).

### Fixed
- Laporan/catatan yang baru tersimpan tidak lagi muncul kembali di "Belum terkirim" bila tombol Simpan ditekan tepat setelah foto selesai diunggah (Sprint 4).
- Waktu "terakhir masuk" kini selalu ditampilkan dalam zona waktu aplikasi, bukan zona waktu server (Sprint 2).
- Error saat database tidak terjangkau kini tampil dengan desain aplikasi, bukan halaman darurat polos (Sprint 2).
- Pesan validasi bawaan Zod kini berbahasa Indonesia; field yang tidak terkirim menampilkan "Wajib diisi" (Sprint 1).

### Security
- Data yang belum terkirim hanya tampil dan dikirim untuk akun pembuatnya; halaman tersimpan dihapus saat keluar (perangkat dipakai bergantian) (Sprint 7).
- Laporan Data dilindungi PIN tambahan milik Owner: terbuka 15 menit per sesi, bisa dikunci manual, dan terkunci sementara setelah 5 kali salah (Sprint 6, ADR-018).
- Foto hanya bisa dibuka lewat server setelah cek izin; file palsu ditolak; data lokasi (EXIF) dibuang saat kompresi (Sprint 3, ADR-015).
- Password & PIN di-hash scrypt; token sesi disimpan sebagai SHA-256 (Sprint 1, ADR-008).
- Penguncian login setelah percobaan gagal berulang, termasuk untuk kode/email yang tidak terdaftar (Sprint 1, US-1.7, ADR-009).
- Audit log untuk login, logout, dan semua perubahan akun Pengawas (Sprint 1, US-1.8).
- Nonaktifkan akun / reset PIN langsung mencabut semua sesi Pengawas tersebut (Sprint 1).
- Logger menyensor otomatis password, PIN, token, session, dan cookie (US-0.6).

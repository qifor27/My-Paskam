# Fitur: PWA & Offline

> Sprint: 7 · Story: US-7.1–US-7.5 · Status: Done
> PRD: §19, §21 (Network Error), §23–§25 · ADR terkait: ADR-004, ADR-015, ADR-019

## 1. Tujuan
Pengawas tetap bisa mencatat Laporan Kerja dan Spare Part saat tidak ada sinyal; data terkirim otomatis begitu koneksi kembali, tanpa duplikat dan tanpa hilang.

## 2. Business Rules
| Aturan | Sumber |
|---|---|
| Aplikasi bisa dipasang ke layar utama (manifest, ikon, standalone) | PRD §19 |
| Input tidak boleh hilang saat jaringan/server gagal | PRD §23 |
| Retry tidak boleh membuat duplikat | PRD §24 (id client, ADR-004) |
| Status data: Draft → Menunggu dikirim → Mengirim → Terkirim / Gagal | PRD §25 |
| Draft hanya milik akun pembuatnya di perangkat itu | ADR-019 |

## 3. Alur User
1. **Pasang:** Akun → "Pasang aplikasi di HP" (Android: tombol; iPhone: Bagikan → Tambah ke Layar Utama).
2. **Online pertama kali:** form & daftar disimpan otomatis untuk offline (Pengawas).
3. **Tanpa sinyal:** buka form → isi → foto (tersimpan di HP) → Simpan → validasi di HP → masuk antrean → daftar menampilkan "Belum terkirim · Menunggu dikirim" + banner "1 data menunggu dikirim".
4. **Sinyal kembali / aplikasi dibuka lagi:** antrean dikirim otomatis (foto dulu, lalu data); banner "Mengirim data…" → hilang; data muncul di daftar.
5. **Gagal karena aturan server** (mis. unit dinonaktifkan): badge "Gagal dikirim" + pesan → ketuk untuk memperbaiki → Simpan lagi.
6. **Halaman belum tersimpan** saat offline → halaman `/offline` ("Tidak ada koneksi… data Anda tetap aman").

## 4. Data
IndexedDB `paskam` (`laporan-drafts`, `spare-part-drafts`): `{ id, userId, mode, fields, photos[{id, uploaded, blob?}], sync?: {status: queued|failed, …} }`. Cache Storage: `paskam-static-v1`, `paskam-pages-v1`.

## 5. Otorisasi & Keamanan
- Antrean dikirim memakai sesi yang sedang login; draft akun lain diabaikan.
- Halaman ber-data user di cache dihapus saat logout; API & foto tidak di-cache.
- Server tetap memvalidasi & mengotorisasi setiap kiriman antrean (sama dengan online).

## 6. State UI
| State | Tampilan |
|---|---|
| Offline (browser) | Banner kuning "Koneksi internet terputus…" |
| Antrean ada | Banner biru "n data menunggu dikirim · Kirim sekarang" |
| Mengirim | Banner "Mengirim data…" (ikon berputar) |
| Sesi habis saat mengirim | Banner "…login kembali untuk mengirim" |
| Gagal | Banner merah "n data gagal dikirim" + badge per item |
| Per item | Badge "Draft di HP" / "Menunggu dikirim" / "Gagal dikirim" |

## 7. Komponen & file
`public/sw.js`, `src/app/manifest.ts`, `src/app/offline/`, `src/components/sw-register.tsx`, `sync-provider.tsx`, `local-drafts.tsx`, `install-app.tsx`, `src/lib/sync/outbox.ts`, `draft-types.ts`, `src/lib/photo/upload-client.ts`.

## 8. Testing
- Interaktif (Puppeteer + Firefox, server production + PostgreSQL), 2× berturut-turut lulus: cache form terisi → **server dimatikan** → form dibuka dari cache → foto gagal unggah tetap di HP → Simpan → antrean + banner → DB masih 0 → **server hidup** → otomatis terkirim: tepat 1 laporan + 1 foto → tampil di daftar → logout menghapus cache halaman.
- Isolasi akun: antrean Budi tidak terlihat/terkirim saat Andi login di HP yang sama; terkirim atas nama Budi setelah Budi login lagi.
- Validasi offline: form kosong → "Nama operator wajib diisi" tanpa koneksi.
- Regresi E2E S1–S6 (145 cek) lulus.
- Catatan: skrip E2E & Puppeteer berada di luar repo (scratchpad sesi); belum diuji di HP nyata (Android/iPhone) & mode pesawat sungguhan.

## 9. Definition of Done (PRD §31)
- [x] Business requirement sesuai
- [x] UI selesai & mobile responsive
- [x] Loading / error / empty / offline state
- [x] Validation (HP + server)
- [x] Server authorization (tidak berubah)
- [x] Offline behavior
- [x] Test
- [x] Security review (mandiri)
- [x] TypeScript, lint, build lulus
- [x] Tidak ada secrets / unrelated changes
- [x] CHANGELOG + dokumen terkait diperbarui

## 10. Riwayat Perubahan
| Tanggal | Perubahan | Oleh |
|---|---|---|
| 2026-10-05 | Implementasi awal Sprint 7 | Claude Code |

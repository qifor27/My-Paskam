# Fitur: Order Spare Part (dokumentasi spare part rusak)

> Sprint: 4 · Story: US-4.1, US-4.3 (US-4.2 dibatalkan) · Status: Done
> PRD: §15, §18 · ADR terkait: ADR-015, ADR-016

## 1. Tujuan
Mendokumentasikan **spare part yang rusak** dari lapangan, lengkap dengan foto, agar Owner tahu apa yang rusak, di unit mana, dan kapan. Ini **bukan** alur pemesanan: tidak ada status order (ADR-016).

## 2. Business Rules
| Aturan | Sumber |
|---|---|
| Field: unit, nama spare part, deskripsi kerusakan, lokasi, foto; dicatat oleh & waktu otomatis | PRD §15 |
| Tidak ada status order | ADR-016 (Owner) |
| Pengawas yang mencatat tercatat otomatis dari akun login | ADR-016 (*tafsiran*, = ADR-014) |
| Pengawas hanya melihat catatannya; Owner melihat semua & tidak mengubah | ADR-016 (*tafsiran*) |
| Foto wajib 1–6 | ADR-016 (*tafsiran*) |
| Pengawas boleh mengubah/menghapus catatannya (soft delete) | ADR-016 (*tafsiran*) |
| Kolom jumlah / prioritas / nomor part | Belum dibuat (Q9 belum dijawab) |

## 3. Alur User
Tombol "+" → "Order Spare Part" (atau "Catat" di daftar) → pilih unit (chip) → nama spare part (saran dari riwayat) → deskripsi kerusakan → lokasi (saran) → foto (Kamera/Galeri) → Simpan → detail. Draft otomatis di HP; gagal kirim → "Belum terkirim".

## 4. Data
`order_spare_part` (tanpa kolom status), `photo` (module `ORDER_SPARE_PART`). Detail: `docs/database.md`.

## 5. Otorisasi
| Aksi | SUPER_ADMIN | PENGAWAS |
|---|---|---|
| Lihat daftar/detail | ✓ semua | ✓ miliknya (lainnya: tidak ditemukan) |
| Catat / ubah / hapus | ✗ | ✓ miliknya |
| Upload / lihat foto | lihat saja | ✓ miliknya |

## 6. State UI
Sama dengan Laporan Kerja (`FormAlerts`, validasi inline yang hilang saat diperbaiki, fokus ke error pertama, draft HP, "Belum terkirim", empty state "Belum ada catatan spare part", hapus dua langkah).

## 7. API / Server Actions
`saveSparePart`, `deleteSparePart` — `src/app/(app)/spare-part/actions.ts`; foto lewat `POST /api/foto` dengan `module=ORDER_SPARE_PART`.

## 8. Testing
- Unit: `spare-part/spare-part.test.ts` (schema tanpa status, field wajib, akses).
- E2E (2026-10-05): 21 cek — upload, validasi, idempotensi, tidak ada kolom status, visibilitas antar Pengawas (halaman & foto), foto lintas modul ditolak, edit ganti foto, hapus, audit. Semua lulus.
- Interaktif (Puppeteer + Firefox): isi form, upload foto, simpan langsung → detail; draft tidak muncul lagi (3×).

## 9. Definition of Done (PRD §31)
- [x] Business requirement sesuai (tafsiran ditandai)
- [x] UI selesai & mobile responsive
- [x] Loading / error / empty state
- [x] Validation (client + server)
- [x] Server authorization
- [x] Offline behavior: draft di HP (sync queue penuh di Sprint 7)
- [x] Test
- [x] Security review (mandiri)
- [x] TypeScript, lint, build lulus
- [x] Tidak ada secrets / unrelated changes
- [x] CHANGELOG + dokumen terkait diperbarui

## 10. Riwayat Perubahan
| Tanggal | Perubahan | Oleh |
|---|---|---|
| 2026-10-05 | Implementasi awal Sprint 4 | Claude Code |

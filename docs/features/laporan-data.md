# Fitur: Laporan Data

> Sprint: 6 (+ 2026-10-06) · Story: US-6.1, US-6.2, US-6.3 · Status: Done
> PRD: §17 · ADR terkait: ADR-010, ADR-018

## 1. Tujuan
Owner memantau data operasional dari semua Pengawas: berapa laporan, total jam kerja (HM) dan BBM per unit, spare part yang rusak, dan progres planning — dengan filter.

## 2. Business Rules
| Aturan | Sumber |
|---|---|
| Mencakup Laporan Kerja, Order Spare Part, Planning Job | ADR-018 (Owner) |
| Filter: tanggal (dari–sampai), unit, Pengawas; + status (Planning) / prioritas (Spare Part) | PRD §17 |
| Hanya Owner | ADR-010, ADR-018 (Owner) |
| Export PDF sesuai filter aktif (tanpa foto, maks. 2.000 baris) | ADR-020 (Owner, 2026-10-06) |
| Filter Pengawas juga memuat Owner (data yang dicatat Owner) | ADR-021 |
| PIN gate wajib | ADR-018 (Owner) |
| PIN = 6 digit, milik akun Owner, dibuat/diganti dengan password; terbuka 15 menit per sesi; 5× salah → kunci 15 menit | ADR-018 (*tafsiran*) |
| Default rentang = awal bulan s.d. hari ini; tanggal Spare Part = waktu dicatat; Planning = estimasi mulai | ADR-018 (*tafsiran*) |

## 3. Alur User
1. Menu Data → (belum ada PIN) form "Buat PIN Laporan Data" (password + PIN + ulangi) → langsung terbuka.
2. Kunjungan berikutnya / sesi lain → "Laporan Data terkunci" → PIN → terbuka 15 menit ("Terbuka sampai 15.40") → tombol **Kunci** untuk mengunci manual.
3. Tab modul (Laporan Kerja / Spare Part / Planning) → panel **Filter** (lipat; ringkasan filter di judul) → Terapkan / Reset. Filter ada di URL (bisa dibagikan/dibookmark).
4. Ringkasan: Laporan Kerja (jumlah, total HM, total BBM, tabel per unit), Spare Part (jumlah catatan, total spare part, per prioritas), Planning (jumlah, selesai, per status).
5. Detail: tabel di desktop, daftar di HP; tiap baris menuju halaman detail data. "Muat lebih banyak" per 50.
6. **Export PDF** (tombol di bawah judul): unduh PDF A4 lanskap sesuai tab & filter aktif — kop, ringkasan, tabel per unit (Laporan Kerja), detail.
7. Ganti PIN: Akun → PIN Laporan Data.

## 4. Data
Membaca `laporan_kerja`, `order_spare_part`, `planning_job` (tanpa yang terhapus). Kolom baru: `user.data_pin_hash`, `session.data_unlocked_until`. Total dihitung dengan agregasi database.

## 5. Otorisasi
Hanya SUPER_ADMIN (`laporan-data:access`). Data **tidak di-query** sebelum PIN terbuka untuk sesi itu. Pengawas: `AccessDenied`; action PIN → AUTHORIZATION.

## 6. State UI
| State | Perilaku |
|---|---|
| Belum ada PIN | Kartu "Buat PIN Laporan Data" |
| Terkunci | Kartu "Laporan Data terkunci" + input PIN |
| PIN salah / terkunci | Inline "PIN tidak sesuai" / banner "Terlalu banyak percobaan…" |
| Empty | "Tidak ada laporan kerja/catatan/planning" + saran ubah filter |
| Query rusak | Diabaikan, kembali ke default (tidak error) |
| Loading | Skeleton halaman |

## 7. Server Actions
`setDataPin`, `unlockData`, `lockData` — `src/app/(app)/laporan-data/actions.ts`. Query: `src/lib/laporan-data/queries.ts`; filter: `filters.ts`; status gerbang: `pin.ts`.

## 8. Testing
- Unit: `laporan-data/filters.test.ts`, `format.test.ts` (`zonedDayStart`).
- E2E (2026-10-05): 24 cek — buat PIN (password salah/benar), hash, isolasi antar sesi, PIN salah, buka, kunci manual, lockout, Pengawas ditolak, total & filter (unit, Pengawas, rentang, prioritas, status) cocok dengan data uji, query rusak/injeksi, audit, PIN tidak masuk log.
- Interaktif (Puppeteer + Firefox): ketik PIN → terbuka; tampilan HP & desktop.

## 9. Definition of Done (PRD §31)
- [x] Business requirement sesuai (PDF ditunda atas keputusan Owner)
- [x] UI selesai & mobile responsive
- [x] Loading / error / empty state
- [x] Validation (filter & PIN di server)
- [x] Server authorization + PIN gate
- [x] Offline behavior — tidak applicable (laporan butuh data server)
- [x] Test
- [x] Security review (mandiri)
- [x] TypeScript, lint, build lulus
- [x] Tidak ada secrets / unrelated changes
- [x] CHANGELOG + dokumen terkait diperbarui

## 10. Riwayat Perubahan
| Tanggal | Perubahan | Oleh |
|---|---|---|
| 2026-10-06 | Export PDF (ADR-020); tombol pindah ke bawah judul di HP; Owner di filter (ADR-021). E2E S6 = 31 cek | Claude Code |
| 2026-10-05 | Implementasi awal Sprint 6 | Claude Code |

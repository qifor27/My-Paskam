# Fitur: Laporan Kerja

> Sprint: 3 · Story: US-3.1–US-3.6 · Status: Done (nilai SEMENTARA ditandai)
> PRD: §14, §18, §19, §23, §24, §39 · ADR terkait: ADR-003, ADR-004, ADR-013, ADR-014, ADR-015, ADR-016

## 1. Tujuan
Pengawas mencatat pekerjaan unit dari HP di lapangan, lengkap dengan HM, BBM, dan foto. Owner memantau semua laporan.

## 2. Business Rules (ADR-014)
| Aturan | Sumber |
|---|---|
| Field: tanggal, unit, operator, HM, BBM (Solar), lokasi, deskripsi, foto | PRD §14 |
| Tidak ada status dan tidak ada persetujuan | ADR-014 (Q1/Q2) |
| Pengawas tercatat otomatis dari akun yang login (tidak diisi manual) | ADR-014 (Q16) |
| Pengawas hanya melihat laporannya sendiri; Owner melihat semua; Owner tidak membuat/mengubah | ADR-014 (Q16) |
| Operator diketik bebas + saran dari laporan sebelumnya | ADR-014 (dikonfirmasi) |
| Unit dipilih dari master data aktif (dikelola Owner) | ADR-014 (Q4) |
| HM = total jam kerja, 1 desimal, 0–24 | ADR-014 (dikonfirmasi) |
| BBM (Solar) = jumlah (angka ≥ 0, 1 desimal) | ADR-016 (menggantikan pilihan 1–6) |
| Tanggal tidak boleh melewati hari ini (zona `APP_TIME_ZONE`) | Validasi |
| Foto wajib minimal 1, maksimal 6 | ADR-014 (dikonfirmasi) |
| Pengawas boleh mengedit & menghapus laporannya (hapus = soft delete) | ADR-014 (Q6) |

## 3. Alur User
1. Tombol "+" → "Laporan Kerja" (atau "Buat" di daftar / "Buat laporan" di Beranda) → `/laporan-kerja/baru?draft=<uuid>`.
2. Isi: tanggal (chip Hari ini/Kemarin + date), unit (chip), operator & lokasi (saran), deskripsi, HM (keypad desimal, sufiks "jam"), BBM (keypad desimal, jumlah), foto (Kamera / Galeri).
3. Foto langsung dikompres & diunggah per foto (progress, Coba lagi, hapus). Tombol simpan menunggu semua foto selesai.
4. Isian & foto yang belum terunggah **tersimpan otomatis di HP** (IndexedDB) setiap ±0,6 dtk.
5. Simpan → detail laporan dengan pesan sukses; draft di HP dihapus.
6. Gagal jaringan → banner "Laporan tersimpan di HP… Coba kirim lagi"; draft tampil di daftar bagian "Belum terkirim".
7. Detail → Ubah (form sama, foto lama ikut) / Hapus (konfirmasi dua langkah).

## 4. Data
`laporan_kerja` (id dari client, `supervisor_id` = user login, soft delete), `photo` (module `LAPORAN_KERJA`, `record_id` = id laporan), `unit`. Detail: `docs/database.md`.

## 5. Otorisasi
| Aksi | SUPER_ADMIN | PENGAWAS |
|---|---|---|
| Lihat daftar/detail | ✓ semua | ✓ miliknya saja (lainnya: halaman tidak ditemukan) |
| Buat | ✗ | ✓ |
| Ubah / hapus | ✗ | ✓ miliknya |
| Lihat foto (`/api/foto/:id`) | ✓ foto laporan yang boleh dilihat | ✓ miliknya; foto draft hanya pengunggah |
| Upload foto | ✗ | ✓ (tidak bisa menempel ke laporan orang lain) |

## 6. State UI
| State | Perilaku / pesan |
|---|---|
| Loading | Skeleton halaman; form menampilkan placeholder sampai draft HP terbaca |
| Success | Banner hijau di detail ("Laporan berhasil disimpan." / "Perubahan disimpan.") |
| Empty | "Belum ada laporan kerja" + Buat laporan (Pengawas) |
| Validation | Inline per field; fokus & scroll ke field pertama yang salah |
| Network / offline | Banner kuning "tersimpan di HP" + Coba kirim lagi; foto gagal: overlay merah + Coba lagi, dicoba ulang otomatis saat online |
| Server error | `ErrorAlert` + kode laporan + Coba lagi; isian tetap |
| Permission | `AccessDenied` (Owner membuka /baru); laporan orang lain = halaman tidak ditemukan |
| Session expired | Banner + link login; draft tetap di HP |
| Retry | Idempoten: id laporan & id foto dari client |

## 7. API / Server Actions
- `POST /api/foto` (multipart: `id`, `recordId`, `width`, `height`, `file`) → 201/200 `{ ok, data: { id } }` atau `{ ok:false, error: PublicError }`.
- `GET /api/foto/:id` → file (private cache) atau 401/404.
- `saveLaporan(formData)` (buat/ubah, idempoten), `deleteLaporan(formData)` — `src/app/(app)/laporan-kerja/actions.ts`.

## 8. Testing
- Unit: `laporan-kerja/laporan.test.ts` (schema, desimal, akses), `photo/rules.test.ts` (magic bytes), `format.test.ts` (tanggal).
- E2E (2026-10-05, server production + PostgreSQL): 32 cek (dihitung ulang) — upload & idempotensi, file palsu, validasi ADR-014, simpan ulang tanpa duplikat, visibilitas antar Pengawas (halaman & foto), edit ganti foto, hapus, unit, audit log. Semua lulus.
- Visual: daftar (Owner & Pengawas), detail.
- Belum: uji kamera & kompresi di HP nyata; mode offline penuh (Sprint 7).

## 9. Definition of Done (PRD §31)
- [x] Business requirement sesuai (tafsiran/SEMENTARA ditandai)
- [x] UI selesai & mobile responsive
- [x] Loading / error / empty state
- [x] Validation (client + server + constraint DB)
- [x] Server authorization
- [x] Offline behavior: draft di HP + foto tersimpan & dicoba ulang (sync queue penuh di Sprint 7)
- [x] Test
- [x] Security review (mandiri)
- [x] TypeScript, lint, build lulus
- [x] Tidak ada secrets / unrelated changes
- [x] CHANGELOG + dokumen terkait diperbarui

## 10. Riwayat Perubahan
| Tanggal | Perubahan | Oleh |
|---|---|---|
| 2026-10-05 | Implementasi awal Sprint 3 | Claude Code |
| 2026-10-05 | BBM menjadi jumlah (ADR-016); perbaikan race autosave yang menulis ulang draft setelah tersimpan; komponen bersama `FormAlerts`, `DeleteRecord`, `LocalDrafts` | Claude Code |

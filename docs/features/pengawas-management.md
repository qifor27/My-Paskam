# Fitur: Manajemen Pengawas

> Sprint: 1 · Story: US-1.5 · Status: Done (lihat pertanyaan terbuka Q26, Q27)
> PRD: §12 · ADR terkait: ADR-004, ADR-007

## 1. Tujuan
Owner membuat dan mengelola akun Pengawas. Pengawas tidak mendaftar sendiri.

## 2. Business Rules
| Aturan | Sumber |
|---|---|
| Owner dapat tambah, edit, aktif/nonaktif, reset PIN, melihat data Pengawas | PRD §12 |
| Kode Pengawas unik, 3–20 karakter (A–Z, 0–9, -), disimpan huruf besar | Implementasi; format final menunggu Q26 |
| Owner mengetik PIN awal / PIN baru sendiri | Implementasi; menunggu Q27 |
| Nonaktifkan / reset PIN → semua sesi Pengawas tersebut langsung dicabut | Keamanan (PRD §10) |
| Akun tidak dihapus, hanya dinonaktifkan (histori laporan tetap terkait) | PRD §14 data ownership |

## 3. Alur User
- `/pengawas`: daftar (aktif dulu, urut nama), status, terakhir masuk. Empty state + TAMBAH PENGAWAS.
- `/pengawas/baru`: Nama, Kode, PIN, Ulangi PIN → SIMPAN → kembali ke daftar dengan pesan sukses.
- `/pengawas/[id]`: ubah data, reset PIN, nonaktifkan (konfirmasi dua langkah) / aktifkan.

## 4. Data
`user` (role `PENGAWAS`, `kode_pengawas`, `pin_hash`, `is_active`, `created_by`). ID dibuat di client (ADR-004).

## 5. Otorisasi
| Aksi | SUPER_ADMIN | PENGAWAS |
|---|---|---|
| Lihat / buat / ubah / aktif-nonaktif / reset PIN | ✓ | ✗ (halaman: pesan "tidak memiliki akses"; action: error AUTHORIZATION) |

Action hanya bisa mengubah user ber-role PENGAWAS, sehingga akun Owner tidak bisa diubah lewat modul ini.

## 6. State UI
| State | Perilaku / pesan |
|---|---|
| Loading | Tombol "MENYIMPAN...", disabled |
| Success | Banner hijau (dibuat / perubahan disimpan / PIN direset) |
| Empty | "Belum ada Pengawas" + TAMBAH PENGAWAS |
| Validation error | Inline per field, termasuk "Kode Pengawas sudah dipakai" |
| Network / server error | Banner + COBA LAGI; isian tetap ada |
| Permission error | Halaman `AccessDenied` |
| Session expired | Error SESSION_EXPIRED di action; halaman → `/login?sesi=berakhir` |
| Retry | Idempoten: id yang sama → akun yang sama, tidak duplikat |

## 7. API / Server Actions
`src/app/(app)/pengawas/actions.ts`: `createPengawas`, `updatePengawas`, `setPengawasActive`, `resetPengawasPin`. Semua lewat `runAction` + `requirePermission("pengawas:manage")` + audit log.

## 8. Testing
- Unit: validasi schema & permission (`validation.test.ts`).
- E2E manual (2026-10-03): buat, retry idempoten, kode duplikat, Pengawas ditolak server, nonaktif mencabut sesi, reset PIN.

## 9. Definition of Done (PRD §31)
- [x] Business requirement sesuai (Q26/Q27 ditandai)
- [x] UI selesai & mobile responsive
- [x] Loading / error / empty state
- [x] Validation (client + server)
- [x] Server authorization
- [x] Offline behavior — tidak applicable (fungsi admin Owner)
- [x] Test
- [x] Security review (mandiri)
- [x] TypeScript, lint, build lulus
- [x] Tidak ada secrets / unrelated changes
- [x] CHANGELOG + dokumen terkait diperbarui

## 10. Riwayat Perubahan
| Tanggal | Perubahan | Oleh |
|---|---|---|
| 2026-10-03 | Implementasi awal | Claude Code |

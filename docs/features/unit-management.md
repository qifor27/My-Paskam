# Fitur: Manajemen Unit

> Sprint: 3 · Story: US-3.1 · Status: Done · PRD: §14 · ADR: ADR-014 (Q4)

## 1. Tujuan
Owner menentukan unit yang bisa dipilih di Laporan Kerja, dan bisa menambah unit baru tanpa perubahan kode.

## 2. Business Rules
| Aturan | Sumber |
|---|---|
| Unit awal: PASKAM 1–4, DUMP, TOWING (seed migrasi) | PRD §14 |
| Owner bisa menambah, mengubah nama, aktif/nonaktif | ADR-014 |
| Nama unik, disimpan huruf besar, spasi dirapikan, maks. 40 karakter | Implementasi |
| Unit tidak dihapus, hanya dinonaktifkan (laporan lama tetap merujuk unit) | Implementasi |
| Unit nonaktif tidak muncul di form baru; laporan lama yang memakai unit itu tetap bisa diedit | Implementasi |

## 3. Alur
Akun → Unit (`/unit`): form "Tambah unit" di atas, daftar kartu unit (ubah nama inline, Nonaktifkan/Aktifkan).

## 5. Otorisasi
Hanya SUPER_ADMIN (`unit:manage`). Pengawas: `AccessDenied`; action → AUTHORIZATION.

## 6. State UI
Loading (skeleton), validasi inline ("Nama unit sudah dipakai"), `ErrorAlert` untuk error lain, idempoten (id dari client).

## 7. Server Actions
`createUnit`, `renameUnit`, `setUnitActive` — `src/app/(app)/unit/actions.ts`; audit `UNIT_*`.

## 8. Testing
E2E: tambah (normalisasi nama), duplikat ditolak, unit nonaktif ditolak saat simpan laporan, Pengawas ditolak.

## 10. Riwayat Perubahan
| Tanggal | Perubahan | Oleh |
|---|---|---|
| 2026-10-05 | Implementasi awal | Claude Code |

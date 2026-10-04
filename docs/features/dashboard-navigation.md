# Fitur: Dashboard & Navigasi

> Sprint: 2 · Story: US-2.1, US-2.2, US-2.3, US-2.4 · Status: Done
> PRD: §5, §6, §9, §13, §20–§22, §28–§29 · ADR terkait: ADR-010

## 1. Tujuan
Setelah login, Owner dan Pengawas langsung melihat modul yang relevan dan bisa berpindah modul dengan satu tangan.

## 2. Business Rules
| Aturan | Sumber |
|---|---|
| Dashboard berisi shortcut Laporan Kerja, Order Spare Part, Planning Job, Laporan Data | PRD §13 |
| Tanpa widget dekoratif; setiap komponen punya tujuan operasional | PRD §13 |
| Icon: Clipboard (Laporan Kerja), Package (Spare Part), Calendar (Planning), File/Chart (Laporan Data), User (Pengawas) | PRD §5 |
| **SEMENTARA:** Laporan Data hanya untuk Owner | ADR-010, menunggu Q13 |
| Glassmorphism hanya di bottom navigation (floating navigation) | PRD §6 |

## 3. Alur User
- **Mobile (< 768 px):** header biru (nama + role + keluar), bottom navigation tetap di bawah (Beranda + modul; Owner 5 item, Pengawas 4 item), aman untuk notch iPhone (`safe-area-inset-bottom`).
- **Desktop (≥ 768 px):** sidebar biru tetap, grup "Administrasi" untuk Owner, user + keluar di bawah sidebar.
- **Dashboard Owner:** Menu (4 modul) + Administrasi (Pengawas, dengan jumlah Pengawas aktif).
- **Dashboard Pengawas:** Menu (3 modul).
- Modul yang belum dibangun menampilkan empty state "Modul sedang disiapkan" (diganti di sprint masing-masing).

## 4. Data
Hanya `user` (hitung Pengawas aktif). Tidak ada tabel baru.

## 5. Otorisasi
| Halaman | SUPER_ADMIN | PENGAWAS |
|---|---|---|
| `/`, `/laporan-kerja`, `/spare-part`, `/planning-job` | ✓ | ✓ |
| `/laporan-data` | ✓ | ✗ (SEMENTARA, Q13) |
| `/pengawas/**` | ✓ | ✗ |

Satu sumber: `src/lib/navigation.ts` (`NAV_ITEMS`, `navFor(role)`), memakai permission di `src/lib/auth/permissions.ts`. Menu yang tidak diizinkan tidak tampil, **dan** halaman tetap memeriksa izin di server.

## 6. State UI
| State | Perilaku |
|---|---|
| Loading | `(app)/loading.tsx`: skeleton berbentuk daftar (layout tidak melompat) |
| Empty | `EmptyState` (modul belum tersedia, daftar Pengawas kosong) |
| Error di halaman | `(app)/error.tsx`: navigasi tetap tampil, pesan + kode laporan (digest) + COBA LAGI + ke beranda |
| Error di layout (mis. DB mati) | `app/error.tsx`: header + pesan yang sama |
| Error root layout | `app/global-error.tsx`: versi darurat tanpa CSS aplikasi |
| 404 | `app/not-found.tsx`: "Halaman tidak ditemukan" + KE BERANDA |
| Offline | `NetworkBanner`: banner kuning "Koneksi internet terputus. Isian Anda tidak akan dihapus." |
| Permission | `AccessDenied` |

## 7. API / Server Actions
Tidak ada action baru.

## 8. Testing
- Unit: `navigation.test.ts` (menu per role, maks. 5 item bottom nav, item aktif), `format.test.ts` (zona waktu).
- E2E (2026-10-04, server production): 22 cek akses rute per role + regresi 21 skenario Sprint 1, semua lulus.
- Visual (Firefox headless): dashboard Owner/Pengawas mobile 390 px, `/pengawas` desktop 1280 px, akses ditolak, modul placeholder, halaman error saat database dimatikan.
- Belum: uji di perangkat Android/iPhone nyata.

## 9. Definition of Done (PRD §31)
- [x] Business requirement sesuai (Q13 ditandai)
- [x] UI selesai & mobile responsive
- [x] Loading / error / empty state
- [x] Validation — tidak applicable (tidak ada input)
- [x] Server authorization
- [x] Offline behavior: banner status jaringan (sync queue di Sprint 7)
- [x] Test
- [x] Security review (mandiri)
- [x] TypeScript, lint, build lulus
- [x] Tidak ada secrets / unrelated changes
- [x] CHANGELOG + dokumen terkait diperbarui

## 10. Riwayat Perubahan
| Tanggal | Perubahan | Oleh |
|---|---|---|
| 2026-10-04 | Implementasi awal Sprint 2 | Claude Code |

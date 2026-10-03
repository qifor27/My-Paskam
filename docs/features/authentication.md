# Fitur: Autentikasi (Login Owner & Pengawas)

> Sprint: 1 · Story: US-1.1, US-1.2, US-1.3, US-1.4, US-1.6, US-1.7, US-1.8 · Status: Done (parameter SEMENTARA, lihat §2)
> PRD: §10, §11, §21 · ADR terkait: ADR-002, ADR-007, ADR-008

## 1. Tujuan
Owner dan Pengawas masuk dari satu halaman `/login`. Pengawas di lapangan cukup memakai Kode + PIN dari HP.

## 2. Business Rules
| Aturan | Sumber |
|---|---|
| Owner: email/username + password; Pengawas: Kode + PIN | PRD §10 |
| Satu URL `/login` dengan pilihan PENGAWAS / OWNER | PRD §11 |
| Tidak ada registrasi publik; Owner pertama dibuat via CLI `npm run owner:create` | PRD §12 |
| Pesan gagal generik, tidak membedakan akun tidak ada / secret salah / nonaktif | PRD §21 |
| Kode Pengawas & email/username tidak sensitif huruf besar/kecil | Implementasi (normalisasi) |
| **SEMENTARA:** PIN 6 digit; kunci 15 menit setelah 5 gagal per kode/email (30 per IP) dalam 15 menit | ADR-007, menunggu Q17 |
| **SEMENTARA:** sesi Owner 12 jam, Pengawas 7 hari | ADR-007, menunggu Q18 |

Semua parameter sementara ada di `src/lib/auth/config.ts`.

## 3. Alur User
1. Buka `/login` → pilih PENGAWAS (default) atau OWNER → isi → MASUK.
2. Berhasil → `/`. Gagal → pesan di atas form; isian tetap ada (form tidak direset).
3. Sesi habis / akun dinonaktifkan / PIN direset → kunjungan berikutnya diarahkan ke `/login?sesi=berakhir` dengan pesan "Sesi Anda telah berakhir".
4. Keluar: ikon di header → sesi dihapus di server → `/login`.

## 4. Data
`user` (password_hash, pin_hash, last_login_at), `session` (SHA-256 token), `rate_limit`, `audit_log`. Detail: `docs/database.md`.

## 5. Otorisasi
| Aksi | SUPER_ADMIN | PENGAWAS |
|---|---|---|
| Login mode OWNER | ✓ | ✗ (dicari hanya di role SUPER_ADMIN) |
| Login mode PENGAWAS | ✗ | ✓ |
| Halaman dalam `(app)/` | ✓ | ✓ (cek per halaman) |

Helper: `requireUser()` (halaman → redirect), `requirePermission()` (server action → AppError), `can(role, permission)`.

## 6. State UI
| State | Perilaku / pesan |
|---|---|
| Loading | Tombol "MEMERIKSA..." + spinner, disabled (tidak bisa submit ganda) |
| Success | Redirect ke `/` |
| Validation error | Inline di bawah field ("Kode Pengawas wajib diisi") |
| Kredensial salah | "Kode Pengawas atau PIN tidak sesuai." / "Email/Username atau password tidak sesuai." |
| Terkunci | "Terlalu banyak percobaan masuk. Coba lagi dalam N menit." |
| Network error / offline | Banner kuning: koneksi tidak tersedia; isian tidak hilang |
| Server error | Banner + kode laporan `ERR-XXXXXX` |
| Session expired | Banner info di `/login` |

## 7. API / Server Actions
`src/app/login/actions.ts`: `login(formData)` → `{ ok, data: { redirectTo } } | { ok: false, error: PublicError }`; `logout()`.

## 8. Testing
- Unit: `password.test.ts`, `rate-limit-policy.test.ts`, `validation.test.ts`.
- E2E manual terhadap server production + PostgreSQL (2026-10-03, 21 skenario lulus): validasi, pesan generik, login Owner/Pengawas, cookie httpOnly, lockout, sesi dicabut saat nonaktif/reset PIN, logout, tidak ada secret di log/audit.
- Belum: uji visual di perangkat nyata (Android/iPhone).

## 9. Definition of Done (PRD §31)
- [x] Business requirement sesuai (parameter sementara ditandai)
- [x] UI selesai & mobile responsive
- [x] Loading / error / empty state
- [x] Validation (client + server)
- [x] Server authorization
- [ ] Offline behavior — tidak applicable untuk login (butuh server); dicatat
- [x] Test
- [x] Security review (mandiri, lihat `docs/security.md`)
- [x] TypeScript, lint, build lulus
- [x] Tidak ada secrets / unrelated changes
- [x] CHANGELOG + dokumen terkait diperbarui

## 10. Riwayat Perubahan
| Tanggal | Perubahan | Oleh |
|---|---|---|
| 2026-10-03 | Implementasi awal Sprint 1 | Claude Code |

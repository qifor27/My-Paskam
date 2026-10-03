# Security

> Status: **Draft**. Sumber: PRD §10, §12, §21, §26, storage §12.11–§12.12.
> Diperbarui setiap perubahan pada auth, permission, upload, atau penanganan data sensitif.

## Autentikasi
| Role | Metode | Kebijakan |
|---|---|---|
| Owner (`SUPER_ADMIN`) | Email/username + password (min. 10 karakter) | scrypt (ADR-008), rate limit, siap 2FA |
| Pengawas | Kode Pengawas + PIN | PIN di-hash scrypt; 6 digit SEMENTARA (ADR-007); akun dibuat Owner, tanpa registrasi publik |

- Owner pertama dibuat lewat `npm run owner:create` (CLI di server), bukan lewat web.
- **Sesi:** token acak 32 byte di cookie `paskam_session` (httpOnly, Secure di produksi, SameSite=Lax, path /). DB hanya menyimpan SHA-256 token. Durasi SEMENTARA: Owner 12 jam, Pengawas 7 hari (ADR-007). Sesi divalidasi di setiap request server (akun nonaktif = sesi tidak berlaku).
- **Pencabutan sesi:** logout (sesi itu), nonaktifkan akun, dan reset PIN (semua sesi user tersebut).
- **Brute-force:** tabel `rate_limit` (ADR-009): 5 gagal per kode/email atau 30 per IP dalam 15 menit → kunci 15 menit. Identifier yang tidak terdaftar ikut dikunci, sehingga tidak bisa dipakai untuk menebak akun.
- **Anti-enumerasi:** pesan gagal sama untuk akun tidak ada / secret salah / akun nonaktif; verifikasi dummy menyamakan waktu respons.
- **CSRF:** server action Next.js memeriksa header Origin; cookie SameSite=Lax.

## Otorisasi
- Semua cek dilakukan di server, bukan hanya di UI.
- Implementasi: `src/lib/auth/permissions.ts` (`can(role, permission)`), `requireUser()` untuk halaman, `requirePermission()` untuk server action.
- Izin saat ini: `pengawas:manage` → SUPER_ADMIN.
- Matriks akses per modul ditulis di setiap `docs/features/<modul>.md`.
- Visibilitas data antar-Pengawas ⛔ Q16.

## Foto & Storage
- Bucket privat; akses melalui signed URL berumur pendek setelah cek otorisasi.
- Validasi server: MIME, ukuran, ekstensi.
- Cleanup hanya Owner + konfirmasi + re-authentication, dan dicatat di audit log.

## Logging
Implementasi: `src/lib/logger.ts`. Key dipecah per kata (camelCase/snake_case), lalu disensor jika mengandung kata: password, pass, pin, token, secret, authorization, cookie, credential, session. Error ke user lewat `toPublicError` (`src/lib/errors`) yang tidak pernah menyertakan stack trace.

- Wajib: timestamp, user ID, action, kategori error, error/correlation ID.
- **Dilarang** dicatat: password, PIN, token, credential.
- Stack trace tidak pernah ditampilkan ke user.

## Audit Log Events
| Event | Sejak |
|---|---|
| LOGIN_SUCCESS / LOGIN_FAILED (detail: mode, identifier, ip, reason) / LOGIN_LOCKED / LOGOUT | Sprint 1 |
| PENGAWAS_CREATED / UPDATED (from→to) / ACTIVATED / DEACTIVATED / PIN_RESET | Sprint 1 |

Implementasi: `src/lib/audit.ts`. Detail melewati `redact()`; kegagalan menulis audit tidak menggagalkan aksi utama (dicatat di log aplikasi).
| PHOTO_CLEANUP | Sprint 8 |

## Security Review Log
| Tanggal | Lingkup | Temuan | Status |
|---|---|---|---|
| 2026-10-03 | Sprint 1 auth & manajemen Pengawas (review mandiri + E2E) | Pesan Zod bawaan berbahasa Inggris bocor saat field tidak terkirim | Diperbaiki (locale `id` + "Wajib diisi") |
| 2026-10-03 | Sprint 1 | Tidak ada password/PIN di audit_log maupun log server (diverifikasi dengan pencarian) | OK |
| 2026-10-03 | Sprint 1 | Kepercayaan `x-forwarded-for` bergantung pada hosting | Terbuka, tinjau saat Q23 |

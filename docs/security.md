# Security

> Status: **Draft**. Sumber: PRD §10, §12, §21, §26, storage §12.11–§12.12.
> Diperbarui setiap perubahan pada auth, permission, upload, atau penanganan data sensitif.

## Autentikasi
| Role | Metode | Kebijakan |
|---|---|---|
| Owner (`SUPER_ADMIN`) | Email/username + password | Hash (argon2id/bcrypt), rate limit, siap 2FA |
| Pengawas | Kode Pengawas + PIN | PIN di-hash; panjang & lockout ⛔ Q17; akun dibuat Owner, tanpa registrasi publik |

- Sesi: cookie httpOnly, Secure, SameSite; durasi ⛔ Q18.
- Pesan gagal login generik: "Kode Pengawas atau PIN tidak sesuai" (mencegah enumerasi).

## Otorisasi
- Semua cek dilakukan di server, bukan hanya di UI.
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
| LOGIN_SUCCESS / LOGIN_FAILED | Sprint 1 |
| PENGAWAS_CREATED / UPDATED / DEACTIVATED / PIN_RESET | Sprint 1 |
| PHOTO_CLEANUP | Sprint 8 |

## Security Review Log
| Tanggal | Lingkup | Temuan | Status |
|---|---|---|---|

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
- Izin saat ini: `pengawas:manage` → SUPER_ADMIN; `laporan-kerja:access`, `spare-part:access`, `planning-job:access` → SUPER_ADMIN, PENGAWAS; `laporan-data:access` → SUPER_ADMIN (SEMENTARA, ADR-010).
- Menu disembunyikan sesuai izin **dan** setiap halaman tetap memeriksa izin di server (diuji E2E).
- Matriks akses per modul ditulis di setiap `docs/features/<modul>.md`.
- **Laporan Kerja (ADR-014):** Pengawas hanya melihat & mengubah laporan miliknya (`supervisor_id`/`created_by` = user login, diisi server, tidak dari form); Owner melihat semua, tidak mengubah. Laporan orang lain → halaman "tidak ditemukan" tanpa data (status 200 karena streaming, ADR-015).
- Izin baru: `laporan-kerja:create` (PENGAWAS), `laporan-kerja:view-all` (SUPER_ADMIN), `unit:manage` (SUPER_ADMIN).
- **Order Spare Part (ADR-016):** aturan sama dengan Laporan Kerja; izin `spare-part:create` (PENGAWAS), `spare-part:view-all` (SUPER_ADMIN). Aturan kepemilikan dipusatkan di `src/lib/records/access.ts`.
- **Planning Job (ADR-017):** `planning-job:create` & `planning-job:view-all` (SUPER_ADMIN). Pengawas hanya melihat planning yang ditugaskan; perubahan status dicek di server dengan tabel transisi per role (Pengawas maju satu langkah, hanya miliknya). Hanya user ber-role PENGAWAS yang bisa ditugaskan.

## PIN Laporan Data (ADR-018)
- PIN 6 digit terpisah milik akun Owner, hash scrypt (`user.data_pin_hash`). Membuat/mengganti PIN wajib password akun (re-autentikasi); setelah ganti, semua sesi lain terkunci.
- PIN benar → `session.data_unlocked_until` = sekarang + 15 menit; hanya sesi itu yang terbuka. Tombol Kunci menghapusnya.
- Brute-force: `rate_limit` key `datapin:<userId>` (5 gagal / 15 menit → kunci 15 menit), berlaku juga untuk password saat membuat PIN.
- Data laporan tidak di-query sebelum gerbang terbuka. Filter dari URL divalidasi zod; nilai tidak valid diabaikan (diuji dengan input injeksi).

## Foto & Storage (ADR-015)
- **Upload** `POST /api/foto`: wajib login + izin buat sesuai modul (`module` = `LAPORAN_KERJA` / `ORDER_SPARE_PART`, registry `src/lib/photo/modules.ts`); cek Origin; Content-Length & ukuran file ≤ 2 MB; tipe dari **magic bytes** (hanya JPEG/WebP — SVG/HTML/PDF yang mengaku gambar ditolak); foto tidak bisa ditempel ke laporan milik orang lain; id foto idempoten.
- **Akses** `GET /api/foto/:id`: tidak ada URL publik. Setiap request dicek: foto milik laporan yang boleh dilihat user dan diunggah pembuat laporan; foto draft hanya pengunggah. Selain itu → 404 (keberadaan tidak terungkap). Header `Cache-Control: private`, `X-Content-Type-Options: nosniff`.
- **Privasi**: kompresi di HP membuang EXIF (lokasi GPS, model HP).
- **Storage key** dibuat server dari UUID dan divalidasi regex (anti path traversal). Driver `local` hanya untuk development; produksi memakai bucket privat (Supabase, menyusul Q23).
- Laporan terhapus (soft delete) → foto ikut tidak bisa diakses.
- Cleanup hanya Owner + konfirmasi + re-authentication, dan dicatat di audit log (Sprint 8).

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
| LAPORAN_CREATED / UPDATED / DELETED (detail: laporanId, unit, tanggal, jumlah foto) | Sprint 3 |
| UNIT_CREATED / UPDATED (from→to) / ACTIVATED / DEACTIVATED | Sprint 3 |
| SPARE_PART_CREATED / UPDATED / DELETED (detail: sparePartId, unit, partName, jumlah foto) | Sprint 4 |
| PLANNING_CREATED / UPDATED / DELETED, PLANNING_STATUS_CHANGED (from→to) | Sprint 5 |
| DATA_PIN_SET / DATA_PIN_FAILED (step, ip) / DATA_PIN_LOCKED / DATA_UNLOCKED / DATA_LOCKED | Sprint 6 |

Implementasi: `src/lib/audit.ts`. Detail melewati `redact()`; kegagalan menulis audit tidak menggagalkan aksi utama (dicatat di log aplikasi).
| PHOTO_CLEANUP | Sprint 8 |

## Security Review Log
| Tanggal | Lingkup | Temuan | Status |
|---|---|---|---|
| 2026-10-03 | Sprint 1 auth & manajemen Pengawas (review mandiri + E2E) | Pesan Zod bawaan berbahasa Inggris bocor saat field tidak terkirim | Diperbaiki (locale `id` + "Wajib diisi") |
| 2026-10-03 | Sprint 1 | Tidak ada password/PIN di audit_log maupun log server (diverifikasi dengan pencarian) | OK |
| 2026-10-03 | Sprint 1 | Kepercayaan `x-forwarded-for` bergantung pada hosting | Terbuka, tinjau saat Q23 |
| 2026-10-05 | Sprint 3 laporan & foto (review mandiri + E2E 32 cek) | Path storage dinamis membuat Turbopack men-trace seluruh proyek (foto bisa ikut ter-deploy) | Diperbaiki (`turbopackIgnore`) |
| 2026-10-05 | Sprint 3 | File palsu, foto lintas Pengawas, edit laporan orang lain, Owner membuat laporan — semua ditolak | OK |
| 2026-10-05 | Sprint 3 | `notFound()` di bawah `loading.tsx` = status 200 (UI tidak ditemukan, tanpa data) | Diterima (ADR-015) |
| 2026-10-05 | Sprint 3 | Foto yatim (laporan tidak pernah disimpan) menumpuk di storage | Terbuka → Sprint 8 cleanup |
| 2026-10-05 | Sprint 4 spare part (E2E 21 cek) | Foto tidak bisa dipakai lintas modul/record; Owner & Pengawas lain ditolak | OK |
| 2026-10-05 | Sprint 6 Laporan Data (E2E 24 cek) | Isolasi PIN per sesi, lockout, Pengawas ditolak, query injeksi diabaikan, PIN tidak masuk log | OK |
| 2026-10-05 | Sprint 5 planning (E2E 26 cek) | Lompat status, batal oleh Pengawas, ubah status planning orang lain, menugaskan Owner — semua ditolak | OK |

# Decision Log (ADR)

> Setiap keputusan teknis **dan** jawaban business rule dicatat di sini.
> Status: `PROPOSED` → `ACCEPTED` / `REJECTED` / `SUPERSEDED by ADR-xxx`.
> Hanya ADR `ACCEPTED` yang boleh dijadikan dasar implementasi.

## Template

```markdown
### ADR-xxx: <Judul>
- Tanggal: YYYY-MM-DD
- Status: PROPOSED
- Menjawab: Q… (docs/prd-analysis.md)
- Konteks: …
- Keputusan: …
- Konsekuensi: …
```

---

### ADR-000: Struktur dokumentasi & kewajiban dokumentasi
- Tanggal: 2026-10-01
- Status: PROPOSED
- Konteks: PRD §31 & §36 meminta dokumentasi diperbarui dan docs menjadi source of truth.
- Keputusan: Gunakan struktur `docs/` sesuai PRD §36 + `docs/features/` + `CHANGELOG.md`. Aturan pembaruan per jenis perubahan ditetapkan di `CLAUDE.md`. `prd.md` dipindah ke `docs/PRD.md` di Sprint 0.
- Konsekuensi: Setiap PR/task wajib menyebut dokumen yang diperbarui.

### ADR-001: Penomoran ulang bagian Storage di PRD
- Tanggal: 2026-10-01
- Status: PROPOSED
- Konteks: Bagian Storage Management bernomor "12" dan bentrok dengan §12 User Management.
- Keputusan: Ubah menjadi §39 (39.1–39.14).
- Konsekuensi: Referensi di dokumen lain memakai §39.

### ADR-002: Platform data, storage, dan auth
- Tanggal: 2026-10-01
- Status: PROPOSED — bagian auth custom session **sudah diimplementasikan di Sprint 1** agar pekerjaan tidak tertahan; bisa diganti jika ditolak
- Menjawab: S4, Q23
- Konteks: PRD menyebut PostgreSQL + Prisma, Supabase Storage, dan "secure session-based auth".
- Usulan: Supabase Postgres sebagai DB (via Prisma), Supabase Storage dengan bucket privat, dan **custom session auth** di server Next.js (cookie httpOnly, session disimpan di DB) agar login Kode + PIN dan audit log sepenuhnya terkendali. Akses foto melalui signed URL berumur pendek yang dibuat server setelah cek otorisasi.
- Perlu konfirmasi: hosting aplikasi (Vercel/VPS).

### ADR-003: Model foto (file vs attachment)
- Tanggal: 2026-10-01
- Status: PROPOSED
- Konteks: Dedup checksum (PRD storage §12.9) dan cleanup (§12.5) bisa saling bertabrakan (Risiko R3).
- Usulan: Tabel `photo_file` (hash, path, size, retention_status) dan `photo_attachment` (module, record_id, photo_file_id). File fisik dihapus hanya jika semua attachment eligible dan tidak ada yang `KEEP`.

### ADR-004: ID dari client & idempotency sejak Sprint 0
- Tanggal: 2026-10-01
- Status: PROPOSED
- Konteks: Offline baru dijadwalkan di Sprint 7, tetapi Sprint 3 sudah membutuhkan draft dan retry aman (Risiko R1).
- Usulan: Semua record bisnis memakai UUID yang dibuat client + kolom `idempotency_key` unik, sejak skema pertama.

### ADR-005: Palet warna & mode terang
- Tanggal: 2026-10-01
- Status: PROPOSED
- Konteks: PRD §7 menetapkan biru (identitas) dan oranye (aksi) tanpa nilai hex. Pengguna bekerja di lapangan.
- Keputusan: Pakai palet di `docs/design-system.md`. Semua kombinasi teks putih di atas brand/action/danger ≥ 4.5:1 (WCAG AA). Untuk MVP hanya mode terang.
- Konsekuensi: Dark mode bisa ditambahkan nanti tanpa mengubah komponen, karena warna diambil dari token.

### ADR-006: Fondasi error handling
- Tanggal: 2026-10-01
- Status: ACCEPTED (turunan langsung PRD §20–§26)
- Keputusan: `AppError` + 9 kategori (`src/lib/errors`). Server mengembalikan `PublicError` (kategori, pesan Indonesia, `errorId` format `ERR-XXXXXX`, `retryable`, `fieldErrors`) tanpa stack trace. Detail teknis dicatat lewat `logger` (JSON per baris) yang otomatis menyensor key sensitif (password, pin, token, session, cookie, dll.).
- Konsekuensi: Semua route handler/server action wajib membungkus error dengan `toPublicError`.

### ADR-007: Parameter autentikasi sementara
- Tanggal: 2026-10-03
- Status: PROPOSED (sementara, menunggu Q17 & Q18)
- Konteks: Sprint 1 dijalankan sebelum Owner menjawab kebijakan PIN dan durasi sesi.
- Keputusan sementara: PIN 6 digit angka; kunci 15 menit setelah 5 gagal per kode/email atau 30 gagal per IP dalam window 15 menit; sesi Owner 12 jam, Pengawas 7 hari (tetap, tidak diperpanjang otomatis).
- Konsekuensi: Semua nilai ada di `src/lib/auth/config.ts`, sehingga perubahan tidak menyentuh logika. Jika panjang PIN berubah, PIN yang sudah ada tetap valid sampai direset.

### ADR-008: Hashing password & PIN dengan scrypt bawaan Node
- Tanggal: 2026-10-03
- Status: ACCEPTED
- Konteks: PRD §10 mewajibkan hash; PRD §34 melarang dependency tanpa alasan.
- Keputusan: `node:crypto` scrypt N=2^15, r=8, p=3 (setara rekomendasi OWASP, ±0,5 dtk dan 32 MB per hash). Format string menyimpan parameter, jadi parameter bisa dinaikkan nanti tanpa membatalkan hash lama. Saat akun tidak ditemukan tetap dilakukan verifikasi dummy agar waktu respons sama (anti-enumerasi).
- Konsekuensi: Tidak perlu modul native (argon2/bcrypt). Login sengaja ±0,5 dtk.

### ADR-009: Rate limit login di PostgreSQL
- Tanggal: 2026-10-03
- Status: ACCEPTED
- Konteks: Rate limit di memori tidak berlaku di banyak instance/serverless; hosting belum diputuskan (Q23).
- Keputusan: Tabel `rate_limit` (fixed window) dengan key per identifier (`login:id:<mode>:<identifier>`) dan per IP. Identifier yang tidak terdaftar juga dihitung.
- Konsekuensi: Satu query tambahan per login. IP diambil dari `x-forwarded-for`, yang hanya bisa dipercaya di belakang proxy yang menimpanya; perlu ditinjau saat hosting dipilih.

### ADR-010: Akses Laporan Data sementara hanya untuk Owner
- Tanggal: 2026-10-04
- Status: PROPOSED (sementara, menunggu Q13)
- Konteks: Navigasi Sprint 2 butuh keputusan siapa yang melihat Laporan Data.
- Keputusan sementara: `laporan-data:access` hanya SUPER_ADMIN (prinsip least privilege). Dibuka untuk Pengawas cukup dengan menambah role di `src/lib/auth/permissions.ts`.

### ADR-011: Zona waktu tampilan eksplisit
- Tanggal: 2026-10-04
- Status: PROPOSED (nilai menunggu Q22)
- Konteks: `Intl.DateTimeFormat` tanpa `timeZone` memakai zona server; di hosting umumnya UTC sehingga jam meleset 7–9 jam (ditemukan di daftar Pengawas).
- Keputusan: Semua format tanggal lewat `src/lib/format.ts` dengan `APP_TIME_ZONE` (env, default sementara `Asia/Jakarta`). DB tetap UTC (`timestamptz`).

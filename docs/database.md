# Database

> Status: **Draft**. Entitas di bawah diturunkan dari PRD. Field bertanda ⛔ menunggu open question.
> Diperbarui setiap ada migrasi. Catat nama migrasi di tabel Riwayat Migrasi.

## Konvensi
- Primary key: UUID dibuat client (ADR-004).
- Setiap tabel bisnis: `created_at`, `updated_at`, `created_by`. Idempotency = primary key UUID dari client (ADR-004), tanpa kolom terpisah.
- Hapus data bisnis = soft delete (`deleted_at`); query wajib menyaring `deleted_at IS NULL`.
- Tanggal tanpa jam (mis. tanggal laporan) memakai kolom `DATE`; konversi lewat `dateToISO()`.
- Foto **tidak** disimpan sebagai blob di DB (PRD storage §12.2).
- Semua kolom waktu `timestamptz` (`@db.Timestamptz(3)`), disimpan dalam UTC. Konversi ke zona waktu lokal dilakukan di UI (Q22).
- Nama tabel/kolom snake_case (`@@map` / `@map`), model Prisma PascalCase/camelCase.

## Entitas Awal

| Entitas | Field utama (PRD) | Catatan |
|---|---|---|
| `user` | role (`SUPER_ADMIN`/`PENGAWAS`), email/username (lowercase), password_hash, kode_pengawas (uppercase), pin_hash, is_active, last_login_at, created_by | §10, §12 ✅ |
| `session` | id = SHA-256 token, user_id, expires_at, user_agent | ADR-002 ✅ |
| `rate_limit` | key, count, window_start, locked_until | ADR-009 ✅ |
| ~~`operator`~~ | — | Tidak dibuat: operator = teks bebas (ADR-014) |
| `unit` | id, name (unik, huruf besar), is_active, sort_order | ADR-014 ✅ (seed 6 unit) |
| `laporan_kerja` | id (client UUID), tanggal (DATE), unit_id, operator_name, hm_jam DECIMAL(4,1), bbm DECIMAL(6,1) (CHECK ≥ 0), lokasi, deskripsi, supervisor_id, created_by, updated_by, deleted_at | §14, ADR-014/016 ✅ — tanpa status/approved_by |
| `order_spare_part` | id (client UUID), unit_id, part_name, kerusakan, lokasi, supervisor_id, created_by, updated_by, created_at, updated_at, deleted_at | §15, ADR-016 ✅ — **tanpa status** |
| `planning_job` | pengawas_id, nama_pekerjaan, lokasi, deskripsi, estimasi_mulai, status, created_by | §16; status ⛔ Q11 |
| `photo` | id (client UUID), module (`LAPORAN_KERJA`/`ORDER_SPARE_PART`/`PLANNING_JOB`), record_id, storage_path, mime_type, size_bytes, width, height, sha256, sort_order, retention_status (`KEEP`/`ACTIVE`/`ARCHIVED`/`DELETE_PENDING`/`DELETED`), uploaded_by, uploaded_at, deleted_at | §39.2, §39.7; ADR-015 ✅ (menggantikan rencana `photo_file`/`photo_attachment` ADR-003) |
| `audit_log` | user_id, action, detail (JSON, tanpa credential), result, error_id, created_at | §26, §12.11 ✅ |
| `setting` | storage_quota_bytes, dll. | Q20 |

## Riwayat Migrasi
| Tanggal | Migrasi | Perubahan | Story |
|---|---|---|---|
| 2026-10-01 | `20261001000000_init` | Tabel `user`, `session`, `audit_log`, `setting`; enum `Role`, `AuditResult`. Dibuat dengan `prisma migrate diff`. | US-0.3 |
| 2026-10-05 | `20261005072549_order_spare_part_bbm_qty` | `laporan_kerja.bbm` → DECIMAL(6,1), CHECK 1–6 diganti ≥ 0; tabel `order_spare_part` | ADR-016, US-4.1 |
| 2026-10-05 | `20261005065344_laporan_kerja` | Tabel `unit` (+ seed 6 unit), `laporan_kerja` (+ CHECK bbm 1–6, hm ≥ 0), `photo`; enum `PhotoModule`, `RetentionStatus` | US-3.1, US-3.2 |
| 2026-10-03 | `20261001000000_init` (revisi sebelum pertama kali diterapkan) | Tambah `rate_limit` dan `user.last_login_at`; hapus `user.failed_login_count`/`locked_until` (diganti `rate_limit`). Diterapkan ke DB lokal. | US-1.7 |

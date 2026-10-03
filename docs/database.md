# Database

> Status: **Draft**. Entitas di bawah diturunkan dari PRD. Field bertanda ⛔ menunggu open question.
> Diperbarui setiap ada migrasi. Catat nama migrasi di tabel Riwayat Migrasi.

## Konvensi
- Primary key: UUID dibuat client (ADR-004).
- Setiap tabel bisnis: `created_at`, `updated_at`, `created_by`, `idempotency_key` (unique).
- Foto **tidak** disimpan sebagai blob di DB (PRD storage §12.2).
- Semua kolom waktu `timestamptz` (`@db.Timestamptz(3)`), disimpan dalam UTC. Konversi ke zona waktu lokal dilakukan di UI (Q22).
- Nama tabel/kolom snake_case (`@@map` / `@map`), model Prisma PascalCase/camelCase.

## Entitas Awal

| Entitas | Field utama (PRD) | Catatan |
|---|---|---|
| `user` | role (`SUPER_ADMIN`/`PENGAWAS`), email/username (lowercase), password_hash, kode_pengawas (uppercase), pin_hash, is_active, last_login_at, created_by | §10, §12 ✅ |
| `session` | id = SHA-256 token, user_id, expires_at, user_agent | ADR-002 ✅ |
| `rate_limit` | key, count, window_start, locked_until | ADR-009 ✅ |
| `operator` | nama | ⛔ Q3 |
| `unit` | nama (PASKAM 1–4, DUMP, TOWING) | ⛔ Q4 enum vs tabel |
| `laporan_kerja` | tanggal, unit_id, operator_id, supervisor_id, created_by, approved_by, hm, bbm, lokasi, deskripsi, status | §14; status ⛔ Q1 |
| `order_spare_part` | unit_id, nama_part, deskripsi_kerusakan, lokasi, status, created_by | §15; status ⛔ Q8 |
| `planning_job` | pengawas_id, nama_pekerjaan, lokasi, deskripsi, estimasi_mulai, status, created_by | §16; status ⛔ Q11 |
| `photo_file` | storage_path, hash, file_size, mime_type, uploaded_at, retention_status (`KEEP`/`ACTIVE`/`ARCHIVED`/`DELETE_PENDING`/`DELETED`), deleted_at | §12.2, §12.7; ADR-003 |
| `photo_attachment` | photo_file_id, module, record_id | ADR-003 |
| `audit_log` | user_id, action, detail (JSON, tanpa credential), result, error_id, created_at | §26, §12.11 ✅ |
| `setting` | storage_quota_bytes, dll. | Q20 |

## Riwayat Migrasi
| Tanggal | Migrasi | Perubahan | Story |
|---|---|---|---|
| 2026-10-01 | `20261001000000_init` | Tabel `user`, `session`, `audit_log`, `setting`; enum `Role`, `AuditResult`. Dibuat dengan `prisma migrate diff`. | US-0.3 |
| 2026-10-03 | `20261001000000_init` (revisi sebelum pertama kali diterapkan) | Tambah `rate_limit` dan `user.last_login_at`; hapus `user.failed_login_count`/`locked_until` (diganti `rate_limit`). Diterapkan ke DB lokal. | US-1.7 |

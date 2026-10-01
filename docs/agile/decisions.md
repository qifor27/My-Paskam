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
- Status: PROPOSED
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

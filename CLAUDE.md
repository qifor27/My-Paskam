# CLAUDE.md — My PASKAM

Aplikasi operasional lapangan (Web + PWA, mobile-first) untuk Laporan Kerja, Order Spare Part, Planning Job, dokumentasi foto, dan Laporan Data.

## Source of Truth

| Topik | Dokumen |
|---|---|
| Requirement produk | [`docs/PRD.md`](docs/PRD.md) |
| Gap & open questions | [`docs/prd-analysis.md`](docs/prd-analysis.md) |
| Arsitektur | [`docs/architecture.md`](docs/architecture.md) |
| Skema data | [`docs/database.md`](docs/database.md) |
| UI / design system | [`docs/design-system.md`](docs/design-system.md) |
| Keamanan | [`docs/security.md`](docs/security.md) |
| Backlog / sprint / keputusan | [`docs/agile/`](docs/agile/) |
| Dokumentasi per fitur | [`docs/features/`](docs/features/) |
| Riwayat perubahan | [`CHANGELOG.md`](CHANGELOG.md) |

Baca hanya dokumen yang relevan dengan task (PRD §34, token efficiency).

## Aturan Kerja (ringkas dari PRD §32)

1. Ikuti PRD. **Jangan membuat business rule sendiri**: jika aturan belum ada, cek `docs/agile/decisions.md`. Jika tetap tidak ada, berhenti dan tanyakan, lalu catat jawabannya sebagai ADR.
2. Kerjakan secara incremental, satu user story per task. Jangan mengubah file yang tidak terkait.
3. Setiap fitur wajib memiliki state loading / success / empty / validation / network / server / permission error, retry yang aman, dan **input user tidak boleh hilang** saat gagal.
4. Otorisasi selalu di server. Tidak ada credential plaintext. Retry tidak boleh membuat duplikat (idempotency key + client UUID).
5. UI: biru = struktur, oranye = aksi; glassmorphism hanya aksen; Lucide Icons; hindari pola AI-slop (PRD §4).
6. Sebelum selesai: typecheck, lint, test, dan build harus lulus.

## Aturan Dokumentasi (WAJIB setiap pengembangan)

Task **belum selesai** sebelum dokumentasi diperbarui. Untuk setiap perubahan:

| Jenis perubahan | Dokumen yang wajib diperbarui |
|---|---|
| Semua perubahan yang terlihat user / fungsional | `CHANGELOG.md` bagian `[Unreleased]` |
| Fitur / user story baru | `docs/features/<modul>.md` (salin dari `_TEMPLATE.md`) + centang story di `docs/agile/product-backlog.md` |
| Perubahan skema DB / migrasi | `docs/database.md` |
| Perubahan auth, permission, upload, atau data sensitif | `docs/security.md` |
| Komponen UI baru / token warna / pola | `docs/design-system.md` |
| Perubahan struktur, layanan, atau dependency baru | `docs/architecture.md` |
| Keputusan teknis atau jawaban business rule | ADR baru di `docs/agile/decisions.md` |
| Progres sprint | Log harian/akhir di `docs/agile/sprint.md` |

Laporan akhir setiap task harus menyebut dokumen mana yang diperbarui, atau alasan tidak ada yang perlu diperbarui.

## Definition of Done

Lihat PRD §31. Checklist yang sama ada di `docs/features/_TEMPLATE.md`.

## Commands

```bash
docker compose up -d          # PostgreSQL lokal (butuh Docker berjalan)
cp .env.example .env
npm run db:migrate            # terapkan migrasi + generate Prisma client
npm run owner:create          # buat akun Owner (tidak ada registrasi publik)
npm run db:generate           # generate client saja (output: src/generated/prisma)
npm run dev                   # http://localhost:3000, referensi UI di /dev/ui
npm run check                 # typecheck + lint + test + build — wajib lulus sebelum task selesai
npm test -- src/lib/sync      # jalankan test tertentu
```

Stack terpasang: Next.js 16 (App Router, Turbopack), React 19, TypeScript 6, Tailwind 4 (token di `src/app/globals.css`), Prisma 7 + `@prisma/adapter-pg`, Zod 4, Vitest 5, Lucide.
Pola mutasi: server action di `actions.ts` per route, dibungkus `runAction` + `requirePermission` + `parseForm` + `audit` (lihat `docs/architecture.md`). Form client memakai `useServerAction`.
Menu & izin halaman: tambah modul di `src/lib/navigation.ts` + permission di `src/lib/auth/permissions.ts`. Format tanggal hanya lewat `src/lib/format.ts`.
Parameter auth sementara (PIN, lockout, durasi sesi) hanya di `src/lib/auth/config.ts`.
Catatan Prisma 7: URL DB ada di `prisma.config.ts`, bukan di `schema.prisma`; import client dari `@/generated/prisma/client`, dan akses DB hanya lewat `src/lib/db.ts` (server-only).

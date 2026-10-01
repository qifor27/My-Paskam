# Arsitektur

> Status: **Draft** (Sprint 0). Diperbarui setiap ada perubahan struktur, layanan, atau dependency.

## Gambaran

```text
[ HP / Desktop (PWA) ]
  ├── UI Next.js (App Router, React)
  ├── IndexedDB: draft + sync queue + upload queue
  └── Service Worker: cache aset & offline shell
          │  HTTPS (cookie session httpOnly)
          ▼
[ Server Next.js ]
  ├── Route handlers / server actions
  ├── Auth & authorization (server-side)
  ├── Validasi (schema bersama client/server)
  ├── Idempotency check
  └── Logger + error ID
          │
    ┌─────┴──────────┐
    ▼                ▼
[ PostgreSQL ]   [ Supabase Storage (bucket privat) ]
  via Prisma        diakses melalui signed URL
```

## Stack (PRD §35)
| Lapisan | Pilihan | Status |
|---|---|---|
| Frontend | Next.js, TypeScript, Tailwind, shadcn/ui, Lucide | Ditetapkan PRD |
| DB | PostgreSQL + Prisma | Ditetapkan PRD |
| Storage foto | Supabase Storage | Ditetapkan PRD §12 storage |
| Auth | Custom session | ADR-002 (PROPOSED) |
| Hosting | ? | Q23 |
| Monitoring | ? | Q23 |

## Struktur Folder

```text
prisma/
  schema.prisma          # skema DB (Prisma 7)
  migrations/            # migrasi SQL, di-commit
prisma.config.ts         # URL DB + lokasi migrasi
src/
  app/                   # route Next.js (App Router)
    globals.css          # design token Tailwind (@theme)
    dev/ui/              # referensi komponen, 404 di produksi
  components/ui/         # komponen dasar (shadcn-style)
  lib/
    db.ts                # Prisma client (server-only)
    logger.ts            # log JSON + redaksi credential
    errors/              # AppError, kategori, pesan user, toPublicError
    sync/                # client UUID, status sinkronisasi
  generated/prisma/      # hasil prisma generate (di-gitignore)
docs/                    # dokumentasi (lihat CLAUDE.md)
```

Konvensi: test berada di samping kode (`*.test.ts`). Alias import `@/` → `src/`.

## Alur Data Offline (PRD §19, §25)
`DRAFT → PENDING_SYNC → SYNCING → SYNCED`, gagal → `SYNC_FAILED → RETRY`.
Setiap record membawa UUID client + idempotency key (ADR-004).

## Dependency
| Package | Alasan | Ditambahkan |
|---|---|---|
| next, react, react-dom | Framework (PRD §35) | Sprint 0 |
| tailwindcss, @tailwindcss/postcss | Styling (PRD §35) | Sprint 0 |
| class-variance-authority, clsx, tailwind-merge, @radix-ui/react-slot | Pola komponen shadcn/ui | Sprint 0 |
| lucide-react | Icon system (PRD §5) | Sprint 0 |
| zod | Validasi schema client + server | Sprint 0 |
| prisma, @prisma/client, @prisma/adapter-pg | ORM PostgreSQL (PRD §35). Dipasang di 7.10.0 karena tag `latest` npm menunjuk ke 8.0 RC | Sprint 0 |
| server-only | Mencegah kode DB masuk bundle browser | Sprint 0 |
| typescript, eslint, eslint-config-next, vitest | Typecheck, lint, test (PRD §31) | Sprint 0 |

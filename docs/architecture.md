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
    login/               # halaman + server action login/logout
    (app)/               # area setelah login; layout memanggil requireUser()
      pengawas/          # manajemen Pengawas (Owner)
    dev/ui/              # referensi komponen, 404 di produksi
  components/            # komponen aplikasi (ErrorAlert, PageHeader, ...)
    ui/                  # komponen dasar (shadcn-style)
  hooks/                 # hook client (useServerAction)
  lib/
    action.ts            # runAction + parseForm untuk server action
    audit.ts             # tulis audit_log
    auth/                # config, password (scrypt), session, permissions, rate limit, validasi
    request.ts           # IP & user agent dari header
    db.ts                # Prisma client (server-only)
    logger.ts            # log JSON + redaksi credential
    errors/              # AppError, kategori, pesan user, toPublicError
    sync/                # client UUID, status sinkronisasi
  generated/prisma/      # hasil prisma generate (di-gitignore)
docs/                    # dokumentasi (lihat CLAUDE.md)
```

scripts/
  create-owner.ts        # CLI pembuatan akun Owner (npm run owner:create)

Konvensi: test berada di samping kode (`*.test.ts`). Alias import `@/` → `src/`.

## Pola Server Action
Setiap mutasi = server action di `actions.ts` milik route-nya:
`runAction(name, fn)` → di dalamnya `requirePermission()` → `parseForm(schema)` → logika → `audit()` → return data.
Hasil selalu `ActionResult` (`{ ok: true, data } | { ok: false, error: PublicError }`); action tidak pernah melempar error ke client. Di client, `useServerAction` mengubah kegagalan transport menjadi error `NETWORK`.

## Alur Autentikasi
`/login` → `login()` → cek `rate_limit` → cari user → `verifySecret` (scrypt) → `createSession` (cookie + baris `session`) → `/`.
Setiap halaman di `(app)/` memanggil `requireUser()`; sesi tidak valid → `/login?sesi=berakhir`.

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
| tsx (dev) | Menjalankan script TypeScript (`scripts/create-owner.ts`) | Sprint 1 |

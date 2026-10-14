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
| Storage foto | Supabase Storage (bucket privat, REST) — lokal: folder `storage/` | ADR-024 |
| Auth | Custom session | ADR-002 (PROPOSED) |
| Hosting | Vercel (`icn1` Seoul) + Supabase (Seoul `ap-northeast-2`) — panduan `docs/deploy.md` | ADR-024 |
| Monitoring | Belum (log Vercel saja) | Terbuka (US-8.3) |

## Struktur Folder

```text
prisma/
  schema.prisma          # skema DB (Prisma 7)
  migrations/            # migrasi SQL, di-commit
prisma.config.ts         # URL DB (DIRECT_URL untuk migrasi bila ada) + lokasi migrasi
vercel.json              # region fungsi Vercel (icn1, sama dengan region database)
public/sw.js             # service worker (naikkan VERSION bila strategi berubah)
public/icons/            # ikon PWA (any + maskable + apple-touch)
src/
  app/                   # route Next.js (App Router)
    globals.css          # design token Tailwind (@theme)
    login/               # halaman + server action login/logout
    (app)/               # area setelah login; layout memanggil requireUser()
      akun/              # profil + keluar (+ menu admin untuk Owner)
      laporan-kerja/     # daftar, baru, [id] detail, [id]/edit, actions.ts, laporan-form.tsx
      unit/              # master data unit (Owner)
      spare-part/        # daftar, baru, [id], [id]/edit, actions.ts, spare-part-form.tsx
      planning-job/      # daftar (tab), baru, [id] (+ status-actions), [id]/edit — form Owner
      laporan-data/      # gerbang PIN, tab modul, filter (GET), ringkasan; pin/ (ganti PIN)
      loading.tsx        # skeleton saat halaman dimuat
      error.tsx          # error di dalam halaman (navigasi tetap tampil)
      pengawas/          # manajemen Pengawas (Owner)
    api/foto/            # POST upload, GET [id] akses terotorisasi
    manifest.ts          # Web App Manifest
    offline/             # halaman cadangan offline (statis)
    error.tsx            # error di layout (mis. DB tidak terjangkau)
    global-error.tsx     # error di root layout
    not-found.tsx        # 404
    dev/ui/              # referensi komponen, 404 di produksi
  components/            # komponen aplikasi (ErrorAlert, PageHeader, ...)
    ui/                  # komponen dasar (shadcn-style)
  hooks/                 # hook client (useServerAction)
  lib/
    action.ts            # runAction + parseForm untuk server action
    audit.ts             # tulis audit_log
    auth/                # config, password (scrypt), session, permissions, rate limit, validasi
    request.ts           # IP & user agent dari header
    navigation.ts        # daftar menu + filter per role (satu sumber untuk nav & dashboard)
    format.ts            # format tanggal (zona aplikasi), todayISO, dayLabel, desimal
    route.ts             # handleRoute (route handler → PublicError JSON), cek Origin
    storage/             # drivers.ts (local | supabase REST, tanpa server-only) + index.ts storage() server-only
    photo/               # rules, compress (client), service (server), modules (registry per modul)
    laporan-kerja/       # schema (+ decimalField), access, queries, draft (IndexedDB)
    spare-part/          # schema, access, queries, draft, priority
    planning/            # status (meta + transisi), schema, access, queries
    laporan-data/        # filters (URL → zod), queries (agregasi per modul), pin (status gerbang), export (PDF)
    pdf/report.ts        # renderer PDF tabel (pdf-lib)
    people.ts            # recorderName: "Nama (Owner)"
    records/access.ts    # aturan kepemilikan bersama (canViewOwned / canEditOwned)
    draft-store.ts       # wrapper IndexedDB tanpa dependency
    sync/                # client UUID, status sync, draft-types, outbox (antrean kirim)
    db.ts                # Prisma client (server-only)
    logger.ts            # log JSON + redaksi credential
    errors/              # AppError, kategori, pesan user, toPublicError
  generated/prisma/      # hasil prisma generate (di-gitignore)
docs/                    # dokumentasi (lihat CLAUDE.md)
```

scripts/
  create-owner.ts        # CLI pembuatan akun Owner (npm run owner:create)
  seed-demo.ts           # data demo (npm run demo:seed [-- --reset]), lihat docs/demo.md
  demo-assets/           # foto ilustrasi untuk data demo

Konvensi: test berada di samping kode (`*.test.ts`). Alias import `@/` → `src/`.

## Pola Server Action
Setiap mutasi = server action di `actions.ts` milik route-nya:
`runAction(name, fn)` → di dalamnya `requirePermission()` → `parseForm(schema)` → logika → `audit()` → return data.
`useServerAction` menyertakan tombol submit yang ditekan ke FormData (`new FormData(form, submitter)`), sehingga satu form bisa punya beberapa aksi lewat `name`/`value` tombol (dipakai untuk status planning). Hasil selalu `ActionResult` (`{ ok: true, data } | { ok: false, error: PublicError }`); action tidak pernah melempar error ke client. Di client, `useServerAction` mengubah kegagalan transport menjadi error `NETWORK`.

## Error Boundary
| Lokasi error | Ditangkap oleh | Tampilan |
|---|---|---|
| Halaman di `(app)/` | `(app)/error.tsx` | Navigasi tetap ada |
| Layout `(app)` (cek sesi, DB mati) | `app/error.tsx` | Header + pesan |
| Root layout | `app/global-error.tsx` | Versi darurat |
Kode laporan = `error.digest`, sama dengan yang tercetak di log server.

## Alur Laporan Kerja & Foto (ADR-015)
```text
Form (client) ──pilih foto──► compress (canvas) ──XHR + progress──► POST /api/foto ──► storage + tabel photo
     │  autosave ±0,6 dtk ──► IndexedDB (isian + blob foto belum terunggah)
     └─ Simpan ──► saveLaporan(id, field, photoIds) ──► validasi + cek foto ──► upsert laporan_kerja
                                                         └─ hapus foto yang dilepas, audit, revalidate
Detail ──<img src=/api/foto/:id>──► cek izin per request ──► file (private cache)
```

### Menambah modul data lapangan baru (pola Sprint 3–4)
1. Model Prisma (id UUID client, supervisor_id, created_by, deleted_at) + migrasi.
2. `src/lib/<modul>/` : schema (zod), access (pakai `records/access`), queries, draft (store baru di `draft-store.ts`, naikkan `DB_VERSION`).
3. Daftarkan di `PHOTO_MODULES` (`src/lib/photo/modules.ts`) + enum `PhotoModule` bila memakai foto.
4. `actions.ts` (runAction → requirePermission → parseForm → assertPhotosUploaded → upsert → removeDetachedPhotos → audit).
5. Form memakai `usePhotoUploads(id, initial, module)`, `PhotoGrid`, `FormAlerts`, `StickyActionBar`; halaman memakai `LocalDrafts`, `DeleteRecord`.

## Alur Autentikasi
`/login` → `login()` → cek `rate_limit` → cari user → `verifySecret` (scrypt) → `createSession` (cookie + baris `session`) → `/`.
Setiap halaman di `(app)/` memanggil `requireUser()`; sesi tidak valid → `/login?sesi=berakhir`.

## Alur Data Offline (PRD §19, §25, ADR-019)
```text
Form ──Simpan──► validasi zod di HP ──┬─ online & foto lengkap ──► server action ──► Terkirim
                                      └─ offline / foto tertunda / gagal jaringan
                                           ▼
                         IndexedDB draft { userId, sync: queued }
                                           ▼  (app dibuka · event online · tiap 30 dtk · "Kirim sekarang")
                         SyncProvider → processOutbox(userId): unggah foto tertunda → server action
                                           ├─ ok → hapus draft (Terkirim)
                                           ├─ jaringan/server → tetap queued
                                           ├─ sesi habis → tetap queued + banner login
                                           └─ validasi/izin → failed + pesan
```
Service worker (`public/sw.js`): `/_next/static` & ikon cache-first; halaman lapangan network-first + cadangan cache; `/offline` cadangan terakhir; API/server action/foto tidak di-cache. Pesan `WARM` (pemanasan cache form) dan `CLEAR_USER_CACHE` (logout).

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

Sprint 3 tidak menambah dependency: kompresi (canvas), IndexedDB, dan upload (XHR) memakai API browser; storage lokal memakai `node:fs`.
| pdf-lib | Export PDF Laporan Data di server, pure JS (ADR-020) | 2026-10-06 |

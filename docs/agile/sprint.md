# Sprint Log

> Satu bagian per sprint. Sprint terbaru ditulis di atas.
> Diperbarui setiap kali task selesai (bagian Log), dan saat Sprint Review / Retrospective.

---

## Template

```markdown
## Sprint <n> — <Nama> (<tgl mulai> → <tgl selesai>)

**Goal:** …
**Story:** US-…, US-…

### Log
| Tanggal | Story | Perubahan | Dokumen diperbarui |
|---|---|---|---|

### Sprint Review
- Demo: …
- Feedback klien: …

### Retrospective
- Berjalan baik: …
- Perlu diperbaiki: …
- Action item: …
```

---

## Sprint 2 — Dashboard (2026-10-04)

**Goal:** Navigasi dan dashboard per role, dengan state loading/empty/error lengkap.
**Story:** US-2.1 – US-2.4

### Log
| Tanggal | Story | Perubahan | Dokumen diperbarui |
|---|---|---|---|
| 2026-10-04 | US-2.3 | Navigasi per role (`navigation.ts`), bottom nav mobile + sidebar desktop, izin per modul | `features/dashboard-navigation.md`, `security.md`, `design-system.md` |
| 2026-10-04 | US-2.1, 2.2 | Dashboard Owner & Pengawas (daftar shortcut, jumlah Pengawas aktif), placeholder 4 modul | `features/dashboard-navigation.md`, ADR-010 |
| 2026-10-04 | US-2.4 | `loading.tsx`, `error.tsx` (root & `(app)`), `global-error.tsx`, `not-found.tsx`, `EmptyState`, `NetworkBanner` | `architecture.md`, `design-system.md` |
| 2026-10-04 | — | Temuan visual: jam "terakhir masuk" bergantung zona server → `formatDateTime` + `APP_TIME_ZONE` | ADR-011 |
| 2026-10-04 | — | Temuan uji DB mati: error di layout jatuh ke `global-error` tanpa styling → tambah `app/error.tsx` | `architecture.md` |
| 2026-10-04 | — | Verifikasi visual pertama dengan Firefox headless (termasuk halaman login Sprint 1) + E2E 22 cek rute | `features/dashboard-navigation.md` |

### Catatan
- Laporan Data untuk Pengawas dan zona waktu masih SEMENTARA (Q13, Q22).
- Belum diuji di perangkat nyata; CI GitHub belum berjalan.

---

## Sprint 1 — Authentication (mulai 2026-10-03)

**Goal:** Owner dan Pengawas bisa masuk dengan aman; Owner bisa mengelola akun Pengawas.
**Story:** US-1.1 – US-1.8 (+ penutupan US-0.3, US-0.4)

### Log
| Tanggal | Story | Perubahan | Dokumen diperbarui |
|---|---|---|---|
| 2026-10-03 | US-0.3 | Docker aktif; migrasi init (direvisi: `rate_limit`, `last_login_at`) diterapkan | `database.md` |
| 2026-10-03 | US-1.1–1.4, 1.6–1.8 | Login Owner/Pengawas, sesi cookie + DB, permission, rate limit DB, audit log, CLI `owner:create` | `features/authentication.md`, `security.md`, `architecture.md`, ADR-007/008/009 |
| 2026-10-03 | US-1.5 | Halaman daftar/tambah/detail Pengawas, reset PIN, aktif/nonaktif | `features/pengawas-management.md`, `design-system.md` |
| 2026-10-03 | — | Komponen Input, Field, Alert, ErrorAlert, PageHeader, AccessDenied; hook `useServerAction` | `design-system.md` |
| 2026-10-03 | — | E2E 21 skenario terhadap server production + PostgreSQL: semua lulus. Temuan: pesan Zod bahasa Inggris → diperbaiki | `security.md` |

### Hambatan / catatan
- Parameter PIN, lockout, dan durasi sesi masih SEMENTARA (ADR-007), menunggu Q17/Q18.
- Pertanyaan baru: Q26 (format Kode Pengawas), Q27 (PIN dibuat Owner atau sistem).
- Belum diuji visual di perangkat nyata; CI GitHub belum berjalan (belum ada remote).

---

## Sprint 0 — Foundation (mulai 2026-10-01)

**Goal:** Fondasi repo, design system, DB, arsitektur auth, CI, error & offline foundation.
**Story:** US-0.1 – US-0.8

### Log
| Tanggal | Story | Perubahan | Dokumen diperbarui |
|---|---|---|---|
| 2026-10-01 | — | Analisis PRD + kerangka dokumentasi | `docs/*`, `CLAUDE.md`, `CHANGELOG.md` |
| 2026-10-01 | US-0.8 | `prd.md` → `docs/PRD.md`, git init | `CLAUDE.md`, `prd-analysis.md` |
| 2026-10-01 | US-0.1 | Next.js 16 + TS + Tailwind 4 + ESLint + Vitest, `npm run check` | `architecture.md`, `CLAUDE.md` |
| 2026-10-01 | US-0.2 | Token warna (lolos WCAG AA), Button 4 varian/6 state, halaman `/dev/ui` | `design-system.md`, ADR-005 |
| 2026-10-01 | US-0.3 | Prisma 7 + skema awal + migrasi init (belum diterapkan, Docker mati) | `database.md` |
| 2026-10-01 | US-0.5 | Workflow GitHub Actions | `CLAUDE.md` |
| 2026-10-01 | US-0.6 | `AppError`, `toPublicError`, logger dengan redaksi + test | `security.md`, ADR-006 |
| 2026-10-01 | US-0.7 | Client UUID + state machine status sync + test | `architecture.md` |

### Hambatan
- Registry npm sangat lambat (install 6–9 menit).
- Docker Desktop tidak berjalan saat itu (teratasi di Sprint 1).

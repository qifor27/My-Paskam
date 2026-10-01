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
- Docker Desktop tidak berjalan, jadi migrasi belum diterapkan ke DB lokal.
- US-0.4 menunggu persetujuan ADR-002; Sprint 1 menunggu Q16–Q18.

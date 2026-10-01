# Changelog

Semua perubahan penting pada My PASKAM dicatat di sini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/), versi mengikuti [SemVer](https://semver.org/lang/id/).

Setiap entri menyebut sprint dan story/ADR terkait, contoh: `- Login Pengawas dengan Kode + PIN (Sprint 1, US-1.2)`.

## [Unreleased]

### Added
- Analisis PRD: gap, open questions, risiko, dan usulan roadmap (`docs/prd-analysis.md`).
- Kerangka dokumentasi: `CLAUDE.md`, `docs/` (architecture, database, design-system, security), `docs/agile/` (backlog, sprint, decisions), template dokumentasi fitur.
- Proyek Next.js 16 + TypeScript + Tailwind 4 + ESLint + Vitest, dengan perintah `npm run check` (Sprint 0, US-0.1).
- Design token biru/oranye (WCAG AA) dan komponen `Button` dengan state loading/disabled/focus/pressed (Sprint 0, US-0.2).
- Prisma 7: skema `user`, `session`, `audit_log`, `setting` + migrasi awal (Sprint 0, US-0.3).
- Workflow CI GitHub Actions (Sprint 0, US-0.5).
- Fondasi error handling: kategori error, error ID `ERR-XXXXXX`, pesan user berbahasa Indonesia (Sprint 0, US-0.6, ADR-006).
- Fondasi offline: client UUID dan status sinkronisasi (Sprint 0, US-0.7, ADR-004).

### Changed
- `prd.md` dipindah ke `docs/PRD.md` (US-0.8).

### Fixed

### Security
- Logger menyensor otomatis password, PIN, token, session, dan cookie (US-0.6).

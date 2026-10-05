# Product Backlog

> Diturunkan dari PRD §37 + usulan di `docs/prd-analysis.md` §5.
> Format: `US-<sprint>.<n>`. Centang `[x]` saat memenuhi Definition of Done, lalu tautkan dokumen fiturnya.
> ⛔ = diblokir open question (lihat `docs/prd-analysis.md` §3).

## Sprint 0 — Foundation
- [x] US-0.1 Inisialisasi repo, Next.js + TypeScript + Tailwind + shadcn/ui + Lucide
- [x] US-0.2 Design token (biru/oranye), komponen Button lengkap 6 state (PRD §8)
- [x] US-0.3 Setup PostgreSQL + Prisma + migrasi awal (diterapkan 2026-10-03)
- [x] US-0.4 Arsitektur auth (session) — ADR-002 (diimplementasikan, status ADR masih PROPOSED)
- [ ] US-0.5 CI: typecheck, lint, test, build — `npm run check` lulus lokal; workflow GitHub belum pernah jalan (belum ada remote)
- [x] US-0.6 Fondasi error handling: kategori error, error ID, logger tanpa data sensitif (PRD §21, §26)
- [x] US-0.7 Fondasi offline: client UUID + status sync (ADR-004). Kolom idempotency dibuat bersama tabel modul di Sprint 3
- [x] US-0.8 Pindahkan `prd.md` → `docs/PRD.md`

## Sprint 1 — Authentication
> Dokumen: [authentication.md](../features/authentication.md), [pengawas-management.md](../features/pengawas-management.md)
- [x] US-1.1 Login Owner (email/username + password)
- [x] US-1.2 Login Pengawas (Kode + PIN) — parameter PIN SEMENTARA, menunggu Q17
- [x] US-1.3 Halaman `/login` dengan toggle PENGAWAS / OWNER
- [x] US-1.4 Session + expiry handling — durasi SEMENTARA, menunggu Q18
- [x] US-1.5 Manajemen Pengawas: tambah, edit, aktif/nonaktif, reset PIN — format kode/PIN menunggu Q26, Q27
- [x] US-1.6 Permission foundation (server-side) — aturan visibilitas data (Q16) ditambahkan di Sprint 3
- [x] US-1.7 Rate limit + brute-force protection
- [x] US-1.8 Audit log dasar

## Sprint 2 — Dashboard
> Dokumen: [dashboard-navigation.md](../features/dashboard-navigation.md)
- [x] US-2.1 Dashboard Owner
- [x] US-2.2 Dashboard Pengawas (shortcut modul; Laporan Data sementara hanya Owner, Q13)
- [x] US-2.3 Navigasi mobile (bottom nav) + desktop (sidebar)
- [x] US-2.4 Loading/empty/error state (termasuk error boundary root/layout/halaman dan 404)

## Sprint 3 — Laporan Kerja
> Dokumen: [laporan-kerja.md](../features/laporan-kerja.md), [unit-management.md](../features/unit-management.md) · Aturan: ADR-014
- [x] US-3.1 Master data Unit (Owner) — operator = teks bebas (ADR-014)
- [x] US-3.2 Form Laporan Kerja (HM total jam, BBM 1–6)
- [x] US-3.3 Upload foto (kamera/galeri, kompresi, preview, progress, retry)
- [x] ~~US-3.4 Status & approval~~ — dibatalkan: tidak perlu (ADR-014)
- [x] US-3.5 Draft offline (IndexedDB)
- [x] US-3.6 List, detail, edit, hapus

## Sprint 4 — Order Spare Part
> Dokumen: [order-spare-part.md](../features/order-spare-part.md) · Aturan: ADR-016
- [x] US-4.1 Form + foto (dokumentasi spare part rusak)
- [x] ~~US-4.2 Status flow~~ — dibatalkan: tidak ada status order (ADR-016)
- [x] US-4.3 List, detail, edit, hapus

## Sprint 5 — Planning Job
- [ ] US-5.1 Form planning ⛔ Q10, Q12
- [ ] US-5.2 List & status ⛔ Q11

## Sprint 6 — Laporan Data
- [ ] US-6.1 Filter tanggal/unit/Pengawas/status ⛔ Q13
- [ ] US-6.2 Export PDF ⛔ Q15
- [ ] US-6.3 PIN gate (opsional) ⛔ Q14
- [ ] US-6.4 Storage Monitoring (read-only) ⛔ Q20

## Sprint 7 — PWA & Offline
- [ ] US-7.1 Manifest + installability
- [ ] US-7.2 Service worker + offline cache
- [ ] US-7.3 Sync queue + upload queue + retry
- [ ] US-7.4 Indikator status jaringan & status sync
- [ ] US-7.5 Proteksi duplikat (server-side)

## Sprint 8 — Production Hardening
- [ ] US-8.1 Security & authorization review
- [ ] US-8.2 Upload security
- [ ] US-8.3 Error monitoring ⛔ Q23
- [ ] US-8.4 Photo Cleanup + retention status + re-auth ⛔ Q21
- [ ] US-8.5 Performance, aksesibilitas, review PWA
- [ ] US-8.6 Backup & deployment produksi ⛔ Q24

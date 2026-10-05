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

## Sprint 6 — Laporan Data (2026-10-05)

**Goal:** Owner melihat data semua modul dengan filter, dilindungi PIN tambahan.
**Story:** US-6.1, US-6.3 (US-6.2 PDF ditunda)

### Log
| Tanggal | Story | Perubahan | Dokumen diperbarui |
|---|---|---|---|
| 2026-10-05 | — | Jawaban Owner Q13–Q15 (semua modul, PDF ditunda, hanya Owner, PIN perlu) | ADR-018, ADR-010 |
| 2026-10-05 | US-6.3 | Migrasi PIN; buat/ganti PIN (re-auth password), buka 15 menit per sesi, kunci manual, lockout, audit | `security.md`, `database.md` |
| 2026-10-05 | US-6.1 | Filter dari URL (zod, fallback aman), agregasi per modul, tab modul, panel filter, ringkasan, tabel/daftar | `features/laporan-data.md`, `design-system.md`, `architecture.md` |
| 2026-10-05 | — | Verifikasi: 57 unit test; E2E S1 21 + S2 19 + S3 32 + S4 23 + S5 26 + S6 24 = **145 cek** (dihitung dari output) lulus; buka PIN interaktif lulus | — |

### Catatan
- Tafsiran menunggu konfirmasi: PIN milik akun Owner, durasi 15 menit, default rentang bulan berjalan.

---

## Sprint 5 — Planning Job (2026-10-05)

**Goal:** Owner membuat planning untuk Pengawas; Pengawas memulai & menyelesaikan pekerjaan. Tambahan field spare part.
**Story:** US-5.1, US-5.2, US-4.4

### Log
| Tanggal | Story | Perubahan | Dokumen diperbarui |
|---|---|---|---|
| 2026-10-05 | — | Jawaban Owner Q9–Q12 | ADR-017, `prd-analysis.md` |
| 2026-10-05 | — | Migrasi: kolom spare part (jumlah, prioritas, nomor part) + tabel `planning_job` | `database.md` |
| 2026-10-05 | US-4.4 | Form/detail/daftar spare part: `QuantityInput`, chip prioritas, `PriorityBadge` | `features/order-spare-part.md`, `design-system.md` |
| 2026-10-05 | US-5.1, 5.2 | Status + transisi per role, form Owner, daftar ber-tab, detail + tombol status, "Planning untuk Anda" di Beranda | `features/planning-job.md`, `security.md`, `architecture.md` |
| 2026-10-05 | — | `useServerAction`: `clearFieldError` + FormData dengan submitter | `architecture.md` |
| 2026-10-05 | — | Temuan visual: judul planning terpotong di Beranda → judul 2 baris, badge di baris keterangan | `design-system.md` |
| 2026-10-05 | — | Verifikasi: 52 unit test; E2E S1 (21) + S2 (19) + S3 (32) + S4 (23) + S5 (26) = 121 cek lulus (dihitung dari output); alur status interaktif lulus | — |

### Catatan
- Tafsiran menunggu konfirmasi: pilihan prioritas, nomor part opsional, aturan siapa mengubah status, visibilitas planning.

---

## Sprint 4 — Order Spare Part (2026-10-05)

**Goal:** Pengawas mendokumentasikan spare part yang rusak beserta foto; Owner melihat semua.
**Story:** US-4.1, US-4.3 (US-4.2 dibatalkan) + perubahan BBM dari Sprint 3

### Log
| Tanggal | Story | Perubahan | Dokumen diperbarui |
|---|---|---|---|
| 2026-10-05 | — | Jawaban Owner: BBM = jumlah; HM 24, foto 6, operator teks dikonfirmasi; spare part tanpa status | ADR-016, ADR-014 |
| 2026-10-05 | — | Migrasi: BBM DECIMAL(6,1) ≥ 0; tabel `order_spare_part` | `database.md` |
| 2026-10-05 | — | BBM di form/detail/daftar menjadi input jumlah (`decimalField` bersama HM) | `features/laporan-kerja.md` |
| 2026-10-05 | — | Generalisasi foto per modul (registry), akses kepemilikan bersama, komponen `FormAlerts`/`DeleteRecord`/`LocalDrafts` | `architecture.md`, `design-system.md`, `security.md` |
| 2026-10-05 | US-4.1, 4.3 | Form, daftar per hari, detail, edit, hapus spare part | `features/order-spare-part.md` |
| 2026-10-05 | — | Temuan uji interaktif: autosave tertunda menulis ulang draft setelah tersimpan (muncul di "Belum terkirim") → diperbaiki di kedua form | `features/laporan-kerja.md` |
| 2026-10-05 | — | Verifikasi: 44 unit test; E2E S1 (21) + S2 (19) + S3 (32) + S4 (21) lulus *(angka dikoreksi 2026-10-05 setelah dihitung ulang)*; alur interaktif spare part 3× lulus | — |

### Catatan
- Belum dijawab: Q9 kolom jumlah/prioritas/nomor part; tafsiran visibilitas & foto wajib untuk spare part.

---

## Sprint 3 — Laporan Kerja (2026-10-05)

**Goal:** Pengawas mencatat laporan kerja lengkap dengan foto dari HP; Owner memantau semua.
**Story:** US-3.1 – US-3.6

### Log
| Tanggal | Story | Perubahan | Dokumen diperbarui |
|---|---|---|---|
| 2026-10-05 | — | Jawaban Owner Q1–Q7 & Q16 dicatat | ADR-014, `prd-analysis.md` |
| 2026-10-05 | US-3.1, 3.2 | Migrasi `unit` (+seed), `laporan_kerja`, `photo`; izin baru | `database.md`, `security.md` |
| 2026-10-05 | US-3.3 | Storage driver, `POST/GET /api/foto`, kompresi client, `usePhotoUploads`, `PhotoGrid` | ADR-015, `architecture.md`, `design-system.md` |
| 2026-10-05 | US-3.2, 3.5 | Form Laporan Kerja + draft IndexedDB + "Belum terkirim" di daftar | `features/laporan-kerja.md` |
| 2026-10-05 | US-3.6 | Daftar per hari, detail, edit (ganti foto), hapus (soft delete); aktivitas terbaru di Beranda | `features/laporan-kerja.md`, `features/dashboard-navigation.md` |
| 2026-10-05 | US-3.1 | Halaman Unit (Owner) | `features/unit-management.md` |
| 2026-10-05 | — | Temuan: path storage membuat seluruh proyek ter-trace saat build → diperbaiki | `security.md` |
| 2026-10-05 | — | Temuan (uji interaktif Puppeteer + Firefox): error field tidak hilang setelah diperbaiki → diperbaiki | `design-system.md` |
| 2026-10-05 | — | Verifikasi: 41 unit test; E2E S1 (21) + S2 (19) + S3 (32) lulus *(angka dikoreksi 2026-10-05 setelah dihitung ulang)*; alur interaktif (isi form, upload foto, simpan, sheet Buat baru) lulus | — |

### Catatan
- Nilai SEMENTARA: HM maks. 24 jam, maks. 6 foto; tafsiran: operator teks bebas, BBM 1–6 (satuan?).
- Belum: uji kamera di HP nyata; driver Supabase (Q23); cleanup foto yatim (Sprint 8).

---

## UI Refresh — sebelum Sprint 3 (2026-10-05)

**Goal:** UI modern dan konsisten sebelum modul data dibangun.

### Log
| Tanggal | Perubahan | Dokumen diperbarui |
|---|---|---|
| 2026-10-05 | Riset UI/UX (4 topik paralel) → laporan + catatan | `docs/research/` |
| 2026-10-05 | Audit kontras: teks status/error/placeholder dinaikkan; warning jadi kuning; label seksi sentence case; fallback reduced-transparency; Inter self-hosted | ADR-012 |
| 2026-10-05 | Owner memilih gaya referensi: biru utama (pill gradien), oranye aksen (FAB "+"), ikon pastel, tanpa maskot/emoji | ADR-013 |
| 2026-10-05 | Rombak token + semua komponen (Button, Input, Card, StatusBadge, Alert, PageHeader, EmptyState, ModuleTile, BrandMark, Avatar, CreateSheet), login, Beranda, Akun, nav mobile/desktop, halaman Pengawas | `design-system.md` (ditulis ulang), `features/dashboard-navigation.md`, `architecture.md`, CLAUDE.md |
| 2026-10-05 | Verifikasi: 30 unit test, E2E Sprint 1 (21) + Sprint 2 (±19 cek) lulus *(angka dikoreksi 2026-10-05 setelah dihitung ulang)*; screenshot mobile & desktop | — |

### Catatan
- Sheet "Buat baru" belum terverifikasi visual (screenshot headless tidak bisa mengklik); diuji manual di perangkat.
- Docker Desktop sempat mati: aplikasi menampilkan error yang benar (UNEXPECTED + kode laporan).

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
| 2026-10-04 | — | Verifikasi visual pertama dengan Firefox headless (termasuk halaman login Sprint 1) + E2E ±18 cek rute *(angka dikoreksi 2026-10-05 setelah dihitung ulang)* | `features/dashboard-navigation.md` |

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

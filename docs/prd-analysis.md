# Analisis PRD My PASKAM

> Sumber: [`docs/PRD.md`](PRD.md) · Dianalisis: 2026-10-01
> Tujuan: menemukan gap, inkonsistensi, dan keputusan yang harus diambil **sebelum** sprint terkait dimulai.
> Jawaban atas setiap open question dicatat di [`agile/decisions.md`](agile/decisions.md).

---

## 1. Ringkasan

| Aspek | Isi PRD |
|---|---|
| Produk | Aplikasi operasional lapangan (Web + PWA), mobile-first |
| Role MVP | `SUPER_ADMIN` (Owner), `PENGAWAS` |
| Modul inti | Dashboard, Laporan Kerja, Order Spare Part, Planning Job, Laporan Data, Storage Management |
| Fitur lintas modul | Dokumentasi foto, offline/sync, error handling, audit log |
| Stack | Next.js + TypeScript + Tailwind + shadcn/ui + Lucide, PostgreSQL + Prisma, Supabase Storage |
| Proses | Agile, sprint 1–2 minggu, 9 sprint (Sprint 0–8) |

Kekuatan PRD: sangat jelas di **UX, error handling, keamanan data saat gagal, dan idempotensi sync**. Kelemahan utama: **aturan bisnis per modul (status, approval, visibilitas data) belum didefinisikan**, padahal PRD §32 melarang Claude Code membuat business rule sendiri.

---

## 2. Inkonsistensi Struktural

| # | Temuan | Lokasi | Rekomendasi |
|---|---|---|---|
| S1 | Bagian Storage Management diberi nomor **"## 12"** dan subbagian 12.1–12.14, padahal §12 sudah dipakai untuk User Management. Letaknya setelah §38. | Akhir PRD | Ganti menjadi **§39 Storage Management & Photo Retention** (39.1–39.14). |
| S2 | Level heading campur (`###` untuk §1, `#` untuk §2–38, `##` untuk §12 storage). | Seluruh PRD | Seragamkan: `#` judul dokumen, `##` per bagian. |
| S3 | Istilah **Owner** vs role **`SUPER_ADMIN`** dipakai bergantian. | §10, §12 | Tetapkan: Owner = user dengan role `SUPER_ADMIN`. Tulis di glosarium. |
| S4 | Supabase Storage baru muncul di §12 storage, tidak ada di Tech Stack §35 ("Object storage"). Auth disebut "secure session-based" tanpa menyebut apakah memakai Supabase Auth atau custom. | §35, §12.1 | Putuskan di ADR: hosting DB (Supabase Postgres?), auth (custom session vs Supabase Auth). |
| S5 | Struktur folder §36 memakai `my-paskam/` dan `docs/PRD.md`, sedangkan repo saat ini `paskam/` dengan `prd.md` di root. | §36 | Pindahkan `prd.md` → `docs/PRD.md` saat repo di-init (lihat ADR-000). ✅ Selesai |
| S6 | Roadmap §37 tidak memuat Storage Management (§12 storage). | §37 | Tambahkan ke Sprint 6 atau 8 (lihat §5 di bawah). |

---

## 3. Gap Business Rule (BLOCKER sebelum sprint terkait)

Pertanyaan ini **harus dijawab Owner/klien**. Claude Code tidak boleh mengasumsikan jawabannya (PRD §32.2).

### Laporan Kerja (Sprint 3) — ✅ dijawab 2026-10-05, lihat ADR-014
- **Q1. Nilai status apa saja?** (mis. `DRAFT → SUBMITTED → APPROVED / REJECTED`?) Status data bisnis ini berbeda dari status sync (§25).
- **Q2. Alur approval:** ada field `approved_by`, tetapi siapa yang approve dan kapan tidak dijelaskan. Apakah Owner wajib approve setiap laporan?
- **Q3. Operator itu apa?** `operator_id` berarti Operator adalah entitas, tetapi tidak ada manajemen Operator. Apakah Operator adalah master data (bukan user login)? Siapa yang mengelolanya?
- **Q4. Unit** (PASKAM 1–4, DUMP, TOWING): enum tetap atau master data yang bisa ditambah Owner?
- **Q5. Satuan HM dan BBM:** HM berupa angka meter awal/akhir atau total jam? BBM dalam liter?
- **Q6. Edit/hapus:** bolehkah Pengawas mengedit atau menghapus laporan setelah submit/approve?
- **Q7. Foto:** berapa jumlah minimum/maksimum foto per laporan? Apakah wajib?

### Order Spare Part (Sprint 4)
- **Q8. Status flow?** (mis. `DIAJUKAN → DIPROSES → DIPESAN → DITERIMA / DITOLAK`?) Siapa yang boleh mengubah status?
- **Q9.** Perlu field jumlah (qty), prioritas/urgensi, atau nomor part?

### Planning Job (Sprint 5)
- **Q10. Siapa yang membuat?** Owner menugaskan ke Pengawas, atau Pengawas membuat sendiri?
- **Q11. Status flow?** Apakah Planning Job bisa dikonversi menjadi Laporan Kerja setelah selesai?
- **Q12.** Perlu estimasi selesai atau unit terkait?

### Laporan Data (Sprint 6)
- **Q13. Visibilitas:** apakah Laporan Data hanya untuk Owner, atau Pengawas juga bisa melihat data miliknya sendiri?
- **Q14. PIN gate "jika diperlukan":** PIN milik siapa (PIN Owner terpisah)? Diputuskan ya/tidak?
- **Q15. Isi PDF:** kolom apa saja, apakah foto disertakan, perlu kop perusahaan, orientasi kertas?

### Visibilitas & Otorisasi (Sprint 1)
- **Q16.** ✅ (ADR-014, untuk Laporan Kerja) Pengawas hanya melihat miliknya, Owner semua. Apakah Pengawas bisa melihat laporan/order/planning **milik Pengawas lain**? (Menentukan aturan otorisasi dan akses foto §12.12.)
- **Q17. Kebijakan PIN:** panjang (6 digit?), lockout setelah berapa kali gagal, berapa lama?
- **Q18. Durasi sesi** Owner dan Pengawas? Apakah Pengawas tetap login berhari-hari di HP lapangan?
- **Q19. Offline + sesi:** jika sesi habis saat offline, apakah draft tetap bisa dibuat? (Disarankan: ya, sync menunggu login ulang.)

### Manajemen Pengawas (muncul di Sprint 1)
- **Q26. Format Kode Pengawas:** diketik Owner (saat ini: 3–20 karakter, huruf/angka/-) atau dibuat otomatis berurutan (SPV001, SPV002, …)?
- **Q27. PIN awal/reset:** diketik Owner (saat ini) atau dibuat acak oleh sistem dan ditampilkan sekali? Apakah Pengawas wajib mengganti PIN saat pertama login?

### Storage (Sprint 6/8)
- **Q20.** Kapasitas total storage diambil dari mana? (API Supabase tidak menyediakan kuota paket. Disarankan: dikonfigurasi Owner di Settings.)
- **Q21. Re-authentication cleanup:** cukup password Owner, atau perlu 2FA di masa depan?

### Umum
- **Q22. Zona waktu** (WIB/WITA/WIT) dan format tanggal. *(Sementara: WIB lewat `APP_TIME_ZONE`, ADR-011.)*
- **Q23. Hosting/deployment** (Vercel? VPS?) dan **tool monitoring** (Sentry?) karena §27 menundanya ke architecture phase.
- **Q24. Backup database** dan target RPO/RTO, belum disebut sama sekali.
- **Q25.** Daftar browser/perangkat minimum yang didukung (versi iOS Safari penting untuk PWA dan IndexedDB).

---

## 4. Risiko Teknis

| # | Risiko | Dampak | Mitigasi yang disarankan |
|---|---|---|---|
| R1 | **Offline baru di Sprint 7**, padahal Sprint 3 sudah meminta "offline draft" dan "error recovery". | Rework model data & form di Sprint 3–6. | Pindahkan **fondasi offline** (client-generated UUID, idempotency key, IndexedDB draft store, sync status) ke **Sprint 0/1**. Sprint 7 fokus pada service worker, background sync, dan hardening. |
| R2 | **PWA di iOS**: background sync tidak didukung Safari; storage bisa dihapus OS jika tidak dipakai. | Data pending bisa tertahan/hilang di iPhone. | Sync saat app dibuka atau online event; minta `navigator.storage.persist()`; tampilkan jumlah item pending dengan jelas. |
| R3 | **Dedup foto via checksum (§12.9) + cleanup (§12.5)**: jika satu file direferensikan banyak laporan, cleanup satu laporan bisa menghapus foto laporan lain. | Hilangnya dokumentasi foto. | Pisahkan tabel `photo_file` (fisik, hash) dan `photo_attachment` (relasi). Hapus file fisik hanya jika semua attachment eligible dan tidak ada `KEEP`. |
| R4 | **Hash dihitung setelah kompresi** akan berbeda untuk foto sumber yang sama jika setting kompresi berubah. | Dedup tidak efektif. | Hitung hash dari file hasil kompresi (yang benar-benar disimpan) dan terima keterbatasan ini; dokumentasikan. |
| R5 | **Monitoring storage**: menghitung dari metadata DB bisa drift dari isi bucket. | Angka penggunaan tidak akurat. | Jadikan DB sumber utama; tambah job rekonsiliasi berkala (Sprint 8). |
| R6 | **Brute-force PIN**: PIN numerik pendek mudah ditebak. | Pengambilalihan akun Pengawas. | Rate limit per kode + per IP, lockout bertahap, PIN di-hash (argon2/bcrypt), audit login gagal. |
| R7 | **Supabase Storage + Prisma + custom session**: RLS Supabase tidak otomatis mengenali sesi custom. | Akses foto bocor atau gagal. | Bucket privat, akses hanya melalui **signed URL** yang dibuat server setelah cek otorisasi. |
| R8 | **Export PDF dengan foto** di serverless bisa lambat atau timeout. | Export gagal untuk periode panjang. | Batasi rentang tanggal, sediakan opsi tanpa foto, atau gunakan job asinkron. |

---

## 5. Usulan Penyesuaian Roadmap

| Sprint | PRD asli | Usulan tambahan |
|---|---|---|
| 0 | Foundation | + Fondasi dokumentasi (selesai: folder `docs/`), + **skema ID client (UUID) & idempotency**, + jawaban Q16–Q19, Q22–Q23 |
| 1 | Authentication | + Audit log dasar (login, gagal login, manajemen Pengawas) |
| 3 | Laporan Kerja | + **Master data Unit & Operator** (jika Q3/Q4 = master data), + draft IndexedDB lokal |
| 6 | Laporan Data | + **Storage Monitoring** (read-only) |
| 8 | Hardening | + **Photo Cleanup**, retention status, rekonsiliasi storage, backup |

---

## 6. Kebutuhan Non-Fungsional yang Belum Terukur

PRD menyebut "cepat" dan "aman" tetapi belum memberi angka. Usulan default (perlu disetujui):

- Performa: LCP < 2.5 dtk di 4G, interaksi form < 100 ms.
- Aksesibilitas: WCAG 2.1 AA (kontras, fokus, label).
- Kompatibilitas: Android Chrome 2 versi terakhir, iOS Safari 16+, desktop Chrome/Edge/Firefox terbaru.
- Keamanan: OWASP ASVS Level 1 sebagai checklist review.

---

## 7. Status Dokumentasi

| Dokumen (PRD §36) | Status |
|---|---|
| `CLAUDE.md` | ✅ Dibuat, berisi aturan wajib dokumentasi |
| `docs/PRD.md` | ✅ Dipindah dari root (Sprint 0) |
| `docs/architecture.md` | 🟡 Draft awal dari PRD |
| `docs/database.md` | 🟡 Draft awal dari PRD |
| `docs/design-system.md` | 🟡 Draft awal dari PRD |
| `docs/security.md` | 🟡 Draft awal dari PRD |
| `docs/agile/product-backlog.md` | 🟡 Epic & story dari roadmap |
| `docs/agile/sprint.md` | 🟡 Template + Sprint 0 |
| `docs/agile/decisions.md` | 🟡 ADR awal (status PROPOSED) |
| `docs/features/` | ✅ Template dokumentasi per fitur |
| `CHANGELOG.md` | ✅ Dibuat |

# MY PASKAM

## Product Requirements Document (PRD)

### 1. Product Overview

**Nama Produk:** My PASKAM
**Platform:** Web App + Progressive Web App (PWA)
**Target Device:** Android, iPhone/iPad, Desktop
**Development Approach:** Agile
**Primary Theme:** Blue
**Primary Action/Button Color:** Orange
**UI Direction:** Professional, practical, human-designed, operational dashboard
**Visual Effect:** Subtle Glassmorphism, used selectively

My PASKAM adalah aplikasi operasional untuk membantu pencatatan pekerjaan, order spare part, planning job, dokumentasi foto, serta pelaporan data operasional.

Aplikasi dirancang **mobile-first** karena pengguna utama dapat bekerja menggunakan perangkat mobile di lapangan dengan kondisi jaringan yang tidak selalu stabil.

---

# 2. Product Goals

My PASKAM harus:

1. Memudahkan Pengawas mencatat pekerjaan dari HP.
2. Mengurangi pencatatan manual dan duplikasi data.
3. Menyediakan dokumentasi foto pekerjaan.
4. Memudahkan Owner memonitor aktivitas operasional.
5. Menyediakan laporan data yang dapat difilter dan diekspor ke PDF.
6. Tetap usable pada perangkat mobile.
7. Mendukung kondisi koneksi internet yang tidak stabil.
8. Memiliki authentication dan authorization yang aman.
9. Memiliki arsitektur yang dapat dikembangkan.
10. Memiliki UI yang terlihat seperti produk operasional nyata, bukan template AI-generated.

---

# 3. UI/UX DESIGN DIRECTION

## 3.1 Core Design Principle

UI My PASKAM harus terasa:

* Profesional
* Sederhana
* Solid
* Cepat
* Praktis
* Mudah dipahami
* Cocok untuk aplikasi operasional
* Tidak terlalu dekoratif
* Tidak terasa seperti template SaaS generik

Prioritas:

```text
FUNCTION > DECORATION

CLARITY > VISUAL EFFECT

USABILITY > TREND
```

---

# 4. Anti AI-Slop UI Requirement

**WAJIB.**

UI My PASKAM tidak boleh terlihat seperti hasil template AI yang generik.

Hindari pola visual seperti:

* Gradient berlebihan.
* Glassmorphism di seluruh halaman.
* Terlalu banyak card.
* Card di dalam card di dalam card.
* Semua elemen menggunakan rounded corner besar.
* Icon random untuk setiap label.
* Emoji sebagai icon utama.
* Huge heading yang tidak diperlukan.
* Floating blobs.
* Glow berlebihan.
* Neon effect.
* Excessive shadow.
* Gradient text.
* Dashboard penuh widget yang tidak diperlukan.
* Animasi yang hanya untuk dekorasi.
* Copywriting generik seperti "Empower your workflow".
* UI yang terlalu mirip landing page SaaS.

My PASKAM adalah **operational application**, bukan marketing website.

---

# 5. Icon System

Gunakan **icon library yang konsisten**, seperti Lucide Icons atau library icon yang setara.

Rules:

* Satu icon style.
* Konsisten stroke width.
* Ukuran icon konsisten.
* Icon harus memiliki hubungan langsung dengan fungsi.
* Jangan menggunakan icon hanya untuk mempercantik UI.
* Jangan mencampur icon outline, filled, 3D, emoji, dan random SVG.

Contoh:

```text
Laporan Kerja       → Clipboard/List icon
Spare Part          → Package icon
Planning Job        → Calendar icon
Laporan Data        → File/Chart icon
Pengawas            → User icon
Settings            → Settings icon
```

Icon harus membantu **recognition**, bukan menjadi dekorasi.

---

# 6. Glassmorphism

Glassmorphism boleh digunakan tetapi **sangat terbatas**.

Tujuan glassmorphism adalah memberikan sedikit depth dan hierarchy, bukan menjadi identitas seluruh UI.

### Allowed

* Login hero/card.
* Floating navigation tertentu.
* Overlay/modal tertentu.
* Small dashboard highlight.
* Header tertentu jika kontras tetap baik.

### Not Allowed

Jangan membuat seluruh aplikasi:

```text
glass card
  └── glass card
       └── glass card
            └── glass button
```

Glass effect harus subtle:

* Transparansi ringan.
* Blur ringan.
* Border tipis.
* Shadow lembut.
* Tetap memiliki kontras tinggi.

### Rule

Jika glassmorphism membuat text lebih sulit dibaca atau UI terasa berat:

**hapus glassmorphism.**

Functional clarity selalu lebih penting.

---

# 7. Color System

## Primary Theme

**BLUE**

Digunakan untuk:

* Brand.
* Header.
* Navigation.
* Active state.
* Section identity.
* Informational elements.

## Action Color

**ORANGE**

Digunakan untuk primary CTA:

* MASUK
* SIMPAN
* TAMBAH
* SUBMIT
* BUAT LAPORAN
* ORDER
* EXPORT
* ACTION penting lainnya

Prinsip:

```text
BLUE
= Identity / Structure

ORANGE
= Action
```

Orange tidak digunakan sebagai background utama seluruh aplikasi.

---

# 8. Button Design

Button harus terlihat jelas sebagai interactive element.

Primary button:

```text
[ + TAMBAH LAPORAN ]
```

Secondary:

```text
[ BATAL ]
```

Danger:

```text
[ HAPUS ]
```

Button harus memiliki:

* Normal state
* Hover state
* Pressed state
* Disabled state
* Loading state
* Focus state

Jangan hanya mengandalkan perubahan warna.

---

# 9. Mobile-First UX

Karena aplikasi digunakan di lapangan:

* One-handed friendly.
* Touch target minimal sekitar 44–48 px.
* Input besar.
* Font readable.
* Minim typing.
* Camera access mudah.
* Primary action mudah dijangkau.
* Navigation sederhana.
* Tidak menggunakan hover sebagai satu-satunya feedback.
* Form tidak terlalu panjang tanpa grouping.

---

# 10. Authentication

## Owner

Owner menggunakan:

**Username/Email + Password**

Security:

* Password di-hash.
* Secure session.
* Rate limiting.
* Brute-force protection.
* Server-side authorization.
* Audit log.
* Architecture siap untuk 2FA/MFA.

## Pengawas

Pengawas menggunakan:

**Kode Pengawas + PIN**

Pengawas tidak melakukan registration sendiri.

Akun dibuat oleh Owner.

---

# 11. Login UI

Satu halaman:

`/login`

Pengguna memilih:

```text
[ PENGAWAS ] [ OWNER ]
```

### Pengawas

```text
Kode Pengawas
[ SPV001 ]

PIN
[ •••••• ]

[ MASUK ]
```

### Owner

```text
Email / Username
[ owner@company.com ]

Password
[ ••••••••• ]

[ MASUK ]
```

Tidak perlu membuat dua URL login berbeda.

---

# 12. User Management

MVP:

```text
SUPER_ADMIN
PENGAWAS
```

Owner dapat:

* Tambah Pengawas.
* Edit Pengawas.
* Aktifkan/nonaktifkan.
* Reset PIN.
* Melihat data Pengawas.

Tidak ada public registration.

---

# 13. Core Modules

## Dashboard

Shortcut:

* Laporan Kerja
* Order Spare Part
* Planning Job
* Laporan Data

Dashboard tidak boleh dipenuhi widget hanya agar terlihat "modern".

Setiap component harus memiliki tujuan operasional.

---

# 14. Laporan Kerja

Unit:

* PASKAM 1
* PASKAM 2
* PASKAM 3
* PASKAM 4
* DUMP
* TOWING

Data:

* Tanggal
* Pengawas
* Operator
* HM/jam kerja
* BBM/Solar
* Lokasi
* Deskripsi pekerjaan
* Status
* Dokumentasi foto

Data ownership:

```text
operator_id
supervisor_id
created_by
approved_by
```

Jangan hanya menggunakan `created_by`.

---

# 15. Order Spare Part

Data:

* Unit
* Nama spare part
* Deskripsi kerusakan
* Lokasi
* Foto
* Status
* Created by
* Timestamp

---

# 16. Planning Job

Data:

* Pengawas
* Nama pekerjaan
* Lokasi
* Deskripsi
* Estimasi mulai
* Status
* Created by
* Timestamp

---

# 17. Laporan Data

Fitur:

* Filter tanggal.
* Filter unit.
* Filter Pengawas.
* Filter status.
* View data.
* Export PDF.

Jika diperlukan, Laporan Data dapat memiliki secondary PIN gate.

---

# 18. Photo Documentation

Foto digunakan pada:

* Laporan Kerja.
* Order Spare Part.
* Dokumentasi pekerjaan.

UX:

* Camera button jelas.
* Gallery upload.
* Preview.
* Compression.
* Upload progress.
* Retry.

Server wajib melakukan validasi file.

---

# 19. PWA & Offline

Fitur:

* Web App Manifest.
* Service Worker.
* Offline cache.
* IndexedDB.
* Offline draft.
* Sync queue.
* Retry mechanism.
* Upload queue.
* Network status indicator.

Sync harus idempotent agar tidak menghasilkan duplicate record.

---

# 20. ERROR HANDLING & RECOVERY

Error handling adalah bagian dari requirement utama, bukan pekerjaan tambahan setelah aplikasi selesai.

Prinsip:

```text
ERROR
↓
IDENTIFY
↓
EXPLAIN
↓
RECOVER
```

User harus mengetahui:

1. Apa yang terjadi.
2. Apakah datanya aman.
3. Apa yang harus dilakukan berikutnya.

---

## 20.1 Jangan gunakan error generik

Hindari:

> Something went wrong.

atau:

> Error 500.

Untuk user lapangan, pesan harus actionable.

Contoh:

**Buruk:**

> Upload failed.

**Lebih baik:**

> Foto belum berhasil diunggah karena koneksi terputus. Data laporan tetap tersimpan sebagai draft.

```text
[ COBA LAGI ]
```

---

# 21. Error Categories

Sistem harus membedakan minimal:

### Validation Error

Contoh:

> Nama pekerjaan wajib diisi.

Field yang bermasalah harus ditandai langsung.

---

### Authentication Error

Contoh:

> Kode Pengawas atau PIN tidak sesuai.

Jangan memberikan informasi berlebihan seperti:

> Kode benar tetapi PIN salah.

Tujuannya mencegah credential enumeration.

---

### Authorization Error

Jika user tidak memiliki akses:

> Anda tidak memiliki akses untuk membuka halaman ini.

Jangan hanya menampilkan error teknis.

---

### Network Error

Contoh:

> Koneksi internet sedang tidak tersedia.

Jika data dapat disimpan offline:

> Laporan disimpan di perangkat dan akan dikirim otomatis saat koneksi kembali.

Action:

```text
[ SIMPAN OFFLINE ]
```

atau otomatis masuk sync queue.

---

### Server Error

Contoh:

> Server sedang mengalami gangguan. Data Anda belum dikirim.

Action:

```text
[ COBA LAGI ]
```

Jangan menghapus input user.

---

### Upload Error

Contoh:

> Foto gagal diunggah. Periksa koneksi lalu coba lagi.

Jika memungkinkan:

```text
[ COBA LAGI ]
[ HAPUS FOTO ]
```

---

### Session Expired

Contoh:

> Sesi Anda telah berakhir. Silakan login kembali.

Form draft yang belum dikirim harus dipertahankan jika memungkinkan.

---

### Unexpected Error

Untuk error yang tidak terduga:

User melihat:

> Terjadi masalah saat memproses permintaan. Data yang belum tersimpan tidak akan dihapus.

Action:

```text
[ COBA LAGI ]
```

Developer mendapatkan detail teknis melalui logging/monitoring.

**Jangan menampilkan stack trace kepada user.**

---

# 22. Error UI Pattern

Gunakan pola berbeda sesuai severity.

### Inline Error

Untuk validation:

```text
Lokasi
[                         ]
⚠ Lokasi wajib diisi
```

### Toast

Untuk feedback ringan:

```text
✓ Data berhasil disimpan
```

### Banner

Untuk kondisi sistem:

```text
⚠ Koneksi internet terputus.
  Data baru akan disinkronkan saat online.
```

### Modal

Hanya untuk:

* Destructive action.
* Security issue.
* Confirmation penting.

Jangan menggunakan modal untuk setiap error.

---

# 23. Data Safety During Error

Ini sangat penting.

Ketika terjadi:

* network failure,
* server failure,
* upload failure,
* session expiry,

sistem **tidak boleh secara otomatis menghapus input user**.

Contoh:

Pengawas sudah mengisi:

```text
Laporan
Tanggal
Unit
Pekerjaan
Foto
```

kemudian internet mati.

Sistem harus mempertahankan data sebagai:

```text
DRAFT / PENDING SYNC
```

bukan mengembalikan form menjadi kosong.

---

# 24. Retry Strategy

Retry harus aman.

Jangan sampai user menekan:

```text
[ COBA LAGI ]
[ COBA LAGI ]
[ COBA LAGI ]
```

dan akhirnya menghasilkan tiga laporan yang sama.

Gunakan:

* Idempotency key.
* Unique client-generated ID.
* Sync status.
* Server-side duplicate protection.

---

# 25. Offline Sync States

Data dapat memiliki state:

```text
DRAFT
    ↓
PENDING_SYNC
    ↓
SYNCING
    ↓
SYNCED
```

Jika gagal:

```text
SYNCING
    ↓
SYNC_FAILED
    ↓
RETRY
```

User dapat melihat status:

```text
✓ Tersimpan
↻ Menunggu sinkronisasi
⚠ Gagal sinkronisasi
```

---

# 26. Error Logging

Error teknis harus dicatat secara aman.

Log minimal:

* Timestamp.
* User ID jika tersedia.
* Request/action.
* Error category.
* Error ID/correlation ID.
* Device/browser information jika diperlukan.

Jangan menyimpan:

* Password.
* PIN.
* Access token.
* Sensitive credential.

User-facing error dapat menampilkan reference:

> Terjadi kesalahan. Kode laporan: `ERR-8F31`

Kode tersebut dapat membantu Owner/developer mencari error di log.

---

# 27. Error Monitoring

Production system sebaiknya menggunakan error monitoring.

Tujuan:

* Mengetahui error sebelum banyak user melapor.
* Melihat error frequency.
* Mengetahui halaman yang bermasalah.
* Mengetahui device/browser yang terdampak.

Detail implementasi tool monitoring ditentukan saat architecture/deployment phase.

---

# 28. Empty States

Empty state bukan error.

Contoh:

```text
Belum ada laporan kerja

Belum ada laporan yang dibuat untuk periode ini.

[ BUAT LAPORAN ]
```

Jangan menggunakan:

> No Data Found!!!

secara berlebihan.

---

# 29. Loading States

Setiap action asynchronous harus memiliki feedback.

Contoh:

```text
[ ⟳ MENYIMPAN... ]
```

Button tidak boleh dapat ditekan berkali-kali ketika request sedang berjalan.

Gunakan:

* Disabled state.
* Loading indicator.
* Optimistic UI hanya jika aman.

---

# 30. Agile Development

Project menggunakan Agile.

Recommended Sprint:

**1–2 minggu.**

Workflow:

```text
Product Backlog
↓
Sprint Planning
↓
User Story
↓
Acceptance Criteria
↓
Implementation
↓
Testing
↓
Code Review
↓
Security Review
↓
Sprint Review
↓
Client Feedback
↓
Retrospective
↓
Next Sprint
```

Claude Code harus bekerja secara incremental.

Jangan meminta Claude membangun seluruh aplikasi sekaligus.

---

# 31. Definition of Done

Feature dianggap selesai apabila:

* Business requirement sesuai.
* UI selesai.
* Mobile responsive.
* Loading state selesai.
* Error state selesai.
* Empty state selesai.
* Validation selesai.
* Server authorization selesai.
* Security review selesai.
* Test selesai.
* Offline behavior ditangani jika applicable.
* TypeScript berhasil.
* Lint berhasil.
* Build berhasil.
* Tidak ada credential/secrets.
* Tidak ada unrelated changes.
* Documentation diperbarui bila diperlukan.

---

# 32. Claude Code Engineering Rules

Claude Code wajib:

1. Mengikuti PRD.
2. Tidak membuat business rule sendiri.
3. Tidak membuat UI AI-slop.
4. Tidak menggunakan glassmorphism berlebihan.
5. Menggunakan icon system yang konsisten.
6. Mengutamakan usability daripada dekorasi.
7. Menyediakan loading/error/empty/success state.
8. Mempertahankan data user ketika request gagal.
9. Tidak menyimpan credential plaintext.
10. Tidak membuat duplicate record ketika retry.
11. Melakukan server-side authorization.
12. Menulis test untuk logic penting.
13. Melakukan typecheck/lint/build sebelum menyelesaikan task.
14. Tidak mengubah file unrelated.
15. Menggunakan small commits.

---

# 33. Custom Claude Code Skills

```text
.claude/
└── skills/
    ├── ui-ux/
    ├── security-review/
    ├── database/
    ├── testing/
    ├── pwa/
    ├── performance/
    ├── code-review/
    │
    ├── my-paskam-field-ux/
    ├── my-paskam-offline-sync/
    ├── my-paskam-business-rules/
    ├── my-paskam-security/
    ├── my-paskam-error-handling/
    └── my-paskam-review/
```

Tambahkan custom skill:

**`my-paskam-error-handling`**

Skill ini memastikan setiap feature memiliki:

* Loading state.
* Success state.
* Validation error.
* Network error.
* Server error.
* Permission error.
* Empty state.
* Retry behavior.
* Data preservation.
* Offline handling jika applicable.

---

# 34. Token Efficiency

Claude Code harus bekerja secara efisien:

* Jangan membaca seluruh repository tanpa alasan.
* Inspect file yang relevan.
* Reuse existing components.
* Jangan rewrite file besar jika patch kecil cukup.
* Jangan melakukan unrelated changes.
* Jangan menambah dependency tanpa alasan.
* Gunakan small commits.
* Gunakan docs sebagai source of truth.
* Aktifkan skill hanya ketika relevan.

---

# 35. Recommended Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide Icons

### Database

* PostgreSQL
* Prisma atau ORM modern yang sesuai

### Storage

Object storage untuk foto.

### Authentication

Secure session-based authentication.

---

# 36. Suggested Project Structure

```text
my-paskam/
│
├── CLAUDE.md
│
├── .claude/
│   ├── skills/
│   └── commands/
│
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── database.md
│   ├── design-system.md
│   ├── security.md
│   └── agile/
│       ├── product-backlog.md
│       ├── sprint.md
│       └── decisions.md
│
└── src/
```

---

# 37. Development Roadmap

## Sprint 0 — Foundation

* Repository.
* Next.js.
* TypeScript.
* Tailwind.
* UI foundation.
* Design system.
* Database.
* Authentication architecture.
* Basic CI/checks.

## Sprint 1 — Authentication

* Owner login.
* Pengawas login.
* Session.
* User model.
* Manajemen Pengawas.
* Permission foundation.
* Error handling authentication.

## Sprint 2 — Dashboard

* Dashboard Owner.
* Dashboard Pengawas.
* Navigation.
* Responsive mobile UI.
* Loading/empty/error states.

## Sprint 3 — Laporan Kerja

* Form.
* Unit selection.
* Photo.
* Validation.
* Save.
* Offline draft.
* List/detail.
* Error recovery.

## Sprint 4 — Order Spare Part

* Form.
* Photo.
* Status.
* List/detail.
* Error recovery.

## Sprint 5 — Planning Job

* Form.
* Planning list.
* Status.
* Error recovery.

## Sprint 6 — Laporan Data

* Filter.
* Report.
* PIN gate jika diperlukan.
* PDF export.
* Error handling.

## Sprint 7 — PWA & Offline

* Installability.
* Service worker.
* IndexedDB.
* Offline draft.
* Sync queue.
* Retry.
* Duplicate protection.

## Sprint 8 — Production Hardening

* Security review.
* Authorization review.
* Upload security.
* Error monitoring.
* Performance.
* Accessibility.
* PWA review.
* Production deployment.

---

# 38. Final Design Direction

My PASKAM harus terlihat seperti:

**aplikasi operasional profesional yang dibuat khusus untuk kebutuhan perusahaan**, bukan template dashboard AI.

Visual hierarchy:

```text
BLUE
│
├── Brand
├── Navigation
├── Structure
└── Information

ORANGE
│
├── Primary CTA
├── Submit
├── Save
├── Add
└── Important Actions

GLASSMORPHISM
│
└── Subtle accent only
```

### Design Rule Utama

> **Jika sebuah efek visual tidak membantu user memahami atau menyelesaikan pekerjaan, jangan gunakan.**

### Error Rule Utama

> **Jika terjadi error, jangan pernah membuat user kehilangan pekerjaan yang sudah mereka input tanpa alasan yang jelas.**

### Product Rule Utama

> **My PASKAM harus terasa cepat, jelas, aman, dan dibuat untuk pekerjaan nyata di lapangan.**

## 12. STORAGE MANAGEMENT & PHOTO RETENTION

### 12.1 Tujuan

My PASKAM menggunakan **Supabase Storage** untuk menyimpan foto dokumentasi pekerjaan. Karena kapasitas storage terbatas pada setiap paket, sistem harus menyediakan mekanisme untuk:

* menghemat penggunaan storage;
* menghindari foto berukuran terlalu besar;
* mendeteksi penggunaan storage;
* membersihkan foto lama secara terkontrol;
* mempertahankan data laporan meskipun foto lama dihapus;
* mencegah penghapusan foto penting secara tidak sengaja.

### 12.2 Kebijakan Penyimpanan Foto

Foto **tidak boleh disimpan sebagai binary/blob di PostgreSQL**.

Arsitektur:

```text
PostgreSQL
├── laporan
├── photo_metadata
├── storage_path
├── uploaded_at
├── file_size
├── mime_type
└── retention_status

Supabase Storage
└── photos/
    ├── laporan/{laporan_id}/
    ├── order-spare-part/{order_id}/
    └── planning-job/{planning_id}/
```

Database hanya menyimpan metadata dan lokasi file.

### 12.3 Kompresi Foto

Foto harus dikompresi **di sisi client sebelum upload**.

Default:

* Maximum dimension: ±1600 px
* Image quality: 75–80
* Target file size: ±200–500 KB/foto
* Format: JPEG atau WebP sesuai dukungan browser/perangkat
* Original camera resolution tidak wajib disimpan untuk MVP
* Sistem harus mempertahankan kualitas yang masih cukup untuk dokumentasi operasional

Flow:

```text
Kamera / Galeri
      ↓
Resize
      ↓
Compress
      ↓
Validasi ukuran
      ↓
Upload Queue
      ↓
Supabase Storage
```

Jika compression gagal, foto asli tidak boleh menyebabkan data laporan hilang.

### 12.4 Storage Monitoring

Owner dapat melihat penggunaan storage melalui halaman:

**Settings / System → Storage Management**

Informasi minimum:

* Total storage
* Storage terpakai
* Storage tersedia
* Persentase penggunaan
* Jumlah foto
* Total ukuran foto
* Foto berdasarkan modul
* Foto berdasarkan periode
* Foto yang dapat dibersihkan

Status:

* `<70%` → Normal
* `70–85%` → Attention
* `85–95%` → Warning
* `>95%` → Critical

Sistem harus memberikan peringatan sebelum storage benar-benar penuh.

### 12.5 Photo Cleanup

Owner memiliki akses ke fitur:

**Bersihkan Foto**

Fitur tidak boleh langsung menghapus file.

Flow:

```text
Owner memilih filter
        ↓
Sistem menghitung foto yang memenuhi filter
        ↓
Preview jumlah file + total ukuran
        ↓
Owner melakukan konfirmasi
        ↓
Re-authentication / password Owner
        ↓
Delete dari Supabase Storage
        ↓
Update metadata database
        ↓
Audit Log
```

Filter minimum:

* Foto lebih dari 6 bulan
* Foto lebih dari 1 tahun
* Foto lebih dari 2 tahun
* Berdasarkan unit
* Berdasarkan modul
* Berdasarkan periode tertentu

### 12.6 Retention Policy

Default MVP:

**Tidak ada penghapusan otomatis.**

Penghapusan foto dilakukan secara manual oleh Owner sampai perusahaan menetapkan kebijakan retensi resmi.

Sistem harus mendukung kebijakan seperti:

```text
0–6 bulan     → ACTIVE
6–12 bulan    → ACTIVE
1–2 tahun     → ARCHIVED / REVIEW
>2 tahun      → ELIGIBLE FOR CLEANUP
```

Namun sistem **tidak boleh menganggap umur tertentu sebagai aturan bisnis final** tanpa konfigurasi/keputusan Owner.

### 12.7 Perlindungan Foto Penting

Foto dapat diberi status:

* `KEEP`
* `ACTIVE`
* `ARCHIVED`
* `DELETE_PENDING`
* `DELETED`

Foto dengan status `KEEP` tidak boleh masuk ke proses cleanup biasa.

Hal ini memungkinkan laporan tertentu tetap menyimpan dokumentasi meskipun foto laporan lain sudah dibersihkan.

### 12.8 Setelah Foto Dihapus

Penghapusan foto **tidak boleh menghapus laporan**.

Contoh:

```text
Laporan Kerja
Tanggal: 15 Januari 2026
Unit: PASKAM 2
Operator: Budi
Pekerjaan: Perawatan Unit

Dokumentasi:
⚠ Foto telah dihapus sesuai kebijakan retensi.
```

Histori laporan, operator, supervisor, pekerjaan, HM, BBM, status, dan metadata lainnya tetap tersedia.

Database harus menyimpan status bahwa foto pernah tersedia tetapi kemudian dihapus.

### 12.9 Duplicate Photo Prevention

Sistem sebaiknya menggunakan checksum/hash untuk mendeteksi file yang identik sebelum upload.

Jika foto yang sama sudah tersedia:

```text
Foto identik sudah pernah diunggah.
```

Sistem tidak perlu menyimpan salinan identik kedua apabila business rule mengizinkan reuse/reference terhadap file yang sama.

### 12.10 Upload Failure & Storage Full

Jika storage penuh atau upload gagal:

* laporan tidak boleh hilang;
* data teks tetap tersimpan sebagai draft/pending sync;
* foto masuk upload queue;
* user mendapatkan informasi yang jelas;
* tersedia tombol Retry;
* retry tidak boleh membuat duplicate record;
* sistem harus membedakan error storage penuh, network error, permission error, dan server error.

Contoh:

```text
Upload foto gagal

Data laporan Anda tetap aman.
Penyebab: Storage hampir penuh.

[ Coba Lagi ]
[ Simpan sebagai Draft ]
```

### 12.11 Audit Log

Setiap aktivitas cleanup harus dicatat.

Minimum:

* user/Owner
* timestamp
* action
* jumlah file
* total ukuran
* filter yang digunakan
* laporan/modul terkait jika tersedia
* result
* error ID jika gagal

Contoh:

```text
Owner
Action: PHOTO_CLEANUP
Filter: Foto > 2 tahun
Files: 1.284
Size: 326 MB
Result: SUCCESS
Timestamp: ...
```

Password, PIN, token, dan credential tidak boleh masuk audit log.

### 12.12 Security

Storage bucket untuk foto operasional harus menggunakan access policy yang sesuai.

Ketentuan:

* Jangan menggunakan public bucket tanpa alasan bisnis yang jelas.
* Akses foto harus melalui authorization yang sesuai.
* Owner memiliki akses penuh sesuai permission.
* Pengawas hanya dapat mengakses foto yang memang berhak mereka lihat.
* Server-side authorization wajib diterapkan.
* Cleanup hanya dapat dilakukan oleh Owner atau permission khusus.
* Penghapusan permanen harus melalui confirmation.
* Jangan mengandalkan pembatasan UI saja untuk security.

### 12.13 Future Storage Tier

Arsitektur harus memungkinkan perpindahan:

```text
Supabase Free
      ↓
Supabase Pro
      ↓
Storage lebih besar / external archive
```

Tanpa mengubah struktur utama aplikasi.

My PASKAM tidak boleh mengikat business logic secara langsung pada kapasitas paket tertentu.

### 12.14 Prinsip Utama

> **Compress first → Store efficiently → Monitor → Retain intentionally → Cleanup safely.**

Tujuan fitur ini bukan sekadar menghapus foto, tetapi menjaga agar **storage tetap terkendali tanpa mengorbankan histori laporan operasional**.

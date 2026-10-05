# Decision Log (ADR)

> Setiap keputusan teknis **dan** jawaban business rule dicatat di sini.
> Status: `PROPOSED` → `ACCEPTED` / `REJECTED` / `SUPERSEDED by ADR-xxx`.
> Hanya ADR `ACCEPTED` yang boleh dijadikan dasar implementasi.

## Template

```markdown
### ADR-xxx: <Judul>
- Tanggal: YYYY-MM-DD
- Status: PROPOSED
- Menjawab: Q… (docs/prd-analysis.md)
- Konteks: …
- Keputusan: …
- Konsekuensi: …
```

---

### ADR-000: Struktur dokumentasi & kewajiban dokumentasi
- Tanggal: 2026-10-01
- Status: PROPOSED
- Konteks: PRD §31 & §36 meminta dokumentasi diperbarui dan docs menjadi source of truth.
- Keputusan: Gunakan struktur `docs/` sesuai PRD §36 + `docs/features/` + `CHANGELOG.md`. Aturan pembaruan per jenis perubahan ditetapkan di `CLAUDE.md`. `prd.md` dipindah ke `docs/PRD.md` di Sprint 0.
- Konsekuensi: Setiap PR/task wajib menyebut dokumen yang diperbarui.

### ADR-001: Penomoran ulang bagian Storage di PRD
- Tanggal: 2026-10-01
- Status: PROPOSED
- Konteks: Bagian Storage Management bernomor "12" dan bentrok dengan §12 User Management.
- Keputusan: Ubah menjadi §39 (39.1–39.14).
- Konsekuensi: Referensi di dokumen lain memakai §39.

### ADR-002: Platform data, storage, dan auth
- Tanggal: 2026-10-01
- Status: PROPOSED — bagian auth custom session **sudah diimplementasikan di Sprint 1** agar pekerjaan tidak tertahan; bisa diganti jika ditolak
- Menjawab: S4, Q23
- Konteks: PRD menyebut PostgreSQL + Prisma, Supabase Storage, dan "secure session-based auth".
- Usulan: Supabase Postgres sebagai DB (via Prisma), Supabase Storage dengan bucket privat, dan **custom session auth** di server Next.js (cookie httpOnly, session disimpan di DB) agar login Kode + PIN dan audit log sepenuhnya terkendali. Akses foto melalui signed URL berumur pendek yang dibuat server setelah cek otorisasi.
- Perlu konfirmasi: hosting aplikasi (Vercel/VPS).

### ADR-003: Model foto (file vs attachment)
- Tanggal: 2026-10-01
- Status: DITUNDA — Sprint 3 memakai satu tabel `photo` (ADR-015); pemisahan file/attachment baru diperlukan bila dedup checksum (PRD §39.9) diaktifkan
- Konteks: Dedup checksum (PRD storage §12.9) dan cleanup (§12.5) bisa saling bertabrakan (Risiko R3).
- Usulan: Tabel `photo_file` (hash, path, size, retention_status) dan `photo_attachment` (module, record_id, photo_file_id). File fisik dihapus hanya jika semua attachment eligible dan tidak ada yang `KEEP`.

### ADR-004: ID dari client & idempotency sejak Sprint 0
- Tanggal: 2026-10-01
- Status: ACCEPTED — diterapkan: primary key UUID dari client berfungsi sebagai idempotency key (tidak perlu kolom terpisah)
- Konteks: Offline baru dijadwalkan di Sprint 7, tetapi Sprint 3 sudah membutuhkan draft dan retry aman (Risiko R1).
- Usulan: Semua record bisnis memakai UUID yang dibuat client + kolom `idempotency_key` unik, sejak skema pertama.

### ADR-005: Palet warna & mode terang
- Tanggal: 2026-10-01
- Status: SUPERSEDED (palet) by ADR-013; bagian "mode terang saja" tetap berlaku
- Konteks: PRD §7 menetapkan biru (identitas) dan oranye (aksi) tanpa nilai hex. Pengguna bekerja di lapangan.
- Keputusan: Pakai palet di `docs/design-system.md`. Semua kombinasi teks putih di atas brand/action/danger ≥ 4.5:1 (WCAG AA). Untuk MVP hanya mode terang.
- Konsekuensi: Dark mode bisa ditambahkan nanti tanpa mengubah komponen, karena warna diambil dari token.

### ADR-006: Fondasi error handling
- Tanggal: 2026-10-01
- Status: ACCEPTED (turunan langsung PRD §20–§26)
- Keputusan: `AppError` + 9 kategori (`src/lib/errors`). Server mengembalikan `PublicError` (kategori, pesan Indonesia, `errorId` format `ERR-XXXXXX`, `retryable`, `fieldErrors`) tanpa stack trace. Detail teknis dicatat lewat `logger` (JSON per baris) yang otomatis menyensor key sensitif (password, pin, token, session, cookie, dll.).
- Konsekuensi: Semua route handler/server action wajib membungkus error dengan `toPublicError`.

### ADR-007: Parameter autentikasi sementara
- Tanggal: 2026-10-03
- Status: PROPOSED (sementara, menunggu Q17 & Q18)
- Konteks: Sprint 1 dijalankan sebelum Owner menjawab kebijakan PIN dan durasi sesi.
- Keputusan sementara: PIN 6 digit angka; kunci 15 menit setelah 5 gagal per kode/email atau 30 gagal per IP dalam window 15 menit; sesi Owner 12 jam, Pengawas 7 hari (tetap, tidak diperpanjang otomatis).
- Konsekuensi: Semua nilai ada di `src/lib/auth/config.ts`, sehingga perubahan tidak menyentuh logika. Jika panjang PIN berubah, PIN yang sudah ada tetap valid sampai direset.

### ADR-008: Hashing password & PIN dengan scrypt bawaan Node
- Tanggal: 2026-10-03
- Status: ACCEPTED
- Konteks: PRD §10 mewajibkan hash; PRD §34 melarang dependency tanpa alasan.
- Keputusan: `node:crypto` scrypt N=2^15, r=8, p=3 (setara rekomendasi OWASP, ±0,5 dtk dan 32 MB per hash). Format string menyimpan parameter, jadi parameter bisa dinaikkan nanti tanpa membatalkan hash lama. Saat akun tidak ditemukan tetap dilakukan verifikasi dummy agar waktu respons sama (anti-enumerasi).
- Konsekuensi: Tidak perlu modul native (argon2/bcrypt). Login sengaja ±0,5 dtk.

### ADR-009: Rate limit login di PostgreSQL
- Tanggal: 2026-10-03
- Status: ACCEPTED
- Konteks: Rate limit di memori tidak berlaku di banyak instance/serverless; hosting belum diputuskan (Q23).
- Keputusan: Tabel `rate_limit` (fixed window) dengan key per identifier (`login:id:<mode>:<identifier>`) dan per IP. Identifier yang tidak terdaftar juga dihitung.
- Konsekuensi: Satu query tambahan per login. IP diambil dari `x-forwarded-for`, yang hanya bisa dipercaya di belakang proxy yang menimpanya; perlu ditinjau saat hosting dipilih.

### ADR-010: Akses Laporan Data sementara hanya untuk Owner
- Tanggal: 2026-10-04
- Status: PROPOSED (sementara, menunggu Q13)
- Konteks: Navigasi Sprint 2 butuh keputusan siapa yang melihat Laporan Data.
- Keputusan sementara: `laporan-data:access` hanya SUPER_ADMIN (prinsip least privilege). Dibuka untuk Pengawas cukup dengan menambah role di `src/lib/auth/permissions.ts`.

### ADR-011: Zona waktu tampilan eksplisit
- Tanggal: 2026-10-04
- Status: PROPOSED (nilai menunggu Q22)
- Konteks: `Intl.DateTimeFormat` tanpa `timeZone` memakai zona server; di hosting umumnya UTC sehingga jam meleset 7–9 jam (ditemukan di daftar Pengawas).
- Keputusan: Semua format tanggal lewat `src/lib/format.ts` dengan `APP_TIME_ZONE` (env, default sementara `Asia/Jakarta`). DB tetap UTC (`timestamptz`).

### ADR-012: Target kontras teks status 7:1
- Tanggal: 2026-10-05
- Status: ACCEPTED
- Konteks: Riset (docs/research) — kontras layar di bawah matahari turun drastis; WCAG AA (4,5:1) belum cukup untuk teks status/penting di lapangan.
- Keputusan: Teks status, error inline, dan teks utama ≥ 7:1. Tombol berteks putih minimal AA (≥ 4,5:1). Ikon ≥ 3:1. Warning memakai kuning (`#A16207`/`#713F12`) agar terpisah dari oranye aksen.
- Konsekuensi: Token status punya nada teks khusus (`*-800`/`*-900`).

### ADR-013: Gaya visual "Soft Operational" — biru utama, oranye aksen
- Tanggal: 2026-10-05
- Status: ACCEPTED (keputusan Owner berdasarkan gambar referensi)
- Konteks: Owner meminta UI dirombak mengikuti referensi aplikasi mobile modern (terang, rounded, tombol biru gradien, ikon pastel) dengan sedikit sentuhan oranye. Owner memilih: **biru sebagai warna utama dan aksi utama, oranye sebagai aksen**, serta **ikon pastel tanpa maskot/emoji**.
- Keputusan:
  - Menggantikan PRD §7 "orange = primary CTA": tombol utama kini **biru gradien (biru → indigo) berbentuk pill**. Oranye khusus tombol "+" / "Buat baru" dan sorotan kecil.
  - Melonggarkan PRD §4 secara terbatas: gradien diizinkan hanya di tombol utama, hero card (1 per halaman), dan BrandMark; sudut besar (kartu 20 px, tombol pill) dan shadow lembut diizinkan. Larangan emoji, maskot, glow, card bertumpuk, dan widget dekoratif **tetap berlaku**.
  - Label tombol & judul memakai sentence case ("Simpan"), bukan huruf kapital semua seperti notasi di PRD §8/§11.
  - Navigasi mobile: tanpa header bar biru; bottom nav 2 + tombol "+" oranye + 2; halaman Akun (profil, menu admin, keluar).
  - Font Inter di-host sendiri (`next/font`).
- Konsekuensi: `docs/design-system.md` ditulis ulang; CLAUDE.md aturan UI diperbarui. Rekomendasi riset yang menolak gradien dikesampingkan oleh keputusan Owner ini; aturan kontras dan status dari riset tetap dipakai (ADR-012).

### ADR-014: Aturan bisnis Laporan Kerja (jawaban Owner 2026-10-05)
- Tanggal: 2026-10-05
- Status: ACCEPTED (butir bertanda *tafsiran* menunggu konfirmasi Owner)
- Menjawab: Q1–Q7, Q16 (docs/prd-analysis.md)
- Keputusan:
  - **Q1/Q2 Status & approval: tidak perlu.** Laporan tidak punya status bisnis maupun alur persetujuan; field `approved_by` dan `status` dari PRD §14 tidak dipakai. Status sinkron offline (PRD §25) tetap ada di sisi perangkat.
  - **Q3 Operator: tidak perlu daftar.** Nama operator diketik bebas (teks), dengan saran dari nama yang pernah diketik Pengawas tersebut (dikonfirmasi 2026-10-05).
  - **Q4 Unit: bisa ditambah.** Unit = master data yang dikelola Owner (tambah, ubah nama, aktif/nonaktif). Awal: PASKAM 1–4, DUMP, TOWING.
  - **Q5 HM = total jam kerja** (angka desimal, 1 angka di belakang koma). 0–24 jam per laporan (dikonfirmasi Owner 2026-10-05).
  - **Q5 BBM (Solar):** ~~pilihan 1–6~~ → **diubah 2026-10-05 (ADR-016): kolom jumlah (quantity)**.
  - **Q6 Edit/hapus: boleh.** Pengawas boleh mengedit dan menghapus laporan miliknya sendiri. Hapus = soft delete + audit log.
  - **Q7 Foto: wajib.** Minimal 1 foto, maksimal 6 foto per laporan (dikonfirmasi 2026-10-05).
  - **Q16 Visibilitas (usulan Owner + rekomendasi):** Pengawas tercatat otomatis dari akun yang login (`supervisor_id` = user login, tidak diisi manual). Owner melihat semua laporan; Pengawas hanya melihat laporannya sendiri. Laporan dibuat oleh Pengawas; Owner hanya melihat.
- Konsekuensi: Permission baru `laporan-kerja:create` (PENGAWAS), `laporan-kerja:view-all` (SUPER_ADMIN), `unit:manage` (SUPER_ADMIN).

### ADR-015: Arsitektur foto & draft Laporan Kerja
- Tanggal: 2026-10-05
- Status: ACCEPTED
- Konteks: PRD §18/§39 (kompresi, upload progress, retry, validasi server, akses terotorisasi) dan §23 (input tidak boleh hilang). Kredensial Supabase belum tersedia (Q23).
- Keputusan:
  - **Upload sebelum simpan:** foto diunggah satu per satu ke `POST /api/foto` begitu dipilih (id foto & id laporan dari client), lalu `saveLaporan` hanya mengirim daftar id foto. Memberi progress per foto dan retry tanpa mengulang seluruh form.
  - **Kompresi di HP:** canvas → JPEG 80%, sisi terpanjang 1600 px. Re-encode sekaligus membuang EXIF (termasuk GPS).
  - **Validasi server:** ukuran ≤ 2 MB, tipe dicek dari magic bytes (JPEG/WebP saja), foto hanya bisa ditempel ke laporan milik pengunggah.
  - **Akses:** tidak ada URL publik; `GET /api/foto/:id` memeriksa izin laporan setiap request; foto orang lain → 404.
  - **Storage:** antarmuka `StorageDriver` (`src/lib/storage`), driver `local` (folder `storage/`, di-gitignore) untuk development; driver Supabase ditambahkan saat kredensial ada, tanpa mengubah kode lain (PRD §39.13).
  - **Draft di HP:** IndexedDB (`paskam` → `laporan-drafts`), simpan otomatis ±0,6 dtk berisi isian + blob foto yang belum terunggah; dihapus setelah tersimpan di server. `navigator.storage.persist()` diminta agar tidak dihapus browser.
  - **Foto dilepas saat edit** dihapus (soft delete + file dihapus) ketika laporan disimpan.
- Konsekuensi: Foto yatim (diunggah tapi laporan tak pernah disimpan) perlu dibersihkan berkala — dicatat untuk Sprint 8 (Storage Management). Halaman yang memakai `notFound()` di bawah `loading.tsx` mengembalikan status 200 dengan UI "tidak ditemukan" (perilaku streaming Next.js); tidak ada data yang bocor (diuji E2E).

### ADR-016: BBM sebagai jumlah & aturan Order Spare Part (jawaban Owner 2026-10-05)
- Tanggal: 2026-10-05
- Status: ACCEPTED (butir *tafsiran* menunggu konfirmasi)
- Menjawab: konfirmasi Sprint 3; Q8, Q9 (docs/prd-analysis.md)
- Keputusan:
  - **BBM (Solar) = jumlah (quantity)**, angka ≥ 0 dengan maks. 1 angka desimal, tanpa satuan tetap (menggantikan pilihan 1–6 di ADR-014).
  - **HM maks. 24 jam, foto maks. 6, operator teks bebas** — dikonfirmasi.
  - **Order Spare Part tidak memakai status.** Tujuannya **dokumentasi spare part yang rusak**, bukan alur pemesanan. Field `status` PRD §15 tidak dipakai.
  - Field Order Spare Part: unit, nama spare part, deskripsi kerusakan, lokasi, foto, dicatat oleh (otomatis), waktu (otomatis) — sesuai PRD §15.
  - *Tafsiran (disamakan dengan Laporan Kerja, ADR-014):* foto wajib 1–6; dibuat oleh Pengawas (nama tercatat otomatis); Pengawas hanya melihat miliknya, Owner melihat semua; Pengawas boleh mengubah/menghapus miliknya (soft delete).
  - *Belum dijawab (Q9):* kolom jumlah, prioritas, atau nomor part — tidak dibuat dulu.
- Konsekuensi: Izin baru `spare-part:create` (PENGAWAS), `spare-part:view-all` (SUPER_ADMIN). Modul foto & draft digeneralisasi untuk dipakai dua modul.

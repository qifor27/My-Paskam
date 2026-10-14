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
- Status: ACCEPTED — dikonfirmasi Owner 2026-10-05 (ADR-018): Pengawas tidak boleh membuka Laporan Data
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

### ADR-017: Tambahan Order Spare Part & aturan Planning Job (jawaban Owner 2026-10-05)
- Tanggal: 2026-10-05
- Status: ACCEPTED (butir *tafsiran* menunggu konfirmasi)
- Menjawab: Q9, Q10, Q11, Q12 (docs/prd-analysis.md)
- Keputusan Order Spare Part (melengkapi ADR-016):
  - **Jumlah** (bilangan bulat ≥ 1, default 1), **prioritas**, dan **nomor part** ditambahkan.
  - *Tafsiran:* prioritas = Rendah / Sedang / Tinggi (default Sedang), ikon bar sinyal; nomor part **opsional** (tidak selalu diketahui di lapangan).
- Keputusan Planning Job:
  - **Dibuat oleh Owner** dan ditugaskan ke satu Pengawas.
  - Field: Pengawas, unit, nama pekerjaan, lokasi, deskripsi, **estimasi mulai**, **estimasi selesai** (tanggal, selesai ≥ mulai), status. **Tanpa foto.**
  - **Status:** Direncanakan → Berjalan → Selesai, plus Dibatalkan. Ikon satu keluarga lingkaran (CircleDashed, CircleDot, CircleCheck, CircleX) + teks + warna.
  - *Tafsiran:* Pengawas yang ditugaskan mengubah status pekerjaannya (Direncanakan→Berjalan, Berjalan→Selesai); Owner boleh mengubah ke status apa pun, termasuk Dibatalkan. Waktu mulai/selesai aktual dicatat otomatis saat status berubah.
  - *Tafsiran:* Pengawas hanya melihat planning yang ditugaskan kepadanya; Owner melihat semua serta mengubah/menghapus (soft delete).
- Konsekuensi: Izin `planning-job:create` dan `planning-job:view-all` (SUPER_ADMIN); perubahan status dicek di server dengan tabel transisi.

### ADR-018: Laporan Data — cakupan, PDF ditunda, PIN gate (jawaban Owner 2026-10-05)
- Tanggal: 2026-10-05
- Status: ACCEPTED (butir *tafsiran* menunggu konfirmasi)
- Menjawab: Q13, Q14, Q15 (docs/prd-analysis.md)
- Keputusan:
  - **Cakupan: semua modul** — Laporan Kerja, Order Spare Part, Planning Job — dengan filter tanggal, unit, Pengawas, dan status/prioritas sesuai modul (PRD §17).
  - **Export PDF ditunda** atas permintaan Owner ("tidak usah dulu"); dijadwalkan ulang bila diminta.
  - **Hanya Owner** yang membuka Laporan Data (ADR-010 dikonfirmasi).
  - **PIN gate diperlukan** (PRD §17 "secondary PIN gate").
  - *Tafsiran:* PIN Laporan Data = PIN 6 digit terpisah milik akun Owner, dibuat/diganti dengan konfirmasi password. Setelah PIN benar, Laporan Data terbuka **15 menit** untuk sesi login itu saja (bisa dikunci manual). Salah PIN 5× → dikunci 15 menit. Semua percobaan dicatat di audit log.
  - *Tafsiran:* rentang tanggal default = awal bulan berjalan s.d. hari ini; tanggal Spare Part = waktu dicatat, tanggal Planning = estimasi mulai.
- Konsekuensi: kolom `user.data_pin_hash` dan `session.data_unlocked_until`.

### ADR-019: Strategi PWA & offline (antrean kirim di browser)
- Tanggal: 2026-10-05
- Status: ACCEPTED
- Konteks: PRD §19, §23–§25. Background Sync API belum didukung Safari/iOS (riset), dan server action Next.js tidak bisa dipanggil dari service worker.
- Keputusan:
  - **Service worker manual** (`public/sw.js`, tanpa library): aset `/_next/static` & ikon cache-first; halaman lapangan tertentu (Beranda, daftar & form Laporan Kerja/Spare Part) network-first dengan cadangan cache; `/offline` sebagai cadangan terakhir. **API, server action, dan foto tidak pernah di-cache.**
  - **Pemanasan cache:** untuk Pengawas, form & daftar disimpan ke cache (beserta aset JS/CSS-nya) sekali per sesi browser setelah SW aktif, sehingga form bisa dibuka offline walau belum pernah dikunjungi.
  - **Antrean kirim di browser (outbox):** Simpan saat offline / ada foto tertunda / gagal jaringan → draft diberi status `queued`. `SyncProvider` mengirim antrean saat aplikasi dibuka, saat event `online`, tiap 30 dtk selama antrean ada, dan lewat "Kirim sekarang". Urutan per draft: unggah foto tertunda → kirim data. Idempoten (id client, ADR-004).
  - **Validasi di HP** dengan schema zod yang sama dengan server sebelum masuk antrean; kesalahan bisnis dari server saat sync → status `failed` dengan pesan, user memperbaiki lewat form.
  - **Perangkat bersama:** setiap draft menyimpan `userId`; draft hanya ditampilkan/dikirim untuk akun pemiliknya. Logout menghapus cache halaman (berisi data user). Draft tidak dihapus saat logout agar data lapangan tidak hilang.
  - Status tampil dengan bahasa nasib data: "Draft di HP", "Menunggu dikirim", "Mengirim data…", "Gagal dikirim".
- Konsekuensi: Data antre baru terkirim ketika aplikasi dibuka kembali (iOS tidak mengirim di latar belakang) — dijelaskan di banner. Mengubah strategi cache = naikkan `VERSION` di `sw.js`.

### ADR-020: Export PDF Laporan Data & data demo
- Tanggal: 2026-10-06
- Status: ACCEPTED (Owner meminta export PDF dibuat sekarang, membatalkan penundaan di ADR-018)
- Keputusan:
  - PDF dibuat di server dengan **pdf-lib** (pure JS, tanpa modul native, font standar Helvetica/WinAnsi) — `src/lib/pdf/report.ts`. A4 lanskap: kop My PASKAM, judul modul, rentang tanggal, filter, pencetak & waktu cetak, kotak ringkasan, tabel (teks dibungkus, header diulang tiap halaman), footer "Halaman x dari y".
  - Isi per modul sama dengan layar Laporan Data (ringkasan + per unit + detail). **Tanpa foto** untuk saat ini. Maks. 2.000 baris per export (catatan di PDF bila terpotong).
  - Akses `GET /api/laporan-data/pdf?<filter>`: Owner + PIN Laporan Data sedang terbuka; setiap export dicatat `DATA_EXPORTED`. `Cache-Control: private, no-store`.
  - **Data demo** lewat `npm run demo:seed` (`scripts/seed-demo.ts`): deterministik, tanggal relatif hari ini, foto ilustrasi di `scripts/demo-assets/`. Menolak jalan di produksi; menolak menimpa database berisi data kecuali `--reset` (menghapus SEMUA data).
- Konsekuensi: dependency baru `pdf-lib`.

### ADR-021: Owner juga bisa mencatat Laporan Kerja & Order Spare Part (revisi Owner 2026-10-06)
- Tanggal: 2026-10-06
- Status: ACCEPTED — merevisi ADR-014 & ADR-016 ("Owner hanya melihat")
- Konteks: Owner perlu bisa mencatat sendiri bila tidak ada Pengawas di lokasi.
- Keputusan:
  - `laporan-kerja:create` dan `spare-part:create` → SUPER_ADMIN & PENGAWAS. Pencatat (`supervisor_id`) = akun yang login, termasuk Owner; tampil "Nama (Owner)".
  - Owner mengubah/menghapus hanya data **yang ia catat sendiri**; data Pengawas tetap hanya bisa dilihat Owner.
  - **Pengawas tidak bisa mengubah/menghapus data Pengawas lain maupun data Owner** (dikonfirmasi Owner; tetap seperti sebelumnya, diuji E2E).
  - Filter Pengawas di Laporan Data ikut menampilkan Owner.

### ADR-022: Pilih unit dulu sebelum form Laporan Kerja & Order Spare Part (permintaan Owner 2026-10-06)
- Tanggal: 2026-10-06
- Status: ACCEPTED
- Konteks: Owner meminta alur seperti lembar kerja lapangan: tekan Buat → pilih unit (kartu per unit) → baru muncul form.
- Keputusan:
  - Saat membuat baru tanpa unit, form menampilkan **pilihan unit** (grid kartu besar, 2/3/4 kolom) lebih dulu; setelah dipilih, form tampil dengan unit terkunci di atas + tombol **Ganti**. Unit ikut di URL (`?draft=…&unit=…`) sehingga tahan muat ulang; semuanya di sisi browser sehingga tetap jalan offline (halaman dari cache).
  - Ikon unit: **ikon kustom bergaya Lucide** (grid 24, garis 2, ujung membulat) — excavator, dump truck, mobil derek — karena Lucide tidak menyediakannya. Jenis ditentukan dari nama unit (`src/lib/unit-visual.ts`, asumsi PASKAM = excavator); unit lain memakai `Truck`.
  - Daftar kartu mengikuti master data Unit (aktif), sehingga unit ke-7 cukup ditambahkan Owner di menu Unit.
  - **Revisi (Owner, 2026-10-06):** kartu unit tampil **langsung di halaman daftar** Laporan Kerja & Order Spare Part (grid ringkas 3/4/6 kolom) dan **tombol Buat/Catat dihapus**. Menekan kartu membuka form dengan unit terisi (`/…/baru?unit=…`). Layar pilih unit di dalam form tetap dipakai untuk jalur tombol "+" dan tombol Ganti.

### ADR-023: Kolom Laporan Data mengikuti lembar Excel Owner
- Tanggal: 2026-10-06
- Status: ACCEPTED
- Konteks: Owner membandingkan Laporan Data dengan lembar Excel acuan dan menemukan ketidaksesuaian (urutan kolom, tanggal tanpa hari, dokumentasi tidak tampil, deskripsi pekerjaan planning tidak tampil).
- Keputusan:
  - **Laporan Kerja:** Pengawas · Hari, tanggal · Operator · BBM · Jam/HM · Lokasi · *Unit* · Dokumentasi. (Excel menulis "hari tanggal" dan "tngl/hari" — dianggap satu kolom; menunggu konfirmasi.)
  - **Order Spare Part:** Nama unit · Spare part · Lokasi · Dokumentasi · *Jumlah · Prioritas · No. part · Dicatat · Pengawas*.
  - **Planning Job:** Nama pengawas · Nama job · Lokasi job · Pekerjaan · Estimasi mulai · *Estimasi selesai · Status · Unit*.
  - Kolom bercetak miring = tambahan yang sebelumnya diminta Owner (ADR-016/017), diletakkan **setelah** kolom Excel agar tidak hilang.
  - **Dokumentasi** di web = foto mini (maks. 3, klik untuk perbesar); di PDF = jumlah foto ("2 foto"). Menyisipkan foto ke PDF butuh thumbnail kecil di server agar ukuran file wajar — ditunda sampai diminta.
  - Halaman Laporan Data memakai area konten lebar (`max-w-6xl`); tabel di desktop, kartu label/nilai berurutan sama di HP.

### ADR-024: Hosting Vercel + Supabase
- Tanggal: 2026-10-14
- Status: ACCEPTED (Owner meminta panduan deploy Vercel + Supabase — menjawab Q23 hosting)
- Keputusan:
  - Aplikasi di **Vercel** (region `sin1` Singapura, `vercel.json`); database **Supabase PostgreSQL** region Singapura; foto di **Supabase Storage** bucket privat `paskam`.
  - Runtime memakai **pooler transaksi** (port 6543) via `DATABASE_URL` dengan pool kecil per instance (`DATABASE_POOL_MAX`, default 5); migrasi & script admin memakai **session pooler/direct** via `DIRECT_URL` (`prisma.config.ts`).
  - Driver `supabase` di `src/lib/storage/drivers.ts` memakai REST API Storage dengan secret/service key **hanya di server** (tanpa SDK, tanpa dependency baru). Browser tetap mengambil foto lewat `/api/foto/:id`.
  - `npm run build` = `prisma generate && next build` (client Prisma tidak di-commit). Migrasi produksi dijalankan manual: `npm run db:deploy`.
  - Script data demo memakai driver yang sama; `--reset` ke database non-lokal wajib `--confirm-remote`.
- Revisi 2026-10-15: proyek Supabase Owner dibuat di **Seoul** (`ap-northeast-2`), bukan Singapura → region fungsi Vercel diubah ke **`icn1`** (Seoul) agar aplikasi & database di region yang sama (atas persetujuan Owner).
- Konsekuensi: Panduan langkah demi langkah di `docs/deploy.md`. Belum diuji ke akun Vercel/Supabase sungguhan (driver diuji dengan unit test fetch tiruan). Error monitoring masih terbuka.

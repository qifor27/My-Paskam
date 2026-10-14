# Panduan Deploy: Vercel + Supabase

> Untuk: Owner / admin teknis yang menaruh My PASKAM di internet.
> Arsitektur: **Vercel** (aplikasi Next.js) + **Supabase** (PostgreSQL + Storage foto). Keputusan: ADR-024.
> Status: konfigurasi sudah disiapkan di kode (driver Supabase Storage, build, region). **Belum pernah dicoba ke akun Vercel/Supabase sungguhan** — lakukan langkah "Cek setelah deploy" di bawah.

## Gambaran

```text
HP / laptop ──HTTPS──► Vercel (Next.js, region Singapura sin1)
                          │ DATABASE_URL (pooler transaksi :6543)
                          ├────────► Supabase PostgreSQL
                          │ SUPABASE_SERVICE_ROLE_KEY (server saja)
                          └────────► Supabase Storage, bucket PRIVAT "paskam"
Komputer admin ──DIRECT_URL (:5432)──► migrasi database & buat akun Owner
```

Foto **tidak pernah** dibuka langsung dari Supabase oleh browser; semua lewat `/api/foto/:id` yang memeriksa izin.

## 0. Yang perlu disiapkan

- Akun **GitHub**, **Vercel**, **Supabase** (paket gratis cukup untuk mencoba; lihat "Batas paket gratis").
- Di komputer admin: Node.js 22, repo ini, `npm install` sudah dijalankan.
- Waktu: ±30–45 menit.

## 1. Simpan kode di GitHub

Repo ini belum punya remote. Buat repository **private** baru di GitHub (tanpa README), lalu:

```bash
git remote add origin git@github.com:<akun>/my-paskam.git
git push -u origin main
```

Setelah push, workflow CI (`.github/workflows/ci.yml`) akan berjalan pertama kali — pastikan hijau.

## 2. Buat proyek Supabase

1. supabase.com → **New project**.
2. Nama: `my-paskam`. **Region: Southeast Asia (Singapore)** (dekat dengan pengguna & region Vercel `sin1`).
3. Buat **database password** yang kuat dan **simpan** (dibutuhkan di connection string).

### 2a. Ambil connection string

Buka proyek → tombol **Connect** (atas). Salin dua alamat (ganti `[YOUR-PASSWORD]`):

| Variabel | Pilihan di Supabase | Port | Dipakai untuk |
|---|---|---|---|
| `DATABASE_URL` | **Transaction pooler** | 6543 | Aplikasi di Vercel (serverless) |
| `DIRECT_URL` | **Session pooler** | 5432 | Migrasi & script dari komputer admin |

> "Direct connection" (`db.<ref>.supabase.co`) biasanya hanya IPv6; bila jaringan Anda tidak mendukung IPv6, pakai **Session pooler** untuk `DIRECT_URL`.

### 2b. Buat bucket foto (WAJIB privat)

1. Menu **Storage** → **New bucket**.
2. Nama: `paskam`.
3. **Public bucket: OFF** (privat).
4. (Disarankan) Restrict file size: `2 MB`; Allowed MIME types: `image/jpeg, image/webp`.

Tidak perlu membuat policy RLS: aplikasi mengakses bucket dari server memakai secret key.

### 2c. Ambil secret key

**Project Settings → API Keys** → salin **secret key** (`sb_secret_…`). Bila proyek masih memakai kunci lama, salin **service_role** (diawali `eyJ…`). Keduanya didukung.

> Kunci ini setara akses admin ke Storage & database. **Jangan** pernah ditaruh di variabel berawalan `NEXT_PUBLIC_`, di kode, atau di chat.

## 3. Siapkan database dari komputer admin

Jalankan di terminal (nilai hanya hidup di sesi terminal itu, tidak tersimpan ke repo):

```bash
export DIRECT_URL="postgresql://postgres.<ref>:<password>@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
export DATABASE_URL="$DIRECT_URL"

npm run db:deploy        # membuat semua tabel + 6 unit awal (PASKAM 1–4, DUMP, TOWING)
npm run owner:create     # membuat akun Owner pertama (nama, email, username, password)
```

Cek di Supabase → **Table Editor**: tabel `user`, `unit` (6 baris), `laporan_kerja`, dst. sudah ada.

### (Opsional) Isi data demo di Supabase

Hanya untuk presentasi — **jangan** di database produksi yang dipakai sungguhan.

```bash
export STORAGE_DRIVER=supabase
export SUPABASE_URL="https://<ref>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."
export SUPABASE_STORAGE_BUCKET=paskam
npm run demo:seed        # hanya jalan bila database masih kosong
```

`--reset` ke database non-lokal **ditolak** kecuali ditambah `--confirm-remote` (menghapus SEMUA data). Akun demo: `docs/demo.md` — ganti password/PIN sebelum dipakai orang lain.

## 4. Buat proyek di Vercel

1. vercel.com → **Add New… → Project** → impor repository GitHub `my-paskam`.
2. Framework: **Next.js** (otomatis). Build command & output: biarkan bawaan (`npm run build` sudah menjalankan `prisma generate`).
3. **Environment Variables** (Production, juga Preview bila dipakai):

| Nama | Nilai |
|---|---|
| `DATABASE_URL` | Transaction pooler (port **6543**) |
| `DATABASE_POOL_MAX` | `5` |
| `APP_TIME_ZONE` | `Asia/Jakarta` (atau `Asia/Makassar` / `Asia/Jayapura`) |
| `STORAGE_DRIVER` | `supabase` |
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | secret key dari langkah 2c |
| `SUPABASE_STORAGE_BUCKET` | `paskam` |

`DIRECT_URL` **tidak perlu** di Vercel (migrasi dijalankan dari komputer admin).

4. **Deploy**. Region fungsi sudah diset Singapura (`sin1`) lewat `vercel.json`.

## 5. Cek setelah deploy (wajib)

Buka URL `https://<proyek>.vercel.app`:

- [ ] Halaman login tampil; login **Owner** berhasil.
- [ ] Akun → Pengawas → tambah 1 Pengawas; logout; login sebagai Pengawas berhasil.
- [ ] Pengawas: Laporan Kerja → pilih unit → isi + **foto** → Simpan → detail menampilkan foto.
- [ ] Supabase → Storage → bucket `paskam` → ada file `photos/laporan-kerja/<id>/<id>.jpg`.
- [ ] Buka URL foto langsung dari Supabase (tanpa login) → **ditolak** (bucket privat).
- [ ] Owner: Data → buat PIN → filter → **Export PDF** terunduh.
- [ ] HP: buka situs → Akun → **Pasang aplikasi** → aplikasi terpasang.
- [ ] HP mode pesawat: buka form → isi → Simpan → "Menunggu dikirim" → matikan mode pesawat → terkirim otomatis.
- [ ] Vercel → **Logs**: tidak ada error merah berulang.

## 6. Domain sendiri (opsional)

Vercel → Project → **Settings → Domains** → tambah mis. `paskam.perusahaan.co.id` → ikuti instruksi DNS (CNAME). HTTPS otomatis. Setelah domain aktif, pengguna perlu memasang ulang PWA dari domain baru.

## 7. Alur update

1. Kerjakan & uji di lokal (`npm run check`).
2. **Bila ada migrasi baru** (folder `prisma/migrations` berubah): jalankan dulu `npm run db:deploy` dengan `DIRECT_URL` Supabase.
3. `git push` ke `main` → Vercel otomatis build & deploy. Gagal build = versi lama tetap jalan.
4. Rollback cepat: Vercel → Deployments → versi sebelumnya → **Promote to Production** (catatan: migrasi database tidak ikut mundur).

## 8. Backup

- Cek fitur backup di halaman paket Supabase Anda. Per 2025, backup harian otomatis yang bisa dipulihkan sendiri tersedia di paket berbayar; paket gratis tidak menjaminnya.
- Minimal lakukan dump berkala dari komputer admin:

```bash
pg_dump "$DIRECT_URL" --no-owner --format=custom --file="paskam-$(date +%F).dump"
```

- Foto ada di Storage, **tidak** ikut `pg_dump`. Untuk arsip foto, unduh bucket berkala (Storage → bucket → download) atau upgrade paket.
- Simpan file backup di tempat terpisah (bukan hanya di laptop yang sama).

## 9. Batas paket gratis (cek ulang, bisa berubah)

Per informasi 2025: Supabase Free ±500 MB database, ±1 GB storage, proyek **dijeda otomatis** bila tidak aktif ±1 minggu (perlu di-*restore* dari dasbor). Vercel Hobby untuk penggunaan non-komersial. Untuk operasional perusahaan sehari-hari, pertimbangkan **Supabase Pro** dan **Vercel Pro**. Foto dikompres ±200–500 KB, jadi 1 GB ≈ 2.000–5.000 foto.

## 10. Keamanan — checklist

- [ ] Bucket `paskam` **privat**.
- [ ] Secret key hanya di Environment Variables Vercel; tidak ada di repo (`git grep sb_secret` kosong).
- [ ] Password Owner kuat; akun & PIN demo diganti/dihapus di produksi.
- [ ] Repo GitHub **private**.
- [ ] Bila secret key bocor: Supabase → API Keys → buat baru & cabut yang lama → perbarui di Vercel → redeploy.

## 11. Masalah umum

| Gejala | Penyebab & solusi |
|---|---|
| Build gagal di `prisma generate` | `DATABASE_URL` belum diisi di Vercel. |
| Halaman "Halaman gagal dimuat" | Database tidak terjangkau: cek `DATABASE_URL` (port 6543, password), proyek Supabase tidak sedang dijeda. |
| Simpan foto gagal / foto tidak tampil | `STORAGE_DRIVER` bukan `supabase`, nama bucket salah, atau secret key salah. Lihat Vercel Logs (`Supabase Storage … gagal (status)`). |
| `npm run db:deploy` timeout | Pakai Session pooler (5432) untuk `DIRECT_URL`, bukan Transaction pooler. |
| Jam di laporan meleset | `APP_TIME_ZONE` belum diisi. |
| Login selalu kembali ke halaman login | Akses lewat `http://` — cookie aman butuh HTTPS (Vercel sudah HTTPS). |
| Supabase "paused" | Paket gratis dijeda karena tidak aktif — Restore dari dasbor. |

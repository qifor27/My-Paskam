# Design System — "Soft Operational"

> Status: **Aktif** sejak 2026-10-05 (ADR-013). Sumber token: `src/app/globals.css` (`@theme`).
> Arah visual dipilih Owner dari gambar referensi (aplikasi mobile terang, rounded, biru gradien) dengan sentuhan oranye.
> Riset pendukung: [`docs/research/Inspirasi UI UX aplikasi lapangan.md`](research/Inspirasi%20UI%20UX%20aplikasi%20lapangan.md).
> Diperbarui setiap ada token, komponen, atau pola UI baru. Referensi hidup: `/dev/ui` (hanya mode development).

## 1. Prinsip

1. **Terang, lega, lembut**: latar kanvas abu kebiruan sangat muda, kartu putih dengan shadow lembut, sudut membulat.
2. **Biru = utama, oranye = aksen**: biru untuk identitas *dan* aksi utama; oranye hanya untuk aksi "buat baru" dan sorotan kecil.
3. **Fungsi tetap nomor satu** (PRD §3): setiap elemen punya tujuan operasional. Gaya lembut tidak boleh mengorbankan kontras, ukuran sentuh, atau kejelasan status.
4. **Konsisten lewat token**: jangan menulis warna hex, radius, atau shadow langsung di komponen; pakai token di bawah.

## 2. Warna

### Biru utama (`brand-*`)
| Token | Hex | Pakai untuk |
|---|---|---|
| `brand-50` | `#EEF4FF` | Latar item aktif (sidebar, segmented), hover lembut |
| `brand-100` | `#DCE7FE` | Avatar inisial |
| `brand-200` | `#BCD0FB` | Border hover kartu |
| `brand-600` | `#2563EB` | Awal gradien, ikon/teks link (teks putih 5,2:1) |
| `brand-700` | `#1D4ED8` | Teks aktif, link (6,7:1 di putih) |
| `brand-800/900` | `#1E40AF` / `#1E3A8A` | Teks di latar biru muda |
| `brand-indigo` | `#4F46E5` | Ujung gradien (teks putih 6,3:1) |

**Gradien** `bg-primary-gradient` (135°, `brand-600` → `brand-indigo`) **hanya** untuk: tombol utama, hero card Beranda, dan BrandMark. Tidak untuk teks, latar halaman, atau kartu biasa.

### Oranye aksen (`accent-*`)
| Token | Hex | Pakai untuk |
|---|---|---|
| `accent-50` | `#FFF4EC` | Latar sorotan kecil |
| `accent-600` | `#EA580C` | Isian tombol "+" (FAB), tombol "Buat baru" di sidebar, varian `accent` (ikon putih 3,6:1) |
| `accent-700` | `#C2410C` | Teks oranye, hover tombol aksen |

Oranye **tidak** dipakai untuk status, tombol utama form, atau latar besar. Maksimal satu elemen oranye menonjol per layar.

### Tile ikon pastel per modul
| Modul | Latar | Ikon |
|---|---|---|
| Laporan Kerja / Beranda / Akun | `tile-blue-bg` `#EAF1FF` | `#2563EB` |
| Order Spare Part | `tile-orange-bg` `#FFF1E7` | `#EA580C` |
| Planning Job | `tile-violet-bg` `#F2EEFF` | `#7C3AED` |
| Laporan Data | `tile-green-bg` `#E8F7F0` | `#059669` |
| Pengawas | `tile-cyan-bg` `#E7F6FA` | `#0E7490` |

Semua ikon ≥ 3:1 terhadap latarnya (WCAG non-text). Warna tile ditetapkan di `src/lib/navigation.ts` (`tile`), dirender oleh `ModuleTile`.

### Status (ADR-012)
Teks status memakai nada tergelap agar ≥ 7:1 (keterbacaan di bawah matahari).

| Nada | Latar | Teks | Contoh label |
|---|---|---|---|
| neutral | `neutral-50` | `neutral-700` | Draft, Nonaktif |
| info | `brand-50` | `brand-800` | Menunggu |
| success | `success-50` | `success-800` | Aktif, Disetujui |
| warning | `warning-50` (kuning) | `warning-900` | Perlu dicek |
| danger | `danger-50` | `danger-800` | Ditolak, Gagal |

Warning sengaja **kuning**, bukan oranye, agar tidak tertukar dengan aksen aksi.

### Netral
`canvas #F5F7FB` (latar halaman) · `surface #FFFFFF` (kartu, input) · `border #E5E9F2` · `border-strong #CFD6E4` (tombol secondary) · `ink #0F172A` (16,5:1) · `ink-muted #475569` (7,1:1 di kanvas) · `placeholder #64748B`.

Mode terang saja untuk MVP (ADR-005).

## 3. Tipografi

- Font: **Inter**, di-host sendiri lewat `next/font` (konsisten di semua HP, tersedia offline).
- Skala: judul halaman `text-2xl font-bold tracking-tight` · judul seksi `text-base font-semibold` · isi `text-sm`/`text-base` · label kecil `text-xs font-medium`.
- **Sentence case** di semua label, tombol, dan judul seksi ("Simpan", "Coba lagi", "Aktivitas terbaru"). Tidak memakai huruf kapital semua (ADR-013).
- Angka (HM, BBM, jumlah, tanggal di daftar): `tabular-nums`.
- Format tanggal hanya lewat `formatDateTime()` / `greeting()` di `src/lib/format.ts` (ADR-011).

## 4. Bentuk, jarak, shadow

| Token | Nilai | Pakai untuk |
|---|---|---|
| `rounded-full` | pill | Tombol, segmented control, badge status, avatar, item sidebar |
| `--radius-control` | 14 px | Input, alert, tile ikon, item daftar dalam sheet |
| `--radius-card` | 20 px | Kartu, hero card, grid aksi cepat |
| `--radius-sheet` | 28 px | Bottom sheet / dialog |
| `shadow-card` | lembut berlapis | Kartu, tombol kembali |
| `shadow-raised` | lebih tinggi | Sheet / dialog |
| `shadow-primary` | bayangan biru | Tombol utama, hero card, BrandMark |
| `shadow-accent` | bayangan oranye | Tombol "+" / "Buat baru" |

Jarak antar seksi halaman `gap-6`/`gap-7`; padding kartu `p-4`/`p-5`. **Satu level kartu saja**: jangan menaruh Card di dalam Card.

## 5. Komponen

| Komponen | Lokasi | Catatan |
|---|---|---|
| Button | `components/ui/button.tsx` | Pill. Varian: `primary` (gradien biru), `accent` (oranye, jarang), `secondary` (putih + border), `inverse` (putih di atas hero), `danger`, `danger-outline`, `ghost`. Ukuran `lg` 56 px, `md` 48 px, `sm` 44 px, `icon` 48 px. `loading` + `loadingText` men-disable tombol. Pressed = skala 98%. Focus = ring 4 px biru transparan. |
| Input | `components/ui/input.tsx` | 48 px, radius 14 px, font 16 px (anti auto-zoom iOS), ring fokus lembut, `aria-invalid` merah. |
| Field | `components/ui/field.tsx` | Label + kontrol + error inline (ikon + teks `danger-800`) / hint. |
| Card | `components/ui/card.tsx` | Putih, radius 20 px, border tipis, `shadow-card`. |
| StatusBadge | `components/ui/status-badge.tsx` | Pill: ikon + teks + warna, 5 nada, maks. 200 px. |
| Alert | `components/ui/alert.tsx` | Banner error/warning/success/info + slot tombol pemulihan. |
| StickyActionBar | `components/ui/sticky-action-bar.tsx` | Aksi form di zona jempol, menempel di atas bottom nav (mobile); latar kanvas. |
| ModuleTile / NavIcon | `components/nav-icon.tsx` | Tile pastel + ikon Lucide per modul (PRD §5). |
| BrandMark / Wordmark | `components/brand.tsx` | Logo sementara: tile gradien + ikon helm; "My **PASKAM**". |
| Avatar | `components/avatar.tsx` | Lingkaran inisial (`brand-100`/`brand-800`). |
| CreateSheet | `components/create-sheet.tsx` | Tombol "+" oranye (FAB) / "Buat baru" (sidebar) → `<dialog>` daftar aksi sesuai izin. Sheet dari bawah di mobile, dialog di tengah di desktop. Overlay blur (glass diizinkan). |
| BottomNav / SideNav | `components/app-nav.tsx` | Lihat §6. |
| PageHeader | `components/page-header.tsx` | Judul besar + tombol kembali bulat + aksi. |
| EmptyState | `components/empty-state.tsx` | Kartu + tile ikon + judul + penjelasan + aksi (PRD §28). |
| ErrorAlert / ErrorScreen | `components/error-alert.tsx`, `error-screen.tsx` | `PublicError` / error halaman + kode laporan + "Coba lagi". |
| NetworkBanner | `components/network-status.tsx` | Banner kuning saat offline. |
| AccessDenied | `components/access-denied.tsx` | Pesan error otorisasi PRD §21. |
| ModulePlaceholder | `components/module-placeholder.tsx` | Sementara untuk modul/form yang belum dibangun. |
| ChoiceChips | `components/ui/choice-chips.tsx` | Radio group berbentuk pill untuk opsi sedikit (unit, BBM 1–6, Hari ini/Kemarin). Terpilih = isian biru. `size="square"` 48 px untuk angka. |
| Textarea | `components/ui/textarea.tsx` | Sama dengan Input, min. 112 px. |
| PhotoGrid | `components/photo-grid.tsx` | Grid 3 kolom, overlay proses/progress %, overlay gagal + "Coba lagi", tanda terunggah, tombol hapus; tombol **Kamera** & **Galeri** terpisah; penghitung "n/6 foto". |

## 6. Layout

- **Mobile (< 768 px)**: tanpa header bar. Beranda dibuka dengan sapaan ("Selamat pagi") + nama + avatar (ke `/akun`); halaman lain memakai `PageHeader`. **Bottom nav**: 2 item + tombol "+" oranye 56 px (menonjol 28 px ke atas, ring kanvas) + 2 item. Pengawas: Beranda, Laporan, ＋, Spare Part, Akun. Owner: Beranda, Laporan, ＋, Data, Akun. Latar `surface/95` + blur (fallback solid untuk `prefers-reduced-transparency`). Konten `pb-32`.
- **Desktop (≥ md)**: sidebar putih 256 px: BrandMark + Wordmark, tombol "Buat baru" oranye, menu (item aktif pill `brand-50`), grup "Administrasi", profil di bawah (ke `/akun`). Konten maks. `max-w-3xl`.
- **Beranda**: sapaan → hero card gradien (1 per halaman; Pengawas: "Buat laporan", Owner: ringkasan + "Buka Laporan Data") → grid **Menu** (tile pastel, 3–4 kolom) → (Owner) Administrasi → Aktivitas terbaru + "Lihat semua".
- **Akun**: kartu profil (avatar besar, role, kode/email) → menu admin (Owner) → tombol "Keluar" (`danger-outline`).
- iPhone: `viewport-fit=cover` + `env(safe-area-inset-*)` di atas dan bawah.

## 7. Pola interaksi

### Form data lapangan (contoh: Laporan Kerja)
- Satu halaman, dibagi **kartu per bagian** (Pekerjaan · Jam kerja & BBM · Dokumentasi foto), bukan wizard.
- Opsi ≤ ~8 → `ChoiceChips`; teks berulang → `Input` + `datalist` saran dari riwayat; angka → `inputMode="decimal"` + sufiks satuan, terima koma.
- Tanggal: chip "Hari ini/Kemarin" + input date (maks. hari ini).
- Error inline hilang begitu field diubah; saat submit gagal, fokus & scroll ke field pertama yang salah.
- Draft otomatis di HP; teks kecil "Draft tersimpan otomatis di HP" di bawah tombol.
- Status penyimpanan lokal: `StatusBadge tone="warning"` + ikon HardDrive "Tersimpan di HP".

### Daftar data
- Kelompok per tanggal ("Hari ini", "Kemarin", tanggal panjang) dengan judul seksi `text-sm font-semibold text-ink-muted`.
- Baris: judul tebal (unit · operator) + metrik ber-ikon kecil (`Timer`, `Fuel`, `Camera`) `tabular-nums` + baris konteks.
- Paginasi "Muat lebih banyak", bukan infinite scroll.


- **Form**: `useServerAction` dengan `onSubmit` (bukan prop `action`) agar isian tidak hilang (PRD §23). `VALIDATION` → inline; kategori lain → `ErrorAlert` di atas form. Aksi utama di `StickyActionBar`.
- **Feedback** (PRD §22): inline (validasi) · banner `Alert` (sistem/hasil aksi) · modal/sheet hanya untuk aksi destruktif, keamanan, atau pilihan seperti "Buat baru". **Toast tidak untuk error, server, izin, atau pesan kritis** (Carbon).
- **Konfirmasi** aksi yang mengeluarkan user (nonaktifkan): dua langkah inline.
- **Status**: selalu `StatusBadge` (ikon + teks + warna).
- **Motion**: transisi singkat untuk warna/skala; semua animasi punya `motion-reduce` (skeleton dan spinner berhenti).
- **Glass** hanya di: bottom nav dan overlay sheet/dialog. Tidak pernah bertumpuk.

## 8. Dilarang (PRD §4, diperbarui ADR-013)

- Emoji sebagai ikon atau di sapaan; maskot / ilustrasi karakter.
- Gradien di luar tombol utama, hero card, dan BrandMark; teks bergradien.
- Lebih dari satu hero card bergradien per halaman.
- Card di dalam card; kartu dengan border kiri berwarna; deretan stat banner; bento grid.
- Glow/neon; shadow tebal; floating blobs.
- Oranye untuk status atau sebagai tombol utama form.
- UI palsu tanpa fungsi (mis. kolom pencarian atau lonceng notifikasi yang belum ada fiturnya).
- Copywriting generik ("Empower your workflow").
- Dark mode permanen.

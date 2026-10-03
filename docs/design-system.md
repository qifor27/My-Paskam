# Design System

> Status: **Draft**. Sumber: PRD §3–§9, §22, §28–§29, §38.
> Diperbarui setiap ada token, komponen, atau pola UI baru.

## Prinsip
`FUNCTION > DECORATION` · `CLARITY > VISUAL EFFECT` · `USABILITY > TREND`
Jika efek visual tidak membantu user menyelesaikan pekerjaan, jangan gunakan.

## Warna
| Peran | Token Tailwind | Hex | Kontras vs putih |
|---|---|---|---|
| Brand (header, nav) | `brand-700` | `#1A4489` | 9.4:1 |
| Brand (active, link) | `brand-600` | `#1E4FA3` | 7.8:1 |
| Action (CTA utama) | `action-600` / hover `action-700` | `#C2410C` / `#9A3412` | 5.2:1 |
| Danger (HAPUS) | `danger-600` | `#C53030` | 5.5:1 |
| Success | `success-600` | `#15803D` | 5.0:1 |
| Warning | `warning-600` | `#B45309` | 5.0:1 |
| Teks utama / muted | `ink` / `ink-muted` | `#0F172A` / `#475569` | 16.5:1 / 7.6:1 |
| Latar halaman / kartu | `canvas` / `surface` | `#F4F6FA` / `#FFFFFF` | — |

Sumber token: `src/app/globals.css` (`@theme`). Oranye cerah (`#E8590C`, 3.6:1) sengaja **tidak** dipakai untuk teks putih karena gagal AA.
Mode terang saja untuk MVP (lebih terbaca di bawah sinar matahari), lihat ADR-005.

## Icon
Lucide, satu gaya, stroke width dan ukuran konsisten. Pemetaan: Laporan Kerja → Clipboard, Spare Part → Package, Planning → Calendar, Laporan Data → File/Chart, Pengawas → User, Settings → Settings.

## Button (PRD §8)
Komponen: `src/components/ui/button.tsx`. Varian: `primary` (oranye), `secondary`, `danger`, `ghost`. Ukuran `md` 48 px, `sm` 44 px, `icon` 48×48. Prop `loading` + `loadingText` otomatis men-disable tombol (PRD §29). Pressed = `translate-y-px` + warna lebih gelap; focus = ring biru. Referensi visual: `/dev/ui` (hanya di mode development).

State wajib: normal, hover, pressed, disabled, loading, focus. Tidak boleh hanya mengandalkan perubahan warna.

## Mobile (PRD §9)
Touch target ≥ 44–48 px, input besar, primary action mudah dijangkau satu tangan, feedback tidak bergantung pada hover.

## Glassmorphism (PRD §6)
Hanya untuk: login card, floating nav tertentu, overlay/modal, small highlight. Tidak boleh bertumpuk.

## Pola Feedback (PRD §22)
| Pola | Kapan |
|---|---|
| Inline error | Validasi field |
| Toast | Feedback ringan (berhasil disimpan) |
| Banner | Kondisi sistem (offline, storage hampir penuh) |
| Modal | Hanya untuk aksi destruktif, keamanan, atau konfirmasi penting |

## Dilarang (PRD §4)
Gradient berlebihan, card bertumpuk, emoji sebagai icon, glow/neon, gradient text, floating blobs, dekorasi animasi, copywriting generik.

## Komponen
| Komponen | Lokasi | Catatan | Ditambahkan |
|---|---|---|---|
| Button | `src/components/ui/button.tsx` | 4 varian, 6 state, loading | Sprint 0 (US-0.2) |
| Input | `src/components/ui/input.tsx` | Tinggi 48 px, font 16 px (mencegah auto-zoom iOS), state `aria-invalid` | Sprint 1 |
| Field | `src/components/ui/field.tsx` | Label + kontrol + error inline/hint; mengisi `id`, `aria-invalid`, `aria-describedby` | Sprint 1 |
| Alert | `src/components/ui/alert.tsx` | Banner error/warning/success/info + slot tombol pemulihan | Sprint 1 |
| ErrorAlert | `src/components/error-alert.tsx` | Menampilkan `PublicError` + kode laporan; tombol COBA LAGI hanya jika `retryable` | Sprint 1 |
| PageHeader | `src/components/page-header.tsx` | Judul + tombol kembali + aksi | Sprint 1 |
| AccessDenied | `src/components/access-denied.tsx` | Pesan error otorisasi PRD §21 | Sprint 1 |

### Pola form
- Pakai `useServerAction` (`src/hooks/use-server-action.ts`) dengan `onSubmit`, **bukan** prop `action`, agar React tidak mereset isian saat gagal (PRD §23).
- Error `VALIDATION` → inline per field; kategori lain → `ErrorAlert` di atas form.
- Konfirmasi aksi yang mengeluarkan user (nonaktifkan) memakai konfirmasi inline dua langkah, bukan modal.
- Segmented control (PENGAWAS/OWNER) memakai `role="radiogroup"`; item aktif berlatar biru (identitas), bukan oranye (oranye khusus aksi).

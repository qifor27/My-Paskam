# Data Demo

> Untuk presentasi & uji coba lokal. **Jangan dipakai di produksi** (ADR-020).

## Menyiapkan

```bash
docker compose up -d
npm run db:migrate
npm run demo:seed            # hanya jika database masih kosong
npm run demo:seed -- --reset # HAPUS SEMUA data lokal lalu isi data demo
npm run dev
```

## Akun

| Peran | Login | Password / PIN |
|---|---|---|
| Owner | `owner` atau `owner@paskam.demo` | `PaskamDemo2026` · PIN Laporan Data `123456` |
| Pengawas | `SPV001` Budi Santoso, `SPV002` Andi Pratama, `SPV003` Rina Kartika, `SPV004` Dedi Prasetyo | PIN `123456` |
| Pengawas nonaktif | `SPV005` Yoga Saputra | tidak bisa login (contoh status Nonaktif) |

## Isi

- **±168 Laporan Kerja** selama 30 hari terakhir (hari ini & kemarin lebih ramai), 1–2 foto ilustrasi per laporan; 3 di antaranya dicatat Owner.
- **18 catatan Order Spare Part** (jumlah, prioritas Rendah/Sedang/Tinggi, nomor part), 2 dicatat Owner.
- **14 Planning Job** dari 12 hari lalu s.d. 2 minggu ke depan: Selesai, Dibatalkan, Berjalan, Direncanakan.
- Unit awal PASKAM 1–4, DUMP, TOWING.

Data selalu sama setiap kali dibuat (PRNG ber-seed); tanggal mengikuti hari saat script dijalankan.

## Skenario demo singkat

1. **Pengawas** (SPV001) → Beranda: "Planning untuk Anda" → Mulai pekerjaan → Tandai selesai.
2. **Pengawas** → tombol + → Laporan Kerja → isi + foto → Simpan (coba juga dengan mode pesawat).
3. **Owner** → Laporan Kerja (semua Pengawas) → Planning (tab, batalkan/ubah status).
4. **Owner** → Data → PIN `123456` → filter unit/Pengawas → **Export PDF**.

# Fitur: <Nama Modul/Fitur>

> Sprint: <n> · Story: <US-x.y> · Status: Draft | In Progress | Done
> PRD: §<nomor> · ADR terkait: <ADR-xxx>

## 1. Tujuan
Masalah operasional apa yang diselesaikan, dan untuk siapa (Owner/Pengawas).

## 2. Business Rules
Hanya aturan yang tertulis di PRD atau ADR. Cantumkan sumbernya.

| Aturan | Sumber |
|---|---|
| | PRD §… / ADR-… |

## 3. Alur User
Langkah utama + alur offline/gagal.

## 4. Data
Tabel/field yang digunakan atau ditambahkan (detail di `docs/database.md`).

## 5. Otorisasi
| Aksi | SUPER_ADMIN | PENGAWAS |
|---|---|---|
| Lihat | | |
| Buat | | |
| Ubah | | |
| Hapus | | |

## 6. State UI
| State | Perilaku / pesan |
|---|---|
| Loading | |
| Success | |
| Empty | |
| Validation error | |
| Network error / offline | |
| Server error | |
| Permission error | |
| Session expired | |
| Retry (idempoten?) | |

## 7. API / Server Actions
Endpoint, input, output, kode error.

## 8. Testing
Test yang ditulis dan skenario manual yang diverifikasi.

## 9. Definition of Done (PRD §31)
- [ ] Business requirement sesuai
- [ ] UI selesai & mobile responsive
- [ ] Loading / error / empty state
- [ ] Validation (client + server)
- [ ] Server authorization
- [ ] Offline behavior (jika applicable)
- [ ] Test
- [ ] Security review
- [ ] TypeScript, lint, build lulus
- [ ] Tidak ada secrets / unrelated changes
- [ ] CHANGELOG + dokumen terkait diperbarui

## 10. Riwayat Perubahan
| Tanggal | Perubahan | Oleh |
|---|---|---|

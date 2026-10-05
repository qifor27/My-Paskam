# Fitur: Planning Job

> Sprint: 5 · Story: US-5.1, US-5.2 · Status: Done (butir *tafsiran* ditandai)
> PRD: §16 · ADR terkait: ADR-017

## 1. Tujuan
Owner merencanakan pekerjaan dan menugaskannya ke Pengawas; Pengawas melihat tugasnya dan melaporkan kapan mulai dan selesai.

## 2. Business Rules (ADR-017)
| Aturan | Sumber |
|---|---|
| Planning dibuat oleh Owner, ditugaskan ke satu Pengawas aktif | Owner |
| Field: Pengawas, unit, nama pekerjaan, lokasi, deskripsi, estimasi mulai, estimasi selesai (≥ mulai), status | PRD §16 + Owner |
| Tanpa foto | Owner |
| Status: Direncanakan → Berjalan → Selesai; Dibatalkan | Owner |
| Pengawas yang ditugaskan: Direncanakan→Berjalan ("Mulai pekerjaan"), Berjalan→Selesai ("Tandai selesai") | *tafsiran* |
| Owner: ubah ke status mana pun, termasuk Dibatalkan (konfirmasi) | *tafsiran* |
| Waktu mulai/selesai aktual dicatat otomatis | *tafsiran* |
| Pengawas hanya melihat planning yang ditugaskan kepadanya; Owner melihat, mengubah, menghapus (soft delete) | *tafsiran* |

## 3. Alur User
- **Owner:** "+" / "Buat" → form (nama, Pengawas [select], unit [chip], lokasi, deskripsi, estimasi mulai–selesai) → detail. Daftar dengan tab **Aktif / Selesai / Dibatalkan** (+ jumlah). Detail: ubah, ubah status, batalkan, hapus.
- **Pengawas:** Beranda → "Planning untuk Anda" (maks. 3 aktif) atau menu Planning → detail → satu tombol besar "Mulai pekerjaan" / "Tandai selesai".

## 4. Data
`planning_job` (status enum `PlanningStatus`, `started_at`, `completed_at`, CHECK selesai ≥ mulai). Detail: `docs/database.md`.

## 5. Otorisasi
| Aksi | SUPER_ADMIN | PENGAWAS |
|---|---|---|
| Lihat | ✓ semua | ✓ yang ditugaskan (lainnya: tidak ditemukan) |
| Buat / ubah / hapus | ✓ | ✗ |
| Ubah status | ✓ semua transisi | ✓ maju satu langkah, hanya miliknya |

Transisi dicek di server (`src/lib/planning/status.ts`, `access.ts`); tombol di UI hanya menampilkan transisi yang diizinkan.

## 6. State UI
| State | Perilaku |
|---|---|
| Loading | Skeleton halaman; tombol status "loading" pada tombol yang ditekan |
| Empty | Per tab ("Tidak ada planning aktif" + Buat planning untuk Owner) |
| Validation | Inline; error hilang saat field diubah (`clearFieldError`) |
| Error transisi | `ErrorAlert` "Status tidak bisa diubah dari X ke Y." |
| Retry | Simpan idempoten (id client); ubah status idempoten (status sama = sukses) |
| Belum ada Pengawas | Peringatan di form "Belum ada Pengawas aktif…" |

## 7. Server Actions
`savePlanning`, `setPlanningStatus`, `deletePlanning` — `src/app/(app)/planning-job/actions.ts`. Status dikirim lewat tombol submit (`name="status" value=…`, FormData dengan submitter).

## 8. Testing
- Unit: `planning/planning.test.ts` (transisi per role, timestamp, akses, schema).
- E2E (2026-10-05): 26 cek — validasi, hanya Pengawas yang bisa ditugaskan, idempotensi, visibilitas, transisi (lompat/batal ditolak untuk Pengawas, Owner bebas), timestamp, tab, edit, hapus, audit. Semua lulus.
- Interaktif (Puppeteer + Firefox): Pengawas menekan Mulai → Selesai; status berubah benar.

## 9. Definition of Done (PRD §31)
- [x] Business requirement sesuai (tafsiran ditandai)
- [x] UI selesai & mobile responsive
- [x] Loading / error / empty state
- [x] Validation (client + server + CHECK DB)
- [x] Server authorization (termasuk transisi status)
- [x] Offline behavior — tidak applicable untuk form Owner; aksi status butuh koneksi (pesan jaringan jelas)
- [x] Test
- [x] Security review (mandiri)
- [x] TypeScript, lint, build lulus
- [x] Tidak ada secrets / unrelated changes
- [x] CHANGELOG + dokumen terkait diperbarui

## 10. Riwayat Perubahan
| Tanggal | Perubahan | Oleh |
|---|---|---|
| 2026-10-05 | Implementasi awal Sprint 5 | Claude Code |

// Data demo My PASKAM (ADR-020): akun, laporan kerja + foto, spare part,
// planning dengan berbagai status. Tanggal relatif terhadap hari ini.
//
//   npm run demo:seed            # hanya jika database masih kosong
//   npm run demo:seed -- --reset # HAPUS semua data lalu isi ulang (development)
//   ... -- --reset --confirm-remote  # wajib bila DATABASE_URL bukan lokal (mis. Supabase)
// Foto ditulis lewat driver storage aktif (STORAGE_DRIVER=local|supabase).
//
// Tidak boleh dijalankan di produksi.
import { createHash, randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { hashSecret } from "../src/lib/auth/password";
import { shiftISO, todayISO, zonedDayStart } from "../src/lib/format";
import { driverFromEnv } from "../src/lib/storage/drivers";

try {
  process.loadEnvFile();
} catch {}

if (process.env.NODE_ENV === "production") {
  console.error("demo:seed tidak boleh dijalankan di produksi.");
  process.exit(1);
}

const RESET = process.argv.includes("--reset");
// Pengaman tambahan: reset database yang BUKAN lokal (mis. Supabase) wajib konfirmasi eksplisit.
const CONFIRM_REMOTE = process.argv.includes("--confirm-remote");
const STORAGE_DIR = path.resolve(process.env.STORAGE_DIR ?? "storage");
const ASSETS = path.resolve("scripts/demo-assets");

export const DEMO = {
  owner: { name: "Hendra Wijaya", email: "owner@paskam.demo", username: "owner", password: "PaskamDemo2026", dataPin: "123456" },
  pin: "123456",
  pengawas: [
    { name: "Budi Santoso", kode: "SPV001" },
    { name: "Andi Pratama", kode: "SPV002" },
    { name: "Rina Kartika", kode: "SPV003" },
    { name: "Dedi Prasetyo", kode: "SPV004" },
    { name: "Yoga Saputra", kode: "SPV005", inactive: true },
  ],
};

// PRNG ber-seed: data demo selalu sama setiap kali dibuat.
let seed = 20261006;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)]!;
const between = (min: number, max: number, step = 1) => Math.round((min + rand() * (max - min)) / step) * step;

const OPERATORS = ["Slamet Riyadi", "Joko Susilo", "Agus Salim", "Heru Wibowo", "Wahyu Hidayat", "Bambang Irawan", "Teguh Santoso", "Suryadi", "Rahmat Hidayat", "Imam Fauzi"];
const LOKASI = ["Pit Utara", "Pit Selatan", "Pit Timur", "Jalan Hauling KM 3", "Jalan Hauling KM 7", "Stockpile A", "Disposal Barat", "Workshop"];
const PEKERJAAN: Record<string, string[]> = {
  "PASKAM 1": ["Penggalian overburden blok B", "Loading material ke dump truck", "Perapian lereng tambang"],
  "PASKAM 2": ["Penggalian lapisan batubara seam 2", "Pembuatan saluran drainase", "Loading material ke dump truck"],
  "PASKAM 3": ["Perataan jalan hauling", "Pembentukan bench baru", "Penimbunan area disposal"],
  "PASKAM 4": ["Pembersihan area kerja setelah hujan", "Penggalian sump untuk pompa", "Loading material ke dump truck"],
  DUMP: ["Angkut overburden ke disposal", "Angkut batubara ke stockpile", "Angkut material timbunan jalan"],
  TOWING: ["Penarikan unit mogok ke workshop", "Pemindahan unit ke lokasi kerja baru", "Penarikan dump truck amblas"],
};
const UNIT_PHOTOS: Record<string, string[]> = {
  "PASKAM 1": ["excavator", "pit"],
  "PASKAM 2": ["excavator", "pit"],
  "PASKAM 3": ["grader", "pit"],
  "PASKAM 4": ["excavator", "pit"],
  DUMP: ["dump", "hauling"],
  TOWING: ["towing", "hauling"],
};
const SPARE_PARTS = [
  { name: "Filter oli mesin", no: "600-211-1340" },
  { name: "Selang hidrolik boom", no: "07102-20625" },
  { name: "Bearing roda depan", no: "6205-2RS" },
  { name: "Kampas rem", no: "56B-33-31220" },
  { name: "Filter udara", no: "600-185-4100" },
  { name: "Aki 12V 100Ah", no: null },
  { name: "Seal silinder bucket", no: "707-99-67090" },
  { name: "Lampu kerja LED", no: null },
  { name: "Gigi bucket (bucket tooth)", no: "205-70-19570" },
  { name: "V-belt kipas radiator", no: "04120-21754" },
];
const KERUSAKAN = [
  "Bocor di sambungan, oli merembes saat unit dioperasikan.",
  "Aus melebihi batas, berbunyi saat bergerak.",
  "Retak dan perlu diganti sebelum shift berikutnya.",
  "Tidak berfungsi setelah terkena air hujan.",
  "Patah saat menggali material keras.",
  "Kotor tersumbat debu, tenaga mesin turun.",
];
const PLANNING_JOBS = [
  "Perataan jalan hauling KM 3–5",
  "Pembuatan saluran drainase Pit Utara",
  "Pembersihan longsoran di Pit Selatan",
  "Penimbunan area disposal barat",
  "Pembuatan bench baru blok C",
  "Pemindahan unit ke lokasi kerja baru",
  "Perbaikan jalan akses stockpile",
  "Penggalian sump untuk pompa",
  "Perapian lereng tambang sisi timur",
  "Loading batubara untuk pengiriman",
  "Penarikan unit rusak ke workshop",
  "Pembersihan area kerja setelah hujan",
  "Pemasangan rambu jalan hauling",
  "Penggalian overburden blok D",
];

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const isLocalDb = /@(localhost|127\.0\.0\.1|db)(:\d+)?\//.test(dbUrl);
  if (RESET && !isLocalDb && !CONFIRM_REMOTE) {
    throw new Error("DATABASE_URL bukan database lokal. --reset akan MENGHAPUS SEMUA data di sana. Tambahkan --confirm-remote bila benar-benar yakin.");
  }
  const store = driverFromEnv(process.env, STORAGE_DIR);
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: dbUrl }) });
  try {
    const existing = await db.user.count();
    if (existing > 0 && !RESET) {
      throw new Error("Database sudah berisi data. Jalankan `npm run demo:seed -- --reset` untuk MENGHAPUS semua data dan mengisi data demo.");
    }
    if (RESET) {
      console.log("Menghapus data lama…");
      const oldPhotos = await db.photo.findMany({ select: { storagePath: true } });
      await store.deleteMany(oldPhotos.map((p) => p.storagePath)).catch((e: unknown) => console.warn("Sebagian foto lama tidak terhapus:", e));
      await db.$transaction([
        db.photo.deleteMany(),
        db.laporanKerja.deleteMany(),
        db.orderSparePart.deleteMany(),
        db.planningJob.deleteMany(),
        db.auditLog.deleteMany(),
        db.session.deleteMany(),
        db.rateLimit.deleteMany(),
        db.user.deleteMany(),
        db.unit.deleteMany({ where: { sortOrder: { gt: 6 } } }),
      ]);
      await db.unit.updateMany({ data: { isActive: true } });
      if ((process.env.STORAGE_DRIVER ?? "local") === "local") await rm(path.join(STORAGE_DIR, "photos"), { recursive: true, force: true });
    }

    const units = await db.unit.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    if (units.length === 0) throw new Error("Tabel unit kosong. Jalankan migrasi terlebih dahulu.");

    console.log("Membuat akun…");
    const pinHash = await hashSecret(DEMO.pin);
    const ownerId = randomUUID();
    await db.user.create({
      data: {
        id: ownerId,
        role: "SUPER_ADMIN",
        name: DEMO.owner.name,
        email: DEMO.owner.email,
        username: DEMO.owner.username,
        passwordHash: await hashSecret(DEMO.owner.password),
        dataPinHash: await hashSecret(DEMO.owner.dataPin),
      },
    });
    const pengawas = [];
    for (const p of DEMO.pengawas) {
      const id = randomUUID();
      await db.user.create({
        data: {
          id,
          role: "PENGAWAS",
          name: p.name,
          kodePengawas: p.kode,
          pinHash,
          isActive: !p.inactive,
          createdById: ownerId,
          lastLoginAt: p.inactive ? null : new Date(Date.now() - between(1, 30) * 3_600_000),
        },
      });
      if (!p.inactive) pengawas.push({ id, ...p });
    }

    const photoBytes = new Map<string, Buffer>();
    for (const name of new Set(Object.values(UNIT_PHOTOS).flat().concat(["workshop", "sparepart"]))) {
      photoBytes.set(name, await readFile(path.join(ASSETS, `${name}.jpg`)));
    }
    async function addPhotos(module: "LAPORAN_KERJA" | "ORDER_SPARE_PART", dir: string, recordId: string, uploader: string, names: string[], at: Date) {
      for (const [i, name] of names.entries()) {
        const id = randomUUID();
        const bytes = photoBytes.get(name)!;
        const key = `photos/${dir}/${recordId}/${id}.jpg`;
        await store.put(key, bytes, "image/jpeg");
        await db.photo.create({
          data: {
            id,
            module,
            recordId,
            storagePath: key,
            mimeType: "image/jpeg",
            sizeBytes: bytes.length,
            width: 1200,
            height: 900,
            sha256: createHash("sha256").update(bytes).digest("hex"),
            sortOrder: i,
            uploadedById: uploader,
            uploadedAt: at,
          },
        });
      }
    }

    const today = todayISO();
    const atLocal = (iso: string, hour: number, minute = 0) => new Date(zonedDayStart(iso).getTime() + (hour * 60 + minute) * 60_000);

    console.log("Membuat laporan kerja…");
    let laporanCount = 0;
    for (let back = 29; back >= 0; back--) {
      const tanggal = shiftISO(today, -back);
      for (const p of pengawas) {
        // Hari ini & kemarin lebih ramai agar Beranda terlihat aktif.
        const n = back <= 1 ? 2 : rand() < 0.15 ? 0 : between(1, 2);
        for (let k = 0; k < n; k++) {
          const unit = pick(units);
          const id = randomUUID();
          const created = atLocal(tanggal, between(15, 18), between(0, 59));
          const unitName = unit.name;
          await db.laporanKerja.create({
            data: {
              id,
              tanggal: new Date(`${tanggal}T00:00:00Z`),
              unitId: unit.id,
              operatorName: pick(OPERATORS),
              hmJam: between(4, 11, 0.5),
              bbm: unitName === "TOWING" ? between(15, 45, 0.5) : between(35, 140, 0.5),
              lokasi: pick(LOKASI),
              deskripsi: `${pick(PEKERJAAN[unitName] ?? PEKERJAAN["PASKAM 1"]!)}. Kondisi unit normal, tidak ada kendala berarti.`,
              supervisorId: p.id,
              createdById: p.id,
              createdAt: created,
              updatedAt: created,
            },
          });
          const photos = UNIT_PHOTOS[unitName] ?? ["pit"];
          await addPhotos("LAPORAN_KERJA", "laporan-kerja", id, p.id, photos.slice(0, between(1, photos.length)), created);
          laporanCount++;
        }
      }
    }

    // Owner sesekali mencatat sendiri saat tidak ada Pengawas di lokasi (ADR-021).
    for (const back of [3, 9, 16]) {
      const tanggal = shiftISO(today, -back);
      const unit = pick(units);
      const id = randomUUID();
      const created = atLocal(tanggal, 17, 30);
      await db.laporanKerja.create({
        data: {
          id,
          tanggal: new Date(`${tanggal}T00:00:00Z`),
          unitId: unit.id,
          operatorName: pick(OPERATORS),
          hmJam: between(4, 9, 0.5),
          bbm: between(30, 90, 0.5),
          lokasi: pick(LOKASI),
          deskripsi: `${pick(PEKERJAAN[unit.name] ?? PEKERJAAN["PASKAM 1"]!)}. Dicatat Owner karena Pengawas sedang cuti.`,
          supervisorId: ownerId,
          createdById: ownerId,
          createdAt: created,
          updatedAt: created,
        },
      });
      await addPhotos("LAPORAN_KERJA", "laporan-kerja", id, ownerId, [(UNIT_PHOTOS[unit.name] ?? ["pit"])[0]!], created);
      laporanCount++;
    }

    console.log("Membuat catatan spare part…");
    const priorities = ["RENDAH", "SEDANG", "SEDANG", "TINGGI"] as const;
    for (let i = 0; i < 18; i++) {
      // Dua catatan dibuat Owner (ADR-021).
      const p = i % 9 === 4 ? { id: ownerId } : pick(pengawas);
      const part = pick(SPARE_PARTS);
      const unit = pick(units);
      const id = randomUUID();
      const created = atLocal(shiftISO(today, -between(0, 28)), between(7, 17), between(0, 59));
      await db.orderSparePart.create({
        data: {
          id,
          unitId: unit.id,
          partName: part.name,
          partNumber: part.no,
          quantity: between(1, 4),
          priority: pick(priorities),
          kerusakan: pick(KERUSAKAN),
          lokasi: pick(LOKASI),
          supervisorId: p.id,
          createdById: p.id,
          createdAt: created,
          updatedAt: created,
        },
      });
      await addPhotos("ORDER_SPARE_PART", "order-spare-part", id, p.id, ["sparepart", "workshop"].slice(0, between(1, 2)), created);
    }

    console.log("Membuat planning job…");
    // Rentang -12..+14 hari: lampau → selesai/batal, sekitar hari ini → berjalan, depan → direncanakan.
    for (const [i, nama] of PLANNING_JOBS.entries()) {
      const offset = -12 + i * 2;
      const mulai = shiftISO(today, offset);
      const selesai = shiftISO(mulai, between(0, 3));
      const status = offset < -2 ? (i === 1 ? "DIBATALKAN" : "SELESAI") : offset <= 1 ? "BERJALAN" : "DIRENCANAKAN";
      const createdAt = atLocal(shiftISO(mulai, -3), 9);
      await db.planningJob.create({
        data: {
          id: randomUUID(),
          supervisorId: pengawas[i % pengawas.length]!.id,
          unitId: pick(units).id,
          namaPekerjaan: nama,
          lokasi: pick(LOKASI),
          deskripsi: "Kerjakan sesuai arahan Owner. Laporkan kendala di lapangan melalui Laporan Kerja.",
          estimasiMulai: new Date(`${mulai}T00:00:00Z`),
          estimasiSelesai: new Date(`${selesai}T00:00:00Z`),
          status,
          startedAt: status === "BERJALAN" || status === "SELESAI" ? atLocal(mulai, 7, 30) : null,
          completedAt: status === "SELESAI" ? atLocal(selesai, 16, 10) : null,
          createdById: ownerId,
          createdAt,
          updatedAt: createdAt,
        },
      });
    }

    console.log(`
Data demo siap: ${laporanCount} laporan kerja, 18 spare part, ${PLANNING_JOBS.length} planning.

Login Owner     : ${DEMO.owner.username} / ${DEMO.owner.password}   (PIN Laporan Data: ${DEMO.owner.dataPin})
Login Pengawas  : ${pengawas.map((p) => p.kode).join(", ")} / PIN ${DEMO.pin}
(${DEMO.pengawas.filter((p) => p.inactive).map((p) => p.kode).join(", ")} sengaja nonaktif)`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

-- CreateEnum
CREATE TYPE "PhotoModule" AS ENUM ('LAPORAN_KERJA', 'ORDER_SPARE_PART', 'PLANNING_JOB');

-- CreateEnum
CREATE TYPE "RetentionStatus" AS ENUM ('KEEP', 'ACTIVE', 'ARCHIVED', 'DELETE_PENDING', 'DELETED');

-- CreateTable
CREATE TABLE "unit" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laporan_kerja" (
    "id" UUID NOT NULL,
    "tanggal" DATE NOT NULL,
    "unit_id" UUID NOT NULL,
    "operator_name" TEXT NOT NULL,
    "hm_jam" DECIMAL(4,1) NOT NULL,
    "bbm" SMALLINT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "supervisor_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "laporan_kerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo" (
    "id" UUID NOT NULL,
    "module" "PhotoModule" NOT NULL,
    "record_id" UUID,
    "storage_path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "retention_status" "RetentionStatus" NOT NULL DEFAULT 'ACTIVE',
    "uploaded_by" UUID NOT NULL,
    "uploaded_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unit_name_key" ON "unit"("name");

-- CreateIndex
CREATE INDEX "laporan_kerja_supervisor_id_tanggal_idx" ON "laporan_kerja"("supervisor_id", "tanggal");

-- CreateIndex
CREATE INDEX "laporan_kerja_tanggal_idx" ON "laporan_kerja"("tanggal");

-- CreateIndex
CREATE INDEX "laporan_kerja_unit_id_tanggal_idx" ON "laporan_kerja"("unit_id", "tanggal");

-- CreateIndex
CREATE INDEX "photo_module_record_id_idx" ON "photo"("module", "record_id");

-- CreateIndex
CREATE INDEX "photo_uploaded_by_record_id_idx" ON "photo"("uploaded_by", "record_id");

-- AddForeignKey
ALTER TABLE "laporan_kerja" ADD CONSTRAINT "laporan_kerja_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan_kerja" ADD CONSTRAINT "laporan_kerja_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan_kerja" ADD CONSTRAINT "laporan_kerja_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Pengaman di level DB (validasi utama tetap di server, ADR-014).
ALTER TABLE "laporan_kerja" ADD CONSTRAINT "laporan_kerja_bbm_range" CHECK ("bbm" BETWEEN 1 AND 6);
ALTER TABLE "laporan_kerja" ADD CONSTRAINT "laporan_kerja_hm_nonneg" CHECK ("hm_jam" >= 0);

-- Unit awal (PRD §14). Owner dapat menambah/menonaktifkan lewat aplikasi.
INSERT INTO "unit" ("id", "name", "sort_order", "updated_at") VALUES
  ('0a1f6c2e-1d1e-4a51-9a10-000000000001', 'PASKAM 1', 1, CURRENT_TIMESTAMP),
  ('0a1f6c2e-1d1e-4a51-9a10-000000000002', 'PASKAM 2', 2, CURRENT_TIMESTAMP),
  ('0a1f6c2e-1d1e-4a51-9a10-000000000003', 'PASKAM 3', 3, CURRENT_TIMESTAMP),
  ('0a1f6c2e-1d1e-4a51-9a10-000000000004', 'PASKAM 4', 4, CURRENT_TIMESTAMP),
  ('0a1f6c2e-1d1e-4a51-9a10-000000000005', 'DUMP', 5, CURRENT_TIMESTAMP),
  ('0a1f6c2e-1d1e-4a51-9a10-000000000006', 'TOWING', 6, CURRENT_TIMESTAMP);

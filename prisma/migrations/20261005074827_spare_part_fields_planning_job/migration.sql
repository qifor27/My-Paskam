-- CreateEnum
CREATE TYPE "SparePartPriority" AS ENUM ('RENDAH', 'SEDANG', 'TINGGI');

-- CreateEnum
CREATE TYPE "PlanningStatus" AS ENUM ('DIRENCANAKAN', 'BERJALAN', 'SELESAI', 'DIBATALKAN');

-- AlterTable
ALTER TABLE "order_spare_part" ADD COLUMN     "part_number" TEXT,
ADD COLUMN     "priority" "SparePartPriority" NOT NULL DEFAULT 'SEDANG',
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "planning_job" (
    "id" UUID NOT NULL,
    "supervisor_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "nama_pekerjaan" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "estimasi_mulai" DATE NOT NULL,
    "estimasi_selesai" DATE NOT NULL,
    "status" "PlanningStatus" NOT NULL DEFAULT 'DIRENCANAKAN',
    "started_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "planning_job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "planning_job_supervisor_id_status_idx" ON "planning_job"("supervisor_id", "status");

-- CreateIndex
CREATE INDEX "planning_job_status_estimasi_mulai_idx" ON "planning_job"("status", "estimasi_mulai");

-- AddForeignKey
ALTER TABLE "planning_job" ADD CONSTRAINT "planning_job_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_job" ADD CONSTRAINT "planning_job_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planning_job" ADD CONSTRAINT "planning_job_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Pengaman di level DB (validasi utama di server, ADR-017).
ALTER TABLE "order_spare_part" ADD CONSTRAINT "order_spare_part_quantity_min" CHECK ("quantity" >= 1);
ALTER TABLE "planning_job" ADD CONSTRAINT "planning_job_estimasi_order" CHECK ("estimasi_selesai" >= "estimasi_mulai");

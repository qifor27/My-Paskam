-- BBM (Solar) menjadi jumlah (ADR-016): hapus batas 1–6, ganti >= 0.
ALTER TABLE "laporan_kerja" DROP CONSTRAINT "laporan_kerja_bbm_range";
ALTER TABLE "laporan_kerja" ALTER COLUMN "bbm" SET DATA TYPE DECIMAL(6,1);
ALTER TABLE "laporan_kerja" ADD CONSTRAINT "laporan_kerja_bbm_nonneg" CHECK ("bbm" >= 0);

-- CreateTable
CREATE TABLE "order_spare_part" (
    "id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "part_name" TEXT NOT NULL,
    "kerusakan" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "supervisor_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),

    CONSTRAINT "order_spare_part_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_spare_part_supervisor_id_created_at_idx" ON "order_spare_part"("supervisor_id", "created_at");

-- CreateIndex
CREATE INDEX "order_spare_part_created_at_idx" ON "order_spare_part"("created_at");

-- CreateIndex
CREATE INDEX "order_spare_part_unit_id_created_at_idx" ON "order_spare_part"("unit_id", "created_at");

-- AddForeignKey
ALTER TABLE "order_spare_part" ADD CONSTRAINT "order_spare_part_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_spare_part" ADD CONSTRAINT "order_spare_part_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_spare_part" ADD CONSTRAINT "order_spare_part_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

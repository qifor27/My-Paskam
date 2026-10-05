-- AlterTable
ALTER TABLE "session" ADD COLUMN     "data_unlocked_until" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "data_pin_hash" TEXT;

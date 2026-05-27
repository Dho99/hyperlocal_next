-- AlterTable
ALTER TABLE "halal_validations" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING';

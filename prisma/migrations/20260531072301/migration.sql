-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('DESTINASI', 'UMKM');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CLICK_ROUTE', 'CLICK_WHATSAPP', 'BOOKMARK');

-- CreateTable
CREATE TABLE "user_interactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "target_id" TEXT NOT NULL,
    "target_type" "TargetType" NOT NULL,
    "action_type" "ActionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_interactions_user_id_idx" ON "user_interactions"("user_id");

-- CreateIndex
CREATE INDEX "user_interactions_target_id_target_type_idx" ON "user_interactions"("target_id", "target_type");

-- CreateIndex
CREATE INDEX "user_interactions_target_id_target_type_action_type_idx" ON "user_interactions"("target_id", "target_type", "action_type");

-- CreateIndex
CREATE INDEX "user_interactions_created_at_idx" ON "user_interactions"("created_at");

-- AddForeignKey
ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

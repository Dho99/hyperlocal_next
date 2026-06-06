-- CreateTable
CREATE TABLE "ai_intent_logs" (
    "id" TEXT NOT NULL,
    "user_query" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "redirect_to" TEXT NOT NULL,
    "payload" JSONB,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_intent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_intent_logs_intent_idx" ON "ai_intent_logs"("intent");

-- CreateIndex
CREATE INDEX "ai_intent_logs_created_at_idx" ON "ai_intent_logs"("created_at");

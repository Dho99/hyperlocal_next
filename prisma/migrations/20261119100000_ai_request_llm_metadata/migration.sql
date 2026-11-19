-- Track which LLM provider/model handled each AI request and how it ended.
ALTER TABLE "ai_intent_logs"
ADD COLUMN IF NOT EXISTS "feature" TEXT NOT NULL DEFAULT 'ROUTE_FINDER',
ADD COLUMN IF NOT EXISTS "provider" TEXT,
ADD COLUMN IF NOT EXISTS "model" TEXT,
ADD COLUMN IF NOT EXISTS "status" TEXT,
ADD COLUMN IF NOT EXISTS "latency_ms" INTEGER,
ADD COLUMN IF NOT EXISTS "attempt_count" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "ai_intent_logs_feature_idx" ON "ai_intent_logs"("feature");
CREATE INDEX IF NOT EXISTS "ai_intent_logs_status_idx" ON "ai_intent_logs"("status");

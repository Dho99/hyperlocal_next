-- CreateTable
CREATE TABLE "destination_survey_responses" (
    "id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "user_id" TEXT,
    "scores" JSONB NOT NULL,
    "overall_score" DOUBLE PRECISION,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destination_survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "destination_survey_responses_destination_id_idx" ON "destination_survey_responses"("destination_id");

-- CreateIndex
CREATE INDEX "destination_survey_responses_user_id_idx" ON "destination_survey_responses"("user_id");

-- AddForeignKey
ALTER TABLE "destination_survey_responses" ADD CONSTRAINT "destination_survey_responses_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destination_survey_responses" ADD CONSTRAINT "destination_survey_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

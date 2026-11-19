CREATE TABLE "photo_validation_configs" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "is_exif_validation_enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photo_validation_configs_pkey" PRIMARY KEY ("id")
);

INSERT INTO "photo_validation_configs" ("id", "is_exif_validation_enabled", "updated_at")
VALUES ('default', true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

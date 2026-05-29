DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CategoryType') THEN
        CREATE TYPE "CategoryType" AS ENUM ('DESTINATION', 'UMKM');
    END IF;
END
$$;

ALTER TABLE "categories"
ADD COLUMN IF NOT EXISTS "type" "CategoryType" NOT NULL DEFAULT 'DESTINATION';

DROP INDEX IF EXISTS "categories_slug_key";

CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_type_key" ON "categories"("slug", "type");

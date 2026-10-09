-- Make Umkm.owner optional. The production column was already nullable
-- (applied out-of-band); DROP NOT NULL is a no-op in that case, so this
-- migration is safe to apply on databases where it is still required.
ALTER TABLE "umkms" ALTER COLUMN "owner" DROP NOT NULL;

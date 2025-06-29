-- First, drop the status column if it exists
ALTER TABLE IF EXISTS "Post" DROP COLUMN IF EXISTS "status";

-- Drop existing enum if it exists
DROP TYPE IF EXISTS "PostStatus";

-- Create PostStatus enum type
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- Add status column
ALTER TABLE "Post" ADD COLUMN "status" "PostStatus";

-- Update status column based on publishedAt field
UPDATE "Post" SET "status" = CASE
  WHEN "publishedAt" IS NOT NULL THEN 'PUBLISHED'::"PostStatus"
  ELSE 'DRAFT'::"PostStatus"
END WHERE "status" IS NULL;
ALTER TABLE "Post" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "Post" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"PostStatus";

-- Add version tracking fields if they don't exist
DO $$ BEGIN
    ALTER TABLE "Post" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Post" ADD COLUMN "previousVersion" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Post" ADD COLUMN "nextVersion" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add soft delete fields if they don't exist
DO $$ BEGIN
    ALTER TABLE "Post" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Post" ADD COLUMN "deletedAt" TIMESTAMP;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "Post_isDeleted_status_idx" ON "Post"("isDeleted", "status");

-- Drop published column after migration is complete
-- We'll keep it temporarily to ensure a smooth transition
-- ALTER TABLE "Post" DROP COLUMN "published";
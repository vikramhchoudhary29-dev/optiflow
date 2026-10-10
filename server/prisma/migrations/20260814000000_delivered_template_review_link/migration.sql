ALTER TABLE "shop"
ADD COLUMN IF NOT EXISTS "reviewLink" TEXT;

ALTER TABLE "notificationTemplate"
ADD COLUMN IF NOT EXISTS "deliveredMessage" TEXT NOT NULL DEFAULT '';


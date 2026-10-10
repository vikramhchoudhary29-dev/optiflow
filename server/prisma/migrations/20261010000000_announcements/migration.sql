CREATE TABLE "Announcement" (
  "id" SERIAL NOT NULL,
  "title" VARCHAR(160) NOT NULL,
  "message" VARCHAR(1200) NOT NULL,
  "tone" VARCHAR(20) NOT NULL DEFAULT 'INFO',
  "published" BOOLEAN NOT NULL DEFAULT false,
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Announcement_published_startsAt_endsAt_idx" ON "Announcement"("published", "startsAt", "endsAt");
CREATE TABLE "AnnouncementShop" (
  "id" SERIAL NOT NULL,
  "announcementId" INTEGER NOT NULL,
  "shopId" INTEGER NOT NULL,
  CONSTRAINT "AnnouncementShop_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AnnouncementShop_announcementId_shopId_key" ON "AnnouncementShop"("announcementId", "shopId");
CREATE INDEX "AnnouncementShop_shopId_idx" ON "AnnouncementShop"("shopId");
ALTER TABLE "AnnouncementShop" ADD CONSTRAINT "AnnouncementShop_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnnouncementShop" ADD CONSTRAINT "AnnouncementShop_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

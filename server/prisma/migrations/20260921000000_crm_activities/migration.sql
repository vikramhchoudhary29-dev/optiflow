CREATE TYPE "customer_activity_type" AS ENUM ('NOTE', 'FOLLOW_UP', 'CALL', 'WHATSAPP', 'VISIT', 'REMINDER');
CREATE TYPE "customer_activity_status" AS ENUM ('OPEN', 'DONE', 'CANCELLED');

CREATE TABLE "CustomerActivity" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "type" "customer_activity_type" NOT NULL DEFAULT 'NOTE',
    "status" "customer_activity_status" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "note" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CustomerActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomerActivity_shopId_dueDate_idx" ON "CustomerActivity"("shopId", "dueDate");
CREATE INDEX "CustomerActivity_shopId_customerId_createdAt_idx" ON "CustomerActivity"("shopId", "customerId", "createdAt");
CREATE INDEX "CustomerActivity_shopId_status_idx" ON "CustomerActivity"("shopId", "status");

ALTER TABLE "CustomerActivity" ADD CONSTRAINT "CustomerActivity_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerActivity" ADD CONSTRAINT "CustomerActivity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerActivity" ADD CONSTRAINT "CustomerActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

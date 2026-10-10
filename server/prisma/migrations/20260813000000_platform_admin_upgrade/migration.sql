CREATE TYPE "platform_payment_status" AS ENUM ('PAID', 'UNPAID', 'OVERDUE');

CREATE TABLE "PlatformSetting" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "planName" TEXT NOT NULL DEFAULT 'OptiFlow Plan',
  "monthlyPrice" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  "yearlyPrice" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  "trialDays" INTEGER NOT NULL DEFAULT 14,
  "gracePeriodDays" INTEGER NOT NULL DEFAULT 0,
  "autoExpire" BOOLEAN NOT NULL DEFAULT true,
  "reminderDays" TEXT NOT NULL DEFAULT '30,15,7,1',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubscriptionPayment" (
  "id" SERIAL NOT NULL,
  "shopId" INTEGER NOT NULL,
  "subscriptionId" INTEGER,
  "amount" DECIMAL(10,2) NOT NULL,
  "status" "platform_payment_status" NOT NULL DEFAULT 'PAID',
  "reference" TEXT,
  "notes" TEXT,
  "dueDate" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SubscriptionPayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportSession" (
  "id" SERIAL NOT NULL,
  "adminId" INTEGER NOT NULL,
  "shopId" INTEGER NOT NULL,
  "ownerId" INTEGER NOT NULL,
  "ipAddress" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "endedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SupportSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SubscriptionPayment_shopId_idx" ON "SubscriptionPayment"("shopId");
CREATE INDEX "SubscriptionPayment_subscriptionId_idx" ON "SubscriptionPayment"("subscriptionId");
CREATE INDEX "SubscriptionPayment_status_idx" ON "SubscriptionPayment"("status");
CREATE INDEX "SupportSession_adminId_idx" ON "SupportSession"("adminId");
CREATE INDEX "SupportSession_shopId_idx" ON "SupportSession"("shopId");

ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubscriptionPayment" ADD CONSTRAINT "SubscriptionPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupportSession" ADD CONSTRAINT "SupportSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportSession" ADD CONSTRAINT "SupportSession_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "PlatformSetting" ("id", "updatedAt") VALUES (1, CURRENT_TIMESTAMP) ON CONFLICT ("id") DO NOTHING;

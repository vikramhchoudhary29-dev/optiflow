-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "subscription_plan" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "invoiceitem_itemType" AS ENUM ('FRAME', 'LENS', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "customer_gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('OWNER', 'STAFF');

-- CreateEnum
CREATE TYPE "invoice_paymentStatus" AS ENUM ('PENDING', 'PAID', 'PARTIAL');

-- CreateEnum
CREATE TYPE "invoice_paymentMethod" AS ENUM ('CASH', 'CARD', 'UPI', 'BANK');

-- CreateEnum
CREATE TYPE "delivery_status" AS ENUM ('PENDING', 'READY', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "prescription_status" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "stock_movement_type" AS ENUM ('PURCHASE', 'SALE', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT');

-- CreateEnum
CREATE TYPE "loyalty_transaction_type" AS ENUM ('EARN', 'REDEEM', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "customerCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "gender" "customer_gender",
    "dob" TIMESTAMP(3),
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "remarks" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frame" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "frameCode" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT,
    "size" TEXT,
    "shape" TEXT,
    "material" TEXT,
    "barcode" TEXT,
    "purchasePrice" DECIMAL(10,2) NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minimumStock" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "prescriptionId" INTEGER,
    "invoiceCode" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TIMESTAMP(3),
    "deliveryStatus" "delivery_status" NOT NULL DEFAULT 'PENDING',
    "subTotal" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "gst" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "grandTotal" DECIMAL(10,2) NOT NULL,
    "advance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "received" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "paymentStatus" "invoice_paymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "invoice_paymentMethod",
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "loyaltyPointsEarned" INTEGER NOT NULL DEFAULT 0,
    "loyaltyPointsRedeemed" INTEGER NOT NULL DEFAULT 0,
    "loyaltyDiscount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoiceitem" (
    "id" SERIAL NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "frameId" INTEGER,
    "lensId" INTEGER,
    "productId" INTEGER,
    "itemType" "invoiceitem_itemType" NOT NULL,
    "itemCode" TEXT,
    "itemName" TEXT NOT NULL,
    "hsnSac" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT DEFAULT 'Nos',
    "price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "invoiceitem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "rightSph" DECIMAL(4,2),
    "rightCyl" DECIMAL(4,2),
    "rightAxis" INTEGER,
    "rightAdd" DECIMAL(4,2),
    "leftSph" DECIMAL(4,2),
    "leftCyl" DECIMAL(4,2),
    "leftAxis" INTEGER,
    "leftAdd" DECIMAL(4,2),
    "pdDistance" DECIMAL(4,2),
    "pdNear" DECIMAL(4,2),
    "doctorName" TEXT,
    "doctorNotes" TEXT,
    "prescriptionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "prescription_status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "prescriptionCode" TEXT NOT NULL,
    "contactLensBrand" TEXT,
    "contactLensType" TEXT,
    "expiryDate" TIMESTAMP(3),
    "frame" TEXT,
    "leftBc" DECIMAL(3,1),
    "leftDia" DECIMAL(3,1),
    "leftPower" DECIMAL(4,2),
    "lens" TEXT,
    "lensType" TEXT,
    "rightBc" DECIMAL(3,1),
    "rightDia" DECIMAL(3,1),
    "rightPower" DECIMAL(4,2),

    CONSTRAINT "prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "purchaseCode" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "supplierName" TEXT NOT NULL,
    "supplierId" INTEGER,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchaseitem" (
    "id" SERIAL NOT NULL,
    "purchaseId" INTEGER NOT NULL,
    "frameId" INTEGER,
    "productId" INTEGER,
    "quantity" INTEGER NOT NULL,
    "purchasePrice" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "purchaseitem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop" (
    "id" SERIAL NOT NULL,
    "shopName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "gstNumber" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "plan" "subscription_plan" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" "subscription_status" NOT NULL DEFAULT 'ACTIVE',
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "loginId" TEXT,
    "password" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'OWNER',
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lens" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "lensCode" TEXT NOT NULL,
    "lensName" TEXT NOT NULL,
    "purchasePrice" DECIMAL(10,2) NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV',
    "customerPrefix" TEXT NOT NULL DEFAULT 'CUS',
    "prescriptionPrefix" TEXT NOT NULL DEFAULT 'PRE',
    "purchasePrefix" TEXT NOT NULL DEFAULT 'PUR',
    "productPrefix" TEXT NOT NULL DEFAULT 'PRD',
    "nextInvoiceNumber" INTEGER NOT NULL DEFAULT 1,
    "nextCustomerNumber" INTEGER NOT NULL DEFAULT 1,
    "nextPrescriptionNumber" INTEGER NOT NULL DEFAULT 1,
    "nextPurchaseNumber" INTEGER NOT NULL DEFAULT 1,
    "nextProductNumber" INTEGER NOT NULL DEFAULT 1,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "gstNumber" TEXT,
    "logoUrl" TEXT,
    "footerNote" TEXT,
    "terms" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "purchasePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sellingPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minimumStock" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "invoice_paymentMethod" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "invoice_paymentMethod",
    "notes" TEXT,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "type" "stock_movement_type" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "referenceType" TEXT,
    "referenceId" INTEGER,
    "notes" TEXT,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT false,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingTemplate" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltySetting" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "spendPerPoint" DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
    "minimumEarnInvoice" DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
    "expiryEnabled" BOOLEAN NOT NULL DEFAULT true,
    "expiryDays" INTEGER NOT NULL DEFAULT 90,
    "redemptionValuePerPoint" DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    "maximumRedemptionPercent" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "minimumRedeemInvoice" DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltySetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyTransaction" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "invoiceId" INTEGER,
    "type" "loyalty_transaction_type" NOT NULL,
    "points" INTEGER NOT NULL,
    "remainingPoints" INTEGER NOT NULL DEFAULT 0,
    "monetaryValue" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyRedemptionAllocation" (
    "id" SERIAL NOT NULL,
    "redemptionId" INTEGER NOT NULL,
    "earningId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "LoyaltyRedemptionAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE INDEX "customer_shopId_idx" ON "customer"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_shopId_customerCode_key" ON "customer"("shopId", "customerCode");

-- CreateIndex
CREATE INDEX "frame_shopId_idx" ON "frame"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "frame_shopId_frameCode_key" ON "frame"("shopId", "frameCode");

-- CreateIndex
CREATE INDEX "invoice_customerId_idx" ON "invoice"("customerId");

-- CreateIndex
CREATE INDEX "invoice_prescriptionId_idx" ON "invoice"("prescriptionId");

-- CreateIndex
CREATE INDEX "invoice_shopId_idx" ON "invoice"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_shopId_invoiceCode_key" ON "invoice"("shopId", "invoiceCode");

-- CreateIndex
CREATE INDEX "invoiceitem_invoiceId_idx" ON "invoiceitem"("invoiceId");

-- CreateIndex
CREATE INDEX "invoiceitem_frameId_idx" ON "invoiceitem"("frameId");

-- CreateIndex
CREATE INDEX "invoiceitem_productId_idx" ON "invoiceitem"("productId");

-- CreateIndex
CREATE INDEX "prescription_customerId_idx" ON "prescription"("customerId");

-- CreateIndex
CREATE INDEX "prescription_shopId_idx" ON "prescription"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "prescription_shopId_prescriptionCode_key" ON "prescription"("shopId", "prescriptionCode");

-- CreateIndex
CREATE INDEX "purchase_shopId_idx" ON "purchase"("shopId");

-- CreateIndex
CREATE INDEX "purchase_supplierId_idx" ON "purchase"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_shopId_purchaseCode_key" ON "purchase"("shopId", "purchaseCode");

-- CreateIndex
CREATE INDEX "purchaseitem_frameId_idx" ON "purchaseitem"("frameId");

-- CreateIndex
CREATE INDEX "purchaseitem_purchaseId_idx" ON "purchaseitem"("purchaseId");

-- CreateIndex
CREATE INDEX "purchaseitem_productId_idx" ON "purchaseitem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_mobile_key" ON "shop"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_email_key" ON "shop"("email");

-- CreateIndex
CREATE INDEX "subscription_shopId_idx" ON "subscription"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "user"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_loginId_key" ON "user"("loginId");

-- CreateIndex
CREATE INDEX "user_shopId_idx" ON "user"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "Lens_shopId_lensCode_key" ON "Lens"("shopId", "lensCode");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_shopId_key" ON "Setting"("shopId");

-- CreateIndex
CREATE INDEX "Category_shopId_idx" ON "Category"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_shopId_name_key" ON "Category"("shopId", "name");

-- CreateIndex
CREATE INDEX "Product_shopId_categoryId_idx" ON "Product"("shopId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_shopId_sku_key" ON "Product"("shopId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_shopId_barcode_key" ON "Product"("shopId", "barcode");

-- CreateIndex
CREATE INDEX "Supplier_shopId_idx" ON "Supplier"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_shopId_name_key" ON "Supplier"("shopId", "name");

-- CreateIndex
CREATE INDEX "Payment_shopId_paidAt_idx" ON "Payment"("shopId", "paidAt");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Expense_shopId_expenseDate_idx" ON "Expense"("shopId", "expenseDate");

-- CreateIndex
CREATE INDEX "StockMovement_shopId_productId_createdAt_idx" ON "StockMovement"("shopId", "productId", "createdAt");

-- CreateIndex
CREATE INDEX "UserPermission_shopId_idx" ON "UserPermission"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_module_key" ON "UserPermission"("userId", "module");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_shopId_key" ON "NotificationTemplate"("shopId");

-- CreateIndex
CREATE INDEX "MarketingTemplate_shopId_idx" ON "MarketingTemplate"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingTemplate_shopId_name_key" ON "MarketingTemplate"("shopId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltySetting_shopId_key" ON "LoyaltySetting"("shopId");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_shopId_customerId_expiresAt_idx" ON "LoyaltyTransaction"("shopId", "customerId", "expiresAt");

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_invoiceId_idx" ON "LoyaltyTransaction"("invoiceId");

-- CreateIndex
CREATE INDEX "LoyaltyRedemptionAllocation_redemptionId_idx" ON "LoyaltyRedemptionAllocation"("redemptionId");

-- CreateIndex
CREATE INDEX "LoyaltyRedemptionAllocation_earningId_idx" ON "LoyaltyRedemptionAllocation"("earningId");

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frame" ADD CONSTRAINT "frame_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoiceitem" ADD CONSTRAINT "invoiceitem_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "frame"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoiceitem" ADD CONSTRAINT "invoiceitem_lensId_fkey" FOREIGN KEY ("lensId") REFERENCES "Lens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoiceitem" ADD CONSTRAINT "invoiceitem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoiceitem" ADD CONSTRAINT "invoiceitem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchaseitem" ADD CONSTRAINT "purchaseitem_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "frame"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchaseitem" ADD CONSTRAINT "purchaseitem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchaseitem" ADD CONSTRAINT "purchaseitem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lens" ADD CONSTRAINT "Lens_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationTemplate" ADD CONSTRAINT "NotificationTemplate_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingTemplate" ADD CONSTRAINT "MarketingTemplate_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltySetting" ADD CONSTRAINT "LoyaltySetting_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyRedemptionAllocation" ADD CONSTRAINT "LoyaltyRedemptionAllocation_redemptionId_fkey" FOREIGN KEY ("redemptionId") REFERENCES "LoyaltyTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyRedemptionAllocation" ADD CONSTRAINT "LoyaltyRedemptionAllocation_earningId_fkey" FOREIGN KEY ("earningId") REFERENCES "LoyaltyTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

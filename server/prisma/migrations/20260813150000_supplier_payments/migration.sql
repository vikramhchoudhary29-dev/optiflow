CREATE TABLE "SupplierPayment" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" "invoice_paymentMethod" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SupplierPayment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SupplierPayment_shopId_paymentDate_idx" ON "SupplierPayment"("shopId", "paymentDate");
CREATE INDEX "SupplierPayment_supplierId_idx" ON "SupplierPayment"("supplierId");
ALTER TABLE "SupplierPayment" ADD CONSTRAINT "SupplierPayment_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupplierPayment" ADD CONSTRAINT "SupplierPayment_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SupplierPayment" ADD CONSTRAINT "SupplierPayment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

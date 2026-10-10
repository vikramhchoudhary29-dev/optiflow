ALTER TABLE "NotificationTemplate"
ADD COLUMN "readyMessage" TEXT NOT NULL DEFAULT 'Hello {customerName},

Good news! Your spectacles for Invoice {invoiceCode} are ready for collection from {shopName}.

Total Amount: ₹{grandTotal}
Amount Received: ₹{received}
Balance Due: ₹{balance}

Please visit us at {shopAddress}. For assistance, call {shopMobile}.

Regards,
{shopName}';

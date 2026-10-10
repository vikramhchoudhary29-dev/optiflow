ALTER TABLE "invoice" ADD COLUMN IF NOT EXISTS "createdById" INTEGER;

CREATE INDEX IF NOT EXISTS "invoice_createdById_idx" ON "invoice"("createdById");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invoice_createdById_fkey') THEN
    ALTER TABLE "invoice"
    ADD CONSTRAINT "invoice_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "user"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

UPDATE "invoice" AS i
SET "createdById" = p."createdById"
FROM (
  SELECT DISTINCT ON ("invoiceId") "invoiceId", "createdById"
  FROM "Payment"
  WHERE "createdById" IS NOT NULL
  ORDER BY "invoiceId", "paidAt" ASC
) AS p
WHERE i."id" = p."invoiceId";

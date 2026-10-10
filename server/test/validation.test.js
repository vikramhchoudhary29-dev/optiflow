import test from "node:test";
import assert from "node:assert/strict";
import { createProductSchema, adjustStockSchema } from "../src/validations/product.validation.js";
import { paymentSchema } from "../src/validations/payment-record.validation.js";
import { subscriptionSchema } from "../src/validations/platform.validation.js";

test("product validation normalizes numeric form values", () => {
  const result = createProductSchema.parse({ categoryId: "2", name: "Classic Frame", sku: "FR-1", purchasePrice: "100", sellingPrice: "200" });
  assert.equal(result.categoryId, 2); assert.equal(result.purchasePrice, 100); assert.equal(result.minimumStock, 0);
});
test("stock adjustment rejects zero", () => assert.equal(adjustStockSchema.safeParse({ quantity: 0 }).success, false));
test("payment requires a positive amount", () => assert.equal(paymentSchema.safeParse({ invoiceId: 1, amount: -1, method: "CASH" }).success, false));
test("subscription expiry must follow its start", () => {
  const result = subscriptionSchema.safeParse({ plan: "STARTER", amount: 0, startDate: "2026-08-10", expiryDate: "2026-08-01" });
  assert.equal(result.success, false);
});

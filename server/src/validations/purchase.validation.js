import { z } from "zod";

export const createPurchaseSchema = z.object({
  supplierId: z.coerce.number().int().positive(),
  invoiceNumber: z.string().trim().max(100).nullable().optional(),
  purchaseDate: z.coerce.date().optional(),
  items: z.array(z.object({
    productId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
    purchasePrice: z.coerce.number().positive().max(99999999.99),
  })).min(1),
});

export const updatePurchaseSchema = createPurchaseSchema;

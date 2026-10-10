import { z } from "zod";

export const supplierPaymentSchema = z.object({
  supplierId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive().max(99999999.99),
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.enum(["CASH", "CARD", "UPI", "BANK"]),
  reference: z.string().trim().max(100).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});


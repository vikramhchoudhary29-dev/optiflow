import { z } from "zod";
export const paymentSchema = z.object({
  invoiceId: z.coerce.number().int().positive(), amount: z.coerce.number().positive().max(99999999.99),
  method: z.enum(["CASH","CARD","UPI","BANK"]), reference: z.string().trim().max(150).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(), paidAt: z.coerce.date().optional(),
});

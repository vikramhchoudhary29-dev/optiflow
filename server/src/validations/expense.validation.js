import { z } from "zod";
const methods = ["CASH", "CARD", "UPI", "BANK"];
export const expenseSchema = z.object({
  category: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().min(2).max(500),
  amount: z.coerce.number().positive().max(99999999.99),
  expenseDate: z.coerce.date().optional(),
  paymentMethod: z.enum(methods).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});
export const updateExpenseSchema = expenseSchema.partial().refine((data) => Object.keys(data).length, "At least one field is required");

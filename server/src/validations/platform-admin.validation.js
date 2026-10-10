import { z } from "zod";
export const planSettingsSchema = z.object({
  planName: z.string().trim().min(3).max(100),
  monthlyPrice: z.coerce.number().min(0),
  yearlyPrice: z.coerce.number().min(0),
  trialDays: z.coerce.number().int().min(1).max(90),
  gracePeriodDays: z.coerce.number().int().min(0).max(90),
  autoExpire: z.boolean(),
  reminderDays: z.array(z.coerce.number().int().min(0).max(365)).min(1),
});
export const platformPaymentSchema = z.object({
  shopId: z.coerce.number().int().positive(),
  subscriptionId: z.coerce.number().int().positive().optional(),
  amount: z.coerce.number().min(0),
  status: z.enum(["PAID", "UNPAID", "OVERDUE"]),
  reference: z.string().trim().max(150).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  paidAt: z.coerce.date().optional(),
});

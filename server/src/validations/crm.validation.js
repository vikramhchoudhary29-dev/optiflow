import { z } from "zod";

export const activityCreateSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  type: z.enum(["NOTE", "FOLLOW_UP", "CALL", "WHATSAPP", "VISIT", "REMINDER"]).default("NOTE"),
  title: z.string().trim().min(2).max(160),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
  dueDate: z.string().datetime().optional().or(z.literal("")),
});

export const activityStatusSchema = z.object({
  status: z.enum(["OPEN", "DONE", "CANCELLED"]),
});

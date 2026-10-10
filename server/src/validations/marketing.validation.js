import { z } from "zod";

export const templateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  message: z.string().trim().min(1).max(2000),
});
export const updateTemplateSchema = templateSchema.partial().refine((data) => Object.keys(data).length, "At least one field is required");
export const marketingLinkSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  templateId: z.coerce.number().int().positive().optional(),
  message: z.string().trim().min(1).max(2000).optional(),
}).refine((data) => data.message || data.templateId, "Choose a template or enter a message");

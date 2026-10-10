import { z } from "zod";
export const supplierSchema = z.object({
  name: z.string().trim().min(2).max(150), mobile: z.string().trim().max(20).nullable().optional(),
  email: z.string().trim().email().max(150).nullable().optional(), address: z.string().trim().max(500).nullable().optional(),
  notes: z.string().trim().max(500).nullable().optional(),
});
export const updateSupplierSchema = supplierSchema.partial().refine((data) => Object.keys(data).length, "At least one field is required");

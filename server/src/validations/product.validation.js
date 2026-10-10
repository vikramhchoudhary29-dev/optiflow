import { z } from "zod";

const money = z.coerce.number().min(0).max(99999999.99);
export const createProductSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2).max(150),
  brand: z.string().trim().max(100).nullable().optional(),
  sku: z.string().trim().min(1).max(100).optional(),
  barcode: z.string().trim().max(100).nullable().optional(),
  purchasePrice: money,
  sellingPrice: money,
  minimumStock: z.coerce.number().int().min(0).default(0),
});
export const updateProductSchema = createProductSchema.partial().refine((data) => Object.keys(data).length, "At least one field is required");
export const adjustStockSchema = z.object({
  quantity: z.coerce.number().int().refine((value) => value !== 0, "Quantity cannot be zero"),
  notes: z.string().trim().max(500).optional(),
});

import { z } from "zod";

/* ============================================================
   Create Frame
============================================================ */

export const createFrameSchema = z.object({
  frameCode: z
    .string()
    .trim()
    .min(1, "Frame code is required"),

  brand: z
    .string()
    .trim()
    .min(1, "Brand is required"),

  model: z
    .string()
    .trim()
    .min(1, "Model is required"),

  color: z.string().optional(),

  size: z.string().optional(),

  shape: z.string().optional(),

  material: z.string().optional(),

  barcode: z.string().optional(),

  purchasePrice: z.coerce
    .number()
    .min(0, "Purchase price must be greater than or equal to 0"),

  sellingPrice: z.coerce
    .number()
    .min(0, "Selling price must be greater than or equal to 0"),

  stock: z.coerce
    .number()
    .int()
    .min(0, "Stock cannot be negative"),

  minimumStock: z.coerce
    .number()
    .int()
    .min(0, "Minimum stock cannot be negative"),
});

/* ============================================================
   Update Frame
============================================================ */

export const updateFrameSchema = createFrameSchema;
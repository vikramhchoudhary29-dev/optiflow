import { z } from "zod";

export const createLensSchema = z.object({
  lensCode: z
    .string()
    .trim()
    .min(2, "Lens code is required"),

  lensName: z
    .string()
    .trim()
    .min(2, "Lens name is required"),

  purchasePrice: z
    .number({
      invalid_type_error: "Purchase price must be a number",
    })
    .positive(),

  sellingPrice: z
    .number({
      invalid_type_error: "Selling price must be a number",
    })
    .positive(),
});
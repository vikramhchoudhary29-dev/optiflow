import { z } from "zod";

export const createShopSchema = z.object({
  shopName: z.string().trim().min(3, "Shop name must be at least 3 characters"),
  ownerName: z
    .string()
    .trim()
    .min(3, "Owner name must be at least 3 characters"),
  mobile: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Mobile number must contain exactly 10 digits"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
  address: z.string().trim().min(3, "Address must be at least 3 characters"),
  gstNumber: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(30).optional(),
  ),
  plan: z.literal("STARTER").default("STARTER"),
  accessType: z.enum(["PAID", "TRIAL"]).default("PAID"),
  durationMonths: z.coerce.number().int().min(1).max(60).default(12),
  amount: z.coerce.number().min(0).max(99999999.99).default(0),
  startDate: z.coerce.date().optional(),
  paymentStatus: z.enum(["PAID", "UNPAID", "OVERDUE"]).default("PAID"),
  paymentReference: z.string().trim().max(150).nullable().optional(),
  paymentNotes: z.string().trim().max(500).nullable().optional(),
});

export const updateShopSchema = z
  .object({
    shopName: z.string().trim().min(3).max(150).optional(),
    ownerName: z.string().trim().min(3).max(150).optional(),
    mobile: z.string().trim().min(7).max(20).optional(),
    email: z.string().trim().email().nullable().optional(),
    address: z.string().trim().min(3).max(500).nullable().optional(),
    gstNumber: z.string().trim().max(30).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length, "At least one field is required");
export const shopStatusSchema = z.object({ status: z.boolean() });
export const subscriptionSchema = z
  .object({
    plan: z.literal("STARTER").default("STARTER"),
    amount: z.coerce.number().min(0).max(99999999.99).default(0),
    startDate: z.coerce.date().optional(),
    expiryDate: z.coerce.date(),
    paymentStatus: z.enum(["PAID", "UNPAID", "OVERDUE"]).default("PAID"),
    reference: z.string().trim().max(150).nullable().optional(),
    notes: z.string().trim().max(500).nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
  })
  .refine((data) => data.expiryDate > (data.startDate || new Date(0)), {
    message: "Expiry date must be after start date",
    path: ["expiryDate"],
  });
export const trialSchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(14),
});
export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(100),
});

export const platformLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

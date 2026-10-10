import { z } from "zod";

const itemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  itemCode: z.string().trim().min(1).max(100).optional(),
  quantity: z.coerce.number().int().positive(),
  price: z.coerce.number().positive().max(99999999.99).optional(),
  discount: z.coerce.number().min(0).max(99999999.99).default(0),
});
const prescriptionSchema = z.object({
  rightSph:z.coerce.number().optional(),rightCyl:z.coerce.number().optional(),rightAxis:z.coerce.number().int().min(0).max(180).optional(),rightAdd:z.coerce.number().optional(),
  leftSph:z.coerce.number().optional(),leftCyl:z.coerce.number().optional(),leftAxis:z.coerce.number().int().min(0).max(180).optional(),leftAdd:z.coerce.number().optional(),
  pdDistance:z.coerce.number().optional(),pdNear:z.coerce.number().optional(),doctorName:z.string().trim().max(100).optional(),doctorNotes:z.string().trim().max(500).optional(),
});
const invoiceBaseSchema = z.object({
  customerId: z.coerce.number().int().positive(), prescriptionId: z.coerce.number().int().positive().nullable().optional(), prescription:prescriptionSchema.optional(),
  invoiceDate: z.coerce.date().optional(), deliveryDate: z.coerce.date().nullable().optional(),
  discount: z.coerce.number().min(0).default(0), gst: z.coerce.number().min(0).default(0),
  amountPaid: z.coerce.number().min(0).default(0), paymentMethod: z.enum(["CASH", "CARD", "UPI", "BANK"]).optional(),
  loyaltyPointsToRedeem:z.coerce.number().int().min(0).default(0), remarks: z.string().trim().max(500).nullable().optional(), items: z.array(itemSchema).min(1),
});
export const createInvoiceSchema = invoiceBaseSchema.superRefine((data, ctx) => {
  if (data.amountPaid > 0 && !data.paymentMethod) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["paymentMethod"], message: "Payment method is required when an amount is received" });
});
export const updateInvoiceSchema = invoiceBaseSchema;
export const deliveryStatusSchema=z.object({status:z.enum(["PENDING","READY","DELIVERED","CANCELLED"])});

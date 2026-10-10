import { z } from "zod";

export const updatePaymentSchema = z.object({

  paymentStatus: z.enum([
    "PENDING",
    "PARTIAL",
    "PAID",
  ]),

  paymentMethod: z.enum([
    "CASH",
    "CARD",
    "UPI",
    "BANK",
  ]).optional(),

});
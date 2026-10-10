import { z } from "zod";

export const loyaltySettingSchema = z.object({
  enabled: z.boolean(),
  spendPerPoint: z.coerce.number().positive().max(99999999),
  minimumEarnInvoice: z.coerce.number().min(0).max(99999999),
  expiryEnabled: z.boolean(),
  expiryDays: z.coerce.number().int().min(1).max(3650),
  redemptionValuePerPoint: z.coerce.number().positive().max(999999),
  maximumRedemptionPercent: z.coerce.number().min(0).max(100),
  minimumRedeemInvoice: z.coerce.number().min(0).max(99999999),
});

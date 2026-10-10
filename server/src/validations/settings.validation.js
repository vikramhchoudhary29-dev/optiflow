import { z } from "zod";
export const updateSettingsSchema=z.object({
  shopName:z.string().trim().min(2).max(150),address:z.string().trim().max(500).nullable().optional(),mobile:z.string().trim().min(7).max(20),
  invoicePrefix:z.string().trim().min(1).max(10),customerPrefix:z.string().trim().min(1).max(10),prescriptionPrefix:z.string().trim().min(1).max(10),purchasePrefix:z.string().trim().min(1).max(10),
  gstNumber:z.string().trim().max(30).nullable().optional(),currency:z.string().trim().min(1).max(10),footerNote:z.string().trim().max(500).nullable().optional(),terms:z.string().trim().max(2000).nullable().optional(),logoUrl:z.string().trim().max(500).nullable().optional(),reviewLink:z.string().trim().max(1000).nullable().optional(),
  whatsappMessage:z.string().trim().min(1).max(2000),readyWhatsappMessage:z.string().trim().min(1).max(2000),deliveredWhatsappMessage:z.string().trim().min(1).max(2000),
});

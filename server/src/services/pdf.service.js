import {
  findInvoiceForPdf,
  findPdfSettings,
} from "../repositories/pdf/pdf.repository.js";

/* ============================================================
   GET PDF DATA
============================================================ */

export async function getInvoicePdfService(
  invoiceId,
  shopId
) {
  const invoice = await findInvoiceForPdf(
    invoiceId,
    shopId
  );

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  const settings = await findPdfSettings(shopId);

  return {
    invoice,
    settings,
  };
}
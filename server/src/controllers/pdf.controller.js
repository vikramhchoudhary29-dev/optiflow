import { getInvoicePdfService } from "../services/pdf.service.js";
import { createInvoicePdf } from "../utils/invoicePdf.js";

/* ============================================================
   DOWNLOAD INVOICE PDF
============================================================ */

export async function downloadInvoicePdf(
  req,
  res,
  next
) {
  try {
    const { invoiceId } = req.params;

    const shopId = req.user.shopId;
    const { invoice, settings } =
      await getInvoicePdfService(
        invoiceId,
        shopId
      );

    const pdf = await createInvoicePdf({
      invoice,
      settings,
      size: req.query.size || "A5",
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=${invoice.invoiceCode}.pdf`
    );

    pdf.pipe(res);

    pdf.end();

  } catch (error) {
    next(error);
  }
}

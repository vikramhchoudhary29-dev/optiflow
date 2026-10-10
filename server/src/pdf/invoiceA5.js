import createInvoicePdf from "./templates/invoice/invoicePdf.js";

export default async function generateInvoiceA5(res, invoice) {
  const doc = await createInvoicePdf({
    invoice,
    shop: invoice.shop,
    customer: invoice.customer,
    prescription: invoice.prescription,
    items: invoice.invoiceitem,
    totals: {
      subtotal: Number(invoice.subTotal),
      discount: Number(invoice.discount),
      gst: Number(invoice.gst),
      total: Number(invoice.grandTotal),
      advance: Number(invoice.advance),
      received: Number(invoice.received),
      balance: Number(invoice.balance),
    },
    terms: invoice.shop?.setting?.terms
      ? invoice.shop.setting.terms
          .split("\n")
          .filter(Boolean)
      : [],
    size: "A5",
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=${invoice.invoiceCode}.pdf`
  );

  doc.pipe(res);

  doc.end();
}
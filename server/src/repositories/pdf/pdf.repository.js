import prisma from "../../config/prisma.js";

/* ============================================================
   GET INVOICE FOR PDF
============================================================ */

export async function findInvoiceForPdf(invoiceId, shopId) {
  return prisma.invoice.findFirst({
    where: {
      id: Number(invoiceId),
      shopId,
    },

    include: {
      customer: true,

      prescription: true,

      shop: true,

      invoiceitem: {
        include: {
          frame: true,
          lens: true,
          product: { include: { category: true } },
        },
      },
    },
  });
}

/* ============================================================
   GET SETTINGS
============================================================ */

export async function findPdfSettings(shopId) {
  return prisma.setting.findUnique({
    where: {
      shopId,
    },
  });
}

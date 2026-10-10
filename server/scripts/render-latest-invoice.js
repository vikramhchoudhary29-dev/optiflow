import fs from "fs";
import path from "path";

import prisma from "../src/config/prisma.js";
import { createInvoicePdf } from "../src/utils/invoicePdf.js";

const output = path.resolve(process.argv[2] || "../output/pdf/optiflow-invoice-preview.pdf");

async function main() {
  const invoice = await prisma.invoice.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      prescription: true,
      shop: true,
      invoiceitem: { include: { product: { include: { category: true } } } },
    },
  });
  if (!invoice) throw new Error("No invoice is available for the preview.");
  const settings = await prisma.setting.findUnique({ where: { shopId: invoice.shopId } });
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const stream = fs.createWriteStream(output);
  const document = createInvoicePdf({ invoice, settings });
  document.pipe(stream);
  document.end();
  await new Promise((resolve, reject) => stream.on("finish", resolve).on("error", reject));
  console.log(output);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

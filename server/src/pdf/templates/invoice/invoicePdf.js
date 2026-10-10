import PDFDocument from "pdfkit-table";

import { PAGE } from "../../config/constants.js";

import drawShopHeader from "../../components/ShopHeader.js";
import drawCustomerCard from "../../components/CustomerCard.js";
import drawPrescriptionTable from "../../components/PrescriptionTable.js";
import drawProductTable from "../../components/ProductTable.js";
import drawTotalsCard from "../../components/TotalsCard.js";
import drawAmountWords from "../../components/AmountWords.js";
import drawTermsCard from "../../components/TermsCard.js";
import drawSignatureCard from "../../components/SignatureCard.js";
import drawFooter from "../../components/Footer.js";

export async function createInvoicePdf({
  invoice = {},
  shop = {},
  customer = {},
  prescription = {},
  items = [],
  totals = {},
  terms = [],
}) {
  const doc = new PDFDocument({
    size: PAGE.size,
    margin: PAGE.margin,
    bufferPages: true,
  });

  // =========================
  // HEADER
  // =========================
  drawShopHeader(doc, invoice, shop);

  // =========================
  // CUSTOMER
  // =========================
  drawCustomerCard(doc, customer, prescription);

  // =========================
  // PRESCRIPTION
  // =========================
  drawPrescriptionTable(doc, prescription);

  // =========================
  // ITEMS
  // =========================
  await drawProductTable(doc, items);

  // =========================
  // TOTALS
  // =========================
  drawTotalsCard(doc, totals);

  // =========================
  // AMOUNT IN WORDS
  // =========================
  drawAmountWords(doc, totals.total ?? totals.grandTotal ?? 0);

  // =========================
  // TERMS
  // =========================
  drawTermsCard(doc, terms);

  // =========================
  // SIGNATURE
  // =========================
  drawSignatureCard(doc, shop);

  // =========================
  // FOOTER
  // =========================
  drawFooter(doc);

  doc.end();

  return doc;
}

export default createInvoicePdf;
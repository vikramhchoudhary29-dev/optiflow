import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const PAGE_SIZE = "A5";
const MARGIN = 24;
const COLORS = {
  ink: "#000000",
  muted: "#000000",
  primary: "#4F46E5",
  primarySoft: "#EEF2FF",
  border: "#000000",
  panel: "#FFFFFF",
  white: "#FFFFFF",
  success: "#000000",
};
const FONT = { regular: "Helvetica", bold: "Helvetica-Bold" };

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function belowHundred(number) {
  return number < 20 ? ONES[number] : TENS[Math.floor(number / 10)] + (number % 10 ? ` ${ONES[number % 10]}` : "");
}
function belowThousand(number) {
  const hundreds = Math.floor(number / 100);
  const remainder = number % 100;
  return `${hundreds ? `${ONES[hundreds]} Hundred` : ""}${hundreds && remainder ? " " : ""}${remainder ? belowHundred(remainder) : ""}`.trim();
}
function numberWords(number) {
  if (!number) return "Zero";
  const groups = [[10000000, "Crore"], [100000, "Lakh"], [1000, "Thousand"]];
  let remainder = number;
  const words = [];
  for (const [size, label] of groups) {
    const count = Math.floor(remainder / size);
    if (count) words.push(`${belowThousand(count)} ${label}`);
    remainder %= size;
  }
  if (remainder) words.push(belowThousand(remainder));
  return words.join(" ");
}
function amountToWords(amount) {
  const value = Number(amount || 0);
  const rupees = Math.floor(value);
  const paise = Math.round((value - rupees) * 100);
  return `${numberWords(rupees)} Rupees${paise ? ` and ${numberWords(paise)} Paise` : ""} Only`;
}
function money(value) { return `INR ${Number(value || 0).toFixed(2)}`; }
function safe(value, fallback = "-") { return value === null || value === undefined || value === "" ? fallback : String(value); }
function formatDate(value) { return value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "-"; }
async function loadLogo(settings) {
  if (!settings?.logoUrl) return null;
  try {
    if (/^https?:\/\//i.test(settings.logoUrl)) {
      const response = await fetch(settings.logoUrl);
      return response.ok ? Buffer.from(await response.arrayBuffer()) : null;
    }
    const file = path.resolve(settings.logoUrl.replace(/^\/+/, ""));
    return fs.existsSync(file) ? file : null;
  } catch { return null; }
}
function box(doc, x, y, width, height, options = {}) {
  doc.roundedRect(x, y, width, height, options.radius ?? 5);
  if (options.fill) doc.fillAndStroke(options.fill, options.stroke || options.fill);
  else doc.lineWidth(options.lineWidth || 0.7).strokeColor(options.stroke || COLORS.border).stroke();
}
function text(doc, value, x, y, width, options = {}) {
  doc.font(options.bold ? FONT.bold : FONT.regular)
    .fontSize(options.size || 8)
    .fillColor(options.color || COLORS.ink)
    .text(safe(value), x, y, { width, align: options.align || "left", lineBreak: false, ellipsis: true });
}

export async function createInvoicePdf({ invoice, settings }) {
  const doc = new PDFDocument({ size: PAGE_SIZE, margin: MARGIN, bufferPages: true, autoFirstPage: true, info: { Title: `Invoice ${invoice.invoiceCode}`, Author: invoice.shop?.shopName || "OptiFlow" } });
  const left = MARGIN;
  const width = doc.page.width - MARGIN * 2;
  const bottomLimit = doc.page.height - 31;
  let y = MARGIN;
  const logo = await loadLogo(settings);

  const drawBrandHeader = (continuation = false) => {
    if (continuation) {
      text(doc, invoice.shop?.shopName, left, y, width * 0.65, { bold: true, size: 11 });
      text(doc, `${invoice.invoiceCode} - continued`, left + width * 0.55, y, width * 0.45, { size: 8, color: COLORS.muted, align: "right" });
      y += 22;
      return;
    }
    doc.roundedRect(left, y, width, 68, 7).fill(COLORS.primary);
    if (logo) {
      doc.roundedRect(left + 12, y + 9, 48, 48, 5).fill(COLORS.white);
      doc.image(logo, left + 16, y + 13, { fit: [40, 40], align: "center", valign: "center" });
    }
    const shopX = logo ? left + 76 : left + 15;
    text(doc, invoice.shop?.shopName, shopX, y + 10, width - (shopX - left) - 105, { bold: true, size: 15, color: COLORS.white });
    text(doc, safe(invoice.shop?.address, ""), shopX, y + 31, width - (shopX - left) - 105, { size: 7, color: "#E0E7FF" });
    text(doc, [invoice.shop?.mobile, invoice.shop?.email].filter(Boolean).join("  |  "), shopX, y + 45, width - (shopX - left) - 105, { size: 7, color: "#E0E7FF" });
    text(doc, "TAX INVOICE", left + width - 95, y + 13, 80, { bold: true, size: 11, color: COLORS.white, align: "right" });
    text(doc, invoice.invoiceCode, left + width - 95, y + 33, 80, { bold: true, size: 9, color: COLORS.white, align: "right" });
    text(doc, formatDate(invoice.invoiceDate), left + width - 95, y + 47, 80, { size: 7, color: "#E0E7FF", align: "right" });
    y += 76;
  };

  const addContinuationPage = () => {
    doc.addPage({ size: PAGE_SIZE, margin: MARGIN });
    y = MARGIN;
    drawBrandHeader(true);
  };
  const ensure = (height) => { if (y + height > bottomLimit) addContinuationPage(); };

  drawBrandHeader();

  const gap = 10;
  const cardWidth = (width - gap) / 2;
  box(doc, left, y, cardWidth, 70, { fill: COLORS.panel, stroke: COLORS.border });
  text(doc, "BILL TO", left + 10, y + 9, cardWidth - 20, { bold: true, size: 8, color: COLORS.primary });
  text(doc, invoice.customer?.name, left + 10, y + 25, cardWidth - 20, { bold: true, size: 10 });
  text(doc, invoice.customer?.mobile, left + 10, y + 40, cardWidth - 20, { size: 8, color: COLORS.muted });
  text(doc, invoice.customer?.address, left + 10, y + 53, cardWidth - 20, { size: 7, color: COLORS.muted });

  const detailsX = left + cardWidth + gap;
  box(doc, detailsX, y, cardWidth, 70, { fill: COLORS.panel, stroke: COLORS.border });
  text(doc, "INVOICE DETAILS", detailsX + 10, y + 9, cardWidth - 20, { bold: true, size: 8, color: COLORS.primary });
  const details = [
    ["Payment", invoice.paymentMethod || "Not received"],
    ["Payment status", invoice.paymentStatus],
    ["Delivery", invoice.deliveryDate ? formatDate(invoice.deliveryDate) : invoice.deliveryStatus],
    ["GSTIN", settings?.gstNumber || invoice.shop?.gstNumber],
  ];
  details.forEach(([label, value], index) => {
    text(doc, label, detailsX + 10, y + 24 + index * 10.5, 66, { size: 6.8, color: COLORS.muted });
    text(doc, value, detailsX + 76, y + 24 + index * 10.5, cardWidth - 86, { bold: true, size: 7, align: "right" });
  });
  y += 78;

  if (invoice.prescription) {
    const rxWidths = [76, (width - 76) / 4, (width - 76) / 4, (width - 76) / 4, (width - 76) / 4];
    const rxRows = [
      ["EYE", "SPH", "CYL", "AXIS", "ADD"],
      ["RIGHT (OD)", invoice.prescription.rightSph, invoice.prescription.rightCyl, invoice.prescription.rightAxis, invoice.prescription.rightAdd],
      ["LEFT (OS)", invoice.prescription.leftSph, invoice.prescription.leftCyl, invoice.prescription.leftAxis, invoice.prescription.leftAdd],
    ];
    rxRows.forEach((row, rowIndex) => {
      let cellX = left;
      const rowHeight = rowIndex === 0 ? 20 : 24;
      row.forEach((cell, columnIndex) => {
        doc.rect(cellX, y, rxWidths[columnIndex], rowHeight).fillAndStroke(rowIndex === 0 ? COLORS.ink : COLORS.white, COLORS.border);
        text(doc, safe(cell), cellX + 3, y + (rowIndex === 0 ? 7 : 8), rxWidths[columnIndex] - 6, { bold: rowIndex === 0 || columnIndex === 0, size: 7, color: rowIndex === 0 ? COLORS.white : COLORS.ink, align: "center" });
        cellX += rxWidths[columnIndex];
      });
      y += rowHeight;
    });
    y += 8;
  }

  const columns = [
    { label: "#", width: 20, align: "center" },
    { label: "ITEM", width: 145, align: "left" },
    { label: "QTY", width: 30, align: "center" },
    { label: "RATE", width: 55, align: "right" },
    { label: "DISC", width: 48, align: "right" },
    { label: "AMOUNT", width: width - 298, align: "right" },
  ];
  const drawTableHeader = () => {
    doc.rect(left, y, width, 20).fill(COLORS.ink);
    let x = left;
    columns.forEach((column) => { text(doc, column.label, x + 4, y + 7, column.width - 8, { bold: true, size: 7, color: COLORS.white, align: column.align }); x += column.width; });
    y += 20;
  };
  drawTableHeader();

  const items = Array.isArray(invoice.invoiceitem) ? invoice.invoiceitem : [];
  items.forEach((item, index) => {
    if (y + 25 > bottomLimit - 150) { addContinuationPage(); drawTableHeader(); }
    if (index % 2 === 0) doc.rect(left, y, width, 25).fill(COLORS.panel);
    doc.rect(left, y, width, 25).lineWidth(0.4).strokeColor(COLORS.border).stroke();
    const cells = [String(index + 1), `${safe(item.itemName)}${item.itemCode ? `\n${item.itemCode}` : ""}`, safe(item.quantity), money(item.price), money(item.discount), money(item.total)];
    let x = left;
    cells.forEach((cell, cellIndex) => {
      const column = columns[cellIndex];
      doc.font(cellIndex === 1 ? FONT.bold : FONT.regular).fontSize(cellIndex === 1 ? 7.5 : 7).fillColor(COLORS.ink).text(cell, x + 4, y + (cellIndex === 1 ? 5 : 10), { width: column.width - 8, align: column.align, height: 19, ellipsis: true });
      x += column.width;
    });
    y += 25;
  });
  if (!items.length) { text(doc, "No invoice items", left, y + 9, width, { size: 8, color: COLORS.muted, align: "center" }); y += 28; }
  y += 10;

  ensure(150);
  const summaryWidth = 174;
  const summaryX = left + width - summaryWidth;
  const totalRows = [
    ["Subtotal", invoice.subTotal], ["Discount", invoice.discount], ["GST", invoice.gst],
    ...(Number(invoice.loyaltyDiscount || 0) > 0 ? [[`Loyalty (${invoice.loyaltyPointsRedeemed} points)`, invoice.loyaltyDiscount]] : []),
    ["Grand total", invoice.grandTotal, true], ["Received", invoice.received], ["Balance due", invoice.balance, true],
  ];
  const totalRowHeight = 17;
  const totalsHeight = totalRows.length * totalRowHeight;
  box(doc, summaryX, y, summaryWidth, totalsHeight, { stroke: COLORS.border });
  totalRows.forEach(([label, value, highlight], index) => {
    const rowY = y + index * totalRowHeight;
    if (highlight) doc.rect(summaryX + 1, rowY + 1, summaryWidth - 2, totalRowHeight - 1).fill(index === 3 ? COLORS.primarySoft : "#ECFDF3");
    if (index) doc.moveTo(summaryX, rowY).lineTo(summaryX + summaryWidth, rowY).lineWidth(0.4).strokeColor(COLORS.border).stroke();
    text(doc, label, summaryX + 9, rowY + 5, 78, { bold: Boolean(highlight), size: highlight ? 8 : 7, color: highlight && index === 5 ? COLORS.success : COLORS.ink });
    text(doc, money(value), summaryX + 87, rowY + 5, summaryWidth - 96, { bold: Boolean(highlight), size: highlight ? 8 : 7, align: "right", color: highlight && index === 5 ? COLORS.success : COLORS.ink });
  });
  y += totalsHeight + 9;

  box(doc, left, y, width, 34, { fill: COLORS.panel, stroke: COLORS.border });
  text(doc, "AMOUNT IN WORDS", left + 9, y + 5, width - 18, { bold: true, size: 6.2, color: COLORS.primary });
  doc.font(FONT.regular).fontSize(7).fillColor(COLORS.ink).text(amountToWords(invoice.grandTotal), left + 9, y + 16, { width: width - 18, height: 12, ellipsis: true });
  y += 40;

  ensure(44);
  const termsWidth = width * 0.65;
  box(doc, left, y, termsWidth, 44, { stroke: COLORS.border });
  text(doc, "TERMS & NOTES", left + 9, y + 7, termsWidth - 18, { bold: true, size: 6.5, color: COLORS.primary });
  doc.font(FONT.regular).fontSize(7).fillColor(COLORS.muted).text(settings?.terms || "Goods once sold will not be taken back or exchanged.", left + 9, y + 19, { width: termsWidth - 18, height: 22, ellipsis: true });
  const signatureX = left + termsWidth + 8;
  const signatureWidth = width - termsWidth - 8;
  box(doc, signatureX, y, signatureWidth, 44, { stroke: COLORS.border });
  doc.moveTo(signatureX + 12, y + 25).lineTo(signatureX + signatureWidth - 12, y + 25).lineWidth(0.5).strokeColor(COLORS.border).stroke();
  text(doc, "Authorized signature", signatureX + 5, y + 31, signatureWidth - 10, { bold: true, size: 7, align: "center" });

  const range = doc.bufferedPageRange();
  for (let page = 0; page < range.count; page += 1) {
    doc.switchToPage(page);
    text(doc, settings?.footerNote || "Thank you for your business.", MARGIN, doc.page.height - 37, width * 0.7, { size: 6.5, color: COLORS.muted });
    text(doc, `Page ${page + 1} of ${range.count}`, MARGIN + width * 0.7, doc.page.height - 37, width * 0.3, { size: 6.5, color: COLORS.muted, align: "right" });
  }
  return doc;
}

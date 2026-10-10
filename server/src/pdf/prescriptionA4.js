import PDFDocument from "pdfkit";

const value = (input) => input === null || input === undefined || input === "" ? "-" : String(input);
const lensNames = (prescription) => {
  if (prescription.lens) return prescription.lens;
  const items = prescription.invoice?.[0]?.invoiceitem || [];
  const lenses = items.filter((item) => item.itemType === "LENS" || item.product?.category?.name?.toLowerCase().includes("lens")).map((item) => item.itemName);
  return lenses.join(", ") || "-";
};

function drawShopHeader(doc, prescription, title = "OPTICAL PRESCRIPTIONS") {
  const shop = prescription.shop || {};
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(18).text(shop.shopName || "OptiFlow Optical Shop", 42, 32, { width: 511, align: "center" });
  doc.font("Helvetica").fontSize(8).fillColor("#475569").text([shop.address, shop.mobile && `Phone: ${shop.mobile}`].filter(Boolean).join("  |  "), { align: "center" });
  doc.strokeColor("#111827").lineWidth(1).moveTo(42, 70).lineTo(553, 70).stroke();
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827").text(title, 42, 78, { width: 511, align: "center" });
}

function drawPrescriptionBlock(doc, prescription, top) {
  const left = 48;
  const widths = [92, 82, 82, 82, 82];
  const tableWidth = widths.reduce((sum, width) => sum + width, 0);
  doc.rect(left, top, tableWidth, 28).fillAndStroke("#f8fafc", "#111827");
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(8.5).text(`Customer: ${value(prescription.customer?.name)}`, left + 8, top + 6, { width: 215, ellipsis: true });
  doc.font("Helvetica").fontSize(8).text(`Lens: ${lensNames(prescription)}`, left + 8, top + 16, { width: 245, ellipsis: true });
  doc.font("Helvetica-Bold").fontSize(8.5).text(`Rx: ${prescription.prescriptionCode}`, left + 280, top + 6, { width: 120 });
  doc.font("Helvetica").fontSize(8).text(`Date: ${new Date(prescription.prescriptionDate).toLocaleDateString("en-IN")}`, left + 280, top + 16, { width: 120 });

  let y = top + 28;
  const rows = [["EYE", "SPH", "CYL", "AXIS", "ADD"], ["RIGHT (OD)", prescription.rightSph, prescription.rightCyl, prescription.rightAxis, prescription.rightAdd], ["LEFT (OS)", prescription.leftSph, prescription.leftCyl, prescription.leftAxis, prescription.leftAdd]];
  rows.forEach((cells, rowIndex) => {
    let x = left;
    const height = rowIndex === 0 ? 22 : 25;
    cells.forEach((cell, index) => {
      doc.rect(x, y, widths[index], height).fillAndStroke(rowIndex === 0 ? "#111827" : "#ffffff", "#111827");
      doc.fillColor(rowIndex === 0 ? "#ffffff" : "#111827").font(rowIndex === 0 || index === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(8.5).text(value(cell), x, y + (rowIndex === 0 ? 7 : 8), { width: widths[index], align: "center" });
      x += widths[index];
    });
    y += height;
  });
  return y;
}

function drawFooter(doc, prescription) {
  const note = prescription.shop?.setting?.footerNote || "Generated from OptiFlow ERP.";
  doc.strokeColor("#94a3b8").moveTo(42, 778).lineTo(553, 778).stroke();
  doc.font("Helvetica").fontSize(7).fillColor("#64748b").text(note, 42, 784, { width: 511, align: "center", lineBreak: false });
}

export default function generatePrescriptionA4(res, prescription) {
  const width = 16 * 28.3464567;
  const height = 8.5 * 28.3464567;
  const doc = new PDFDocument({ size: "A4", margin: 0, info: { Title: `Prescription ${prescription.prescriptionCode}` } });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${prescription.prescriptionCode}.pdf"`);
  doc.pipe(res);
  const shop = prescription.shop || {};
  const offsetX = (doc.page.width - width) / 2;
  const tableTop = 66;
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(14).text(shop.shopName || "OptiFlow Optical Shop", offsetX, 24, { width, align: "center" });
  doc.font("Helvetica").fontSize(7).fillColor("#475569").text([shop.address, shop.mobile && `Phone: ${shop.mobile}`].filter(Boolean).join(" | "), offsetX, 43, { width, align: "center", lineBreak: false });

  const left = offsetX;
  const tableWidth = width;
  const detailHeight = 43;
  const headerHeight = 34;
  const eyeRowHeight = (height - detailHeight - headerHeight) / 2;
  const widths = [100, (tableWidth - 100) / 4, (tableWidth - 100) / 4, (tableWidth - 100) / 4, (tableWidth - 100) / 4];
  doc.rect(left, tableTop, tableWidth, detailHeight).fillAndStroke("#f8fafc", "#111827");
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(9).text(`Customer: ${value(prescription.customer?.name)}`, left + 9, tableTop + 9, { width: 245, ellipsis: true });
  doc.font("Helvetica").fontSize(8.5).text(`Lens: ${lensNames(prescription)}`, left + 9, tableTop + 25, { width: 270, ellipsis: true });
  doc.font("Helvetica-Bold").fontSize(9).text(`Rx: ${prescription.prescriptionCode}`, left + 310, tableTop + 9, { width: 130 });
  doc.font("Helvetica").fontSize(8.5).text(`Date: ${new Date(prescription.prescriptionDate).toLocaleDateString("en-IN")}`, left + 310, tableTop + 25, { width: 130 });
  let y = tableTop + detailHeight;
  const rows = [["EYE", "SPH", "CYL", "AXIS", "ADD"], ["RIGHT (OD)", prescription.rightSph, prescription.rightCyl, prescription.rightAxis, prescription.rightAdd], ["LEFT (OS)", prescription.leftSph, prescription.leftCyl, prescription.leftAxis, prescription.leftAdd]];
  rows.forEach((cells, rowIndex) => {
    let x = left;
    const rowHeight = rowIndex === 0 ? headerHeight : eyeRowHeight;
    cells.forEach((cell, index) => {
      doc.rect(x, y, widths[index], rowHeight).fillAndStroke(rowIndex === 0 ? "#111827" : "#ffffff", "#111827");
      doc.fillColor(rowIndex === 0 ? "#ffffff" : "#111827").font(rowIndex === 0 || index === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(rowIndex === 0 ? 10 : 11).text(value(cell), x, y + (rowHeight - 12) / 2, { width: widths[index], align: "center" });
      x += widths[index];
    });
    y += rowHeight;
  });
  doc.end();
}

export function generateBulkPrescriptionA4(res, prescriptions) {
  const doc = new PDFDocument({ size: "A4", margin: 42, autoFirstPage: false, info: { Title: "OptiFlow Prescriptions" } });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="optiflow-prescriptions.pdf"');
  doc.pipe(res);
  let top = 0;
  prescriptions.forEach((prescription, index) => {
    if (index === 0 || top + 112 > 770) {
      if (index > 0) drawFooter(doc, prescriptions[index - 1]);
      doc.addPage({ size: "A4", margin: 42 });
      drawShopHeader(doc, prescription);
      top = 104;
    }
    top = drawPrescriptionBlock(doc, prescription, top) + 10;
  });
  drawFooter(doc, prescriptions[prescriptions.length - 1]);
  doc.end();
}

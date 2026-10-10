import PDFDocument from "pdfkit";

const money = (value) => `INR ${Number(value || 0).toFixed(2)}`;
export default function purchaseReceipt(res, purchase) {
  const doc = new PDFDocument({ size: "A4", margin: 36, info: { Title: `Purchase ${purchase.purchaseCode}` } });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${purchase.purchaseCode}.pdf"`);
  doc.pipe(res);
  doc.font("Helvetica-Bold").fontSize(21).text(purchase.shop.shopName, { align: "center" });
  doc.font("Helvetica").fontSize(9).text([purchase.shop.address, purchase.shop.mobile, purchase.shop.gstNumber ? `GSTIN: ${purchase.shop.gstNumber}` : ""].filter(Boolean).join(" | "), { align: "center" });
  doc.moveDown().moveTo(36, doc.y).lineTo(doc.page.width - 36, doc.y).stroke("#111827");
  doc.moveDown().font("Helvetica-Bold").fontSize(16).text("PURCHASE RECORD", { align: "center" });
  doc.moveDown();
  const top = doc.y;
  doc.fontSize(10).text(`Purchase No: ${purchase.purchaseCode}`, 45, top).text(`Date: ${new Date(purchase.purchaseDate).toLocaleDateString("en-IN")}`, 340, top);
  doc.text(`Supplier: ${purchase.supplier?.name || purchase.supplierName}`, 45, top + 18).text(`Mobile: ${purchase.supplier?.mobile || "-"}`, 340, top + 18);
  let y = top + 55;
  const columns = [45, 75, 170, 350, 410, 485];
  doc.rect(45, y, 505, 24).fill("#111827").fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
  ["#", "CODE", "ITEM", "QTY", "RATE", "AMOUNT"].forEach((label, index) => doc.text(label, columns[index], y + 8, { width: index === 2 ? 165 : 60 }));
  y += 24; doc.fillColor("#111827");
  purchase.purchaseitem.forEach((item, index) => {
    if (y > 735) { doc.addPage(); y = 45; }
    doc.rect(45, y, 505, 27).stroke("#94a3b8"); doc.font("Helvetica").fontSize(9);
    const values = [index + 1, item.product?.sku || "-", item.product?.name || "Product", item.quantity, money(item.purchasePrice), money(item.total)];
    values.forEach((value, position) => doc.text(String(value), columns[position], y + 9, { width: position === 2 ? 165 : position >= 4 ? 65 : 55, align: position >= 3 ? "right" : "left" }));
    y += 27;
  });
  y += 14; doc.font("Helvetica-Bold").fontSize(13).text(`Total: ${money(purchase.totalAmount)}`, 340, y, { width: 210, align: "right" });
  doc.end();
}

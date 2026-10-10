import PDFDocument from "pdfkit";

const money = (value) => `INR ${Number(value || 0).toFixed(2)}`;

export default function paymentReceipt(res, payment) {
  const doc = new PDFDocument({ size: "A5", margin: 32, info: { Title: `Payment Receipt ${payment.id}` } });
  const receiptCode = `RCT${String(payment.id).padStart(4, "0")}`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${receiptCode}.pdf"`);
  doc.pipe(res);

  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(20).text(payment.shop.shopName, { align: "center" });
  doc.font("Helvetica").fontSize(9).text([payment.shop.address, payment.shop.mobile].filter(Boolean).join(" | "), { align: "center" });
  doc.moveDown(0.8).moveTo(32, doc.y).lineTo(doc.page.width - 32, doc.y).lineWidth(1.2).stroke("#111827");
  doc.moveDown(0.8).font("Helvetica-Bold").fontSize(15).text("PAYMENT RECEIPT", { align: "center" });
  doc.moveDown(0.9);

  const rows = [
    ["Receipt No", receiptCode],
    ["Date", new Date(payment.paidAt).toLocaleString("en-IN")],
    ["Customer", payment.invoice.customer.name],
    ["Mobile", payment.invoice.customer.mobile],
    ["Invoice", payment.invoice.invoiceCode],
    ["Payment Method", payment.method],
    ["Reference", payment.reference || "-"],
    ["Received By", payment.createdBy?.name || "-"],
  ];
  rows.forEach(([label, value]) => {
    const y = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).text(label, 45, y, { width: 105 });
    doc.font("Helvetica").text(String(value || "-"), 155, y, { width: doc.page.width - 200 });
    doc.y = Math.max(doc.y, y + 16);
  });

  doc.moveDown(0.8);
  const boxY = doc.y;
  doc.roundedRect(45, boxY, doc.page.width - 90, 58, 6).fillAndStroke("#f1f5f9", "#111827");
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(10).text("AMOUNT RECEIVED", 58, boxY + 12, { width: 150 });
  doc.fontSize(16).text(money(payment.amount), 210, boxY + 9, { width: doc.page.width - 268, align: "right" });
  doc.font("Helvetica").fontSize(9).text(`Remaining balance: ${money(payment.invoice.balance)}`, 58, boxY + 36, { width: doc.page.width - 116, align: "right" });

  doc.y = boxY + 80;
  doc.fontSize(8).fillColor("#64748b").text("This is a computer-generated receipt.", { align: "center" });
  doc.end();
}

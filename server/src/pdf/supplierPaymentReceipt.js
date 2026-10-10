import PDFDocument from "pdfkit";

const money = (value) => `INR ${Number(value || 0).toFixed(2)}`;
export default function supplierPaymentReceipt(res, payment) {
  const code = `PAYOUT${String(payment.id).padStart(4, "0")}`;
  const doc = new PDFDocument({ size: "A5", margin: 34, info: { Title: `Supplier Payment ${code}` } });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${code}.pdf"`);
  doc.pipe(res);
  doc.font("Helvetica-Bold").fontSize(20).text(payment.shop.shopName, { align: "center" });
  doc.font("Helvetica").fontSize(9).text([payment.shop.address, payment.shop.mobile].filter(Boolean).join(" | "), { align: "center" });
  doc.moveDown().moveTo(34, doc.y).lineTo(doc.page.width - 34, doc.y).stroke("#111827");
  doc.moveDown().font("Helvetica-Bold").fontSize(15).text("PAYMENT OUT RECEIPT", { align: "center" });
  doc.moveDown();
  [["Receipt", code], ["Date", new Date(payment.paymentDate).toLocaleString("en-IN")], ["Paid to", payment.supplier.name], ["Mobile", payment.supplier.mobile || "-"], ["Method", payment.paymentMethod], ["Reference", payment.reference || "-"], ["Created by", payment.createdBy?.name || "-"]].forEach(([label, value]) => {
    const y = doc.y; doc.font("Helvetica-Bold").fontSize(10).text(label, 45, y, { width: 100 }); doc.font("Helvetica").text(String(value), 150, y); doc.y = y + 17;
  });
  doc.moveDown(); const y = doc.y; doc.roundedRect(45, y, doc.page.width - 90, 54, 6).fillAndStroke("#f1f5f9", "#111827");
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(11).text("AMOUNT PAID", 58, y + 19); doc.fontSize(16).text(money(payment.amount), 200, y + 15, { width: doc.page.width - 258, align: "right" });
  if (payment.notes) doc.font("Helvetica").fontSize(9).text(`Notes: ${payment.notes}`, 45, y + 75);
  doc.end();
}


import PDFDocument from "pdfkit";

const money = (value) => `INR ${Number(value || 0).toFixed(2)}`;
export default function subscriptionReceipt(res, payment) {
  const code = `SUB-RCT-${String(payment.id).padStart(5, "0")}`;
  const doc = new PDFDocument({
    size: "A5",
    margin: 36,
    info: { Title: code },
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${code}.pdf"`);
  doc.pipe(res);
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#111827")
    .text("OptiFlow", { align: "center" });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#64748b")
    .text("Optical Shop ERP", { align: "center" });
  doc
    .moveDown()
    .moveTo(36, doc.y)
    .lineTo(doc.page.width - 36, doc.y)
    .stroke("#111827");
  doc
    .moveDown()
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor("#111827")
    .text("SUBSCRIPTION RECEIPT", { align: "center" });
  doc.moveDown();
  const rows = [
    ["Receipt", code],
    ["Shop", payment.shop.shopName],
    ["Owner", payment.shop.ownerName],
    ["Mobile", payment.shop.mobile],
    ["Plan", "OptiFlow Plan"],
    [
      "Payment date",
      payment.paidAt
        ? new Date(payment.paidAt).toLocaleDateString("en-IN")
        : "-",
    ],
    ["Reference", payment.reference || "-"],
    ["Status", payment.status],
  ];
  rows.forEach(([label, value]) => {
    const y = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).text(label, 48, y, { width: 110 });
    doc.font("Helvetica").text(String(value), 165, y, { width: 200 });
    doc.y = y + 18;
  });
  const y = doc.y + 10;
  doc
    .roundedRect(48, y, doc.page.width - 96, 56, 6)
    .fillAndStroke("#eef2ff", "#312e81");
  doc
    .fillColor("#111827")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("AMOUNT PAID", 62, y + 20);
  doc
    .fontSize(17)
    .text(money(payment.amount), 210, y + 15, { width: 150, align: "right" });
  doc.y = y + 82;
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#64748b")
    .text("Computer-generated receipt from OptiFlow.", { align: "center" });
  doc.end();
}

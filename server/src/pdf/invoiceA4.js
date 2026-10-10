import PDFDocument from "pdfkit";

export default function generateInvoiceA4(res, invoice) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `inline; filename=${invoice.invoiceCode}.pdf`
  );

  doc.pipe(res);

  /* ==========================================================
   SHOP HEADER
========================================================== */

doc
  .fontSize(24)
  .fillColor("#0F172A")
  .text(invoice.shop.shopName, {
    align: "center",
  });

doc
  .moveDown(0.2)
  .fontSize(11)
  .fillColor("gray")
  .text("Premium Eye Care & Vision Center", {
    align: "center",
  });

doc.moveDown();

doc
  .fontSize(10)
  .fillColor("black")
  .text(`Address : ${invoice.shop.address || "-"}`, {
    align: "center",
  });

doc.text("Mobile : +91 9876543210", {
  align: "center",
});

doc.text("Email : info@optiflow.com", {
  align: "center",
});

doc.text("GSTIN : 23ABCDE1234F1Z5", {
  align: "center",
});

doc.moveDown();

doc
  .moveTo(40, doc.y)
  .lineTo(555, doc.y)
  .stroke();

doc.moveDown();
 /* ==========================================================
   INVOICE DETAILS
========================================================== */

doc.fontSize(12);

doc.text(
  `Invoice No : ${invoice.invoiceCode}`
);

doc.text(
  `Invoice Date : ${new Date(
    invoice.invoiceDate
  ).toLocaleDateString()}`
);

doc.text(
  `Payment Status : ${invoice.paymentStatus}`
);

doc.text(
  `Payment Method : ${invoice.paymentMethod || "-"}`
);

doc.moveDown();
 /* ==========================================================
   CUSTOMER
========================================================== */

doc
  .fontSize(15)
  .fillColor("#0F172A")
  .text("Customer Details");

doc.moveDown(0.5);

doc.fontSize(11).fillColor("black");

doc.text(`Name : ${invoice.customer.name}`);

doc.text(`Mobile : ${invoice.customer.mobile}`);

doc.text(
  `Customer Code : ${invoice.customer.customerCode}`
);

doc.moveDown();
/* ==========================================================
   PRESCRIPTION
========================================================== */

if (invoice.prescription) {

  doc
    .fontSize(15)
    .fillColor("#0F172A")
    .text("Prescription");

  doc.moveDown(0.5);

  const tableX = 45;
  let tableTop = doc.y;
  const columnWidths = [101, 101, 101, 101, 101];
  const rows = [
    ["EYE", "SPH", "CYL", "AXIS", "ADD"],
    ["RIGHT (OD)", invoice.prescription.rightSph ?? "-", invoice.prescription.rightCyl ?? "-", invoice.prescription.rightAxis ?? "-", invoice.prescription.rightAdd ?? "-"],
    ["LEFT (OS)", invoice.prescription.leftSph ?? "-", invoice.prescription.leftCyl ?? "-", invoice.prescription.leftAxis ?? "-", invoice.prescription.leftAdd ?? "-"],
  ];

  rows.forEach((row, rowIndex) => {
    let cellX = tableX;
    const rowHeight = rowIndex === 0 ? 25 : 30;
    row.forEach((cell, columnIndex) => {
      doc.rect(cellX, tableTop, columnWidths[columnIndex], rowHeight)
        .fillAndStroke(rowIndex === 0 ? "#111827" : "#FFFFFF", "#111827");
      doc.fillColor(rowIndex === 0 ? "#FFFFFF" : "#111827")
        .font(rowIndex === 0 || columnIndex === 0 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(9)
        .text(String(cell), cellX, tableTop + (rowIndex === 0 ? 8 : 10), { width: columnWidths[columnIndex], align: "center" });
      cellX += columnWidths[columnIndex];
    });
    tableTop += rowHeight;
  });

  doc.x = 40;
  doc.y = tableTop + 14;

}
 /* ==========================================================
   ITEMS
========================================================== */

doc
  .fontSize(15)
  .fillColor("#0F172A")
  .text("Invoice Items");

doc.moveDown(0.5);

const startX = 45;
let tableY = doc.y;

// Header Line
doc.moveTo(startX, tableY - 5)
   .lineTo(550, tableY - 5)
   .stroke();

doc.fontSize(11).fillColor("black");

doc.text("Item", startX, tableY);

doc.text("Qty", 310, tableY);

doc.text("Price", 380, tableY);

doc.text("Total", 470, tableY);

tableY += 20;

// Bottom Header Line
doc.moveTo(startX, tableY - 5)
   .lineTo(550, tableY - 5)
   .stroke();

/* ============================
   ROWS
============================ */

invoice.invoiceitem.forEach(item => {

  doc.text(item.itemName, startX, tableY);

  doc.text(String(item.quantity), 315, tableY);

  doc.text(`₹${item.price}`, 380, tableY);

  doc.text(`₹${item.total}`, 470, tableY);

  tableY += 22;

});

doc.moveTo(startX, tableY - 5)
   .lineTo(550, tableY - 5)
   .stroke();

doc.moveDown(3);

  /* ==========================================================
   TOTALS
========================================================== */

doc.moveDown();

const boxX = 330;
let boxY = doc.y;

doc
  .rect(boxX, boxY, 200, 110)
  .stroke();

boxY += 12;

doc
  .fontSize(11)
  .fillColor("black")
  .text("Subtotal", boxX + 10, boxY);

doc.text(`₹${invoice.subTotal}`, boxX + 120, boxY, {
  width: 60,
  align: "right",
});

boxY += 22;

doc.text("Discount", boxX + 10, boxY);

doc.text(`₹${invoice.discount}`, boxX + 120, boxY, {
  width: 60,
  align: "right",
});

boxY += 22;

doc.text("GST", boxX + 10, boxY);

doc.text(`₹${invoice.gst}`, boxX + 120, boxY, {
  width: 60,
  align: "right",
});

boxY += 28;

doc
  .moveTo(boxX, boxY - 8)
  .lineTo(boxX + 200, boxY - 8)
  .stroke();

doc
  .fontSize(13)
  .fillColor("#0F172A")
  .text("GRAND TOTAL", boxX + 10, boxY);

doc.text(`₹${invoice.grandTotal}`, boxX + 105, boxY, {
  width: 75,
  align: "right",
});

doc.moveDown(5);

/* ==========================================================
   PAYMENT
========================================================== */

doc
  .fontSize(14)
  .fillColor("#0F172A")
  .text("Payment Information");

doc.moveDown(0.5);

doc
  .fontSize(11)
  .fillColor("black");

doc.text(
  `Payment Status : ${invoice.paymentStatus}`
);

doc.text(
  `Payment Method : ${invoice.paymentMethod || "-"}`
);

doc.moveDown();

  /* ==========================================================
     FOOTER
  ========================================================== */

  doc.fontSize(10);

  doc.text(
    "Thank you for visiting OptiFlow Opticals",
    {
      align: "center",
    }
  );

  doc.text(
    "Next Eye Checkup : One Year Later",
    {
      align: "center",
    }
  );

  doc.end();
}

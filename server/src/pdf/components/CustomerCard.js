import COLORS from "../config/colors.js";
import { PAGE, FONT } from "../config/constants.js";

export function drawCustomerCard(doc, customer = {}, prescription = {}) {
  const startX = PAGE.margin;
  const startY = doc.y;

  const width = doc.page.width - PAGE.margin * 2;
  const height = 95;

  // Border
  doc
    .roundedRect(startX, startY, width, height, 4)
    .lineWidth(1)
    .strokeColor(COLORS.border)
    .stroke();

  // Header
  doc
    .rect(startX, startY, width, 22)
    .fill(COLORS.light);

  doc
    .font(FONT.bold)
    .fontSize(10)
    .fillColor(COLORS.primary)
    .text("BILL TO", startX + 8, startY + 6);

  const leftX = startX + 10;
  let y = startY + 30;

  function row(label, value) {
    if (!value) return;

    doc
      .font(FONT.bold)
      .fontSize(8)
      .fillColor(COLORS.text)
      .text(label, leftX, y, { continued: true });

    doc
      .font(FONT.regular)
      .text(` ${value}`);

    y += 14;
  }

  row("Name :", customer.name);
  row("Mobile :", customer.mobile);
  row("Address :", customer.address);
  row("Doctor :", prescription.doctorName);
  row("Age :", customer.age);
  row("Gender :", customer.gender);

  // Right Side
  const rightX = startX + width - 170;
  let ry = startY + 30;

  function rightRow(label, value) {
    if (!value) return;

    doc
      .font(FONT.bold)
      .fontSize(8)
      .text(label, rightX, ry, { continued: true });

    doc
      .font(FONT.regular)
      .text(` ${value}`);

    ry += 14;
  }

  rightRow("Customer ID :", customer.customerCode);
  rightRow("Reference :", prescription.reference);
  rightRow("Salesman :", customer.salesman);
  rightRow("Created :", customer.createdBy);

  doc.y = startY + height + 12;
}

export default drawCustomerCard;
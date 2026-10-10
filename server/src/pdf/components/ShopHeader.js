import COLORS from "../config/colors.js";
import { PAGE, FONT } from "../config/constants.js";
import { drawLogo } from "../helpers/logo.js";

export function drawShopHeader(doc, invoice = {}, shop = {}) {
  const leftX = PAGE.margin;
  const topY = PAGE.margin;
  const pageWidth = doc.page.width - PAGE.margin * 2;

  // Draw Logo
  drawLogo(doc, {
    logoPath: shop.logo,
    x: leftX,
    y: topY,
    width: 50,
    height: 50,
  });

  // Shop Name
  doc
    .font(FONT.bold)
    .fontSize(16)
    .fillColor(COLORS.primary)
    .text(shop.name || "SHOP NAME", leftX + 60, topY, {
      width: pageWidth - 180,
    });

  // Address
  doc
    .font(FONT.regular)
    .fontSize(8)
    .fillColor(COLORS.secondary)
    .text(shop.address || "-", leftX + 60, topY + 20, {
      width: pageWidth - 180,
    });

  // Mobile
  if (shop.mobile) {
    doc.text(`Mobile : ${shop.mobile}`, leftX + 60, topY + 36);
  }

  // Email
  if (shop.email) {
    doc.text(`Email : ${shop.email}`, leftX + 60, topY + 48);
  }

  // GST
  if (shop.gstin) {
    doc.text(`GSTIN : ${shop.gstin}`, leftX + 60, topY + 60);
  }

  // Invoice Box
  const boxWidth = 110;
  const boxHeight = 55;
  const boxX = doc.page.width - PAGE.margin - boxWidth;

  doc
    .roundedRect(boxX, topY, boxWidth, boxHeight, 4)
    .lineWidth(1)
    .strokeColor(COLORS.border)
    .stroke();

  doc
    .font(FONT.bold)
    .fontSize(14)
    .fillColor(COLORS.primary)
    .text("TAX INVOICE", boxX, topY + 8, {
      width: boxWidth,
      align: "center",
    });

  doc
    .font(FONT.regular)
    .fontSize(8)
    .fillColor(COLORS.text)
    .text(`Invoice No : ${invoice.invoiceNo || "-"}`, boxX + 8, topY + 28);

  doc.text(
    `Date : ${
      invoice.invoiceDate
        ? new Date(invoice.invoiceDate).toLocaleDateString("en-IN")
        : "-"
    }`,
    boxX + 8,
    topY + 40
  );

  // Divider
  doc
    .moveTo(PAGE.margin, topY + 80)
    .lineTo(doc.page.width - PAGE.margin, topY + 80)
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .stroke();

  doc.y = topY + 90;
}

export default drawShopHeader;
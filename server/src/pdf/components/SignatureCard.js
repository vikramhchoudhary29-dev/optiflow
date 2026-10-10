import COLORS from "../config/colors.js";
import { PAGE, FONT } from "../config/constants.js";

export function drawSignatureCard(doc, shop = {}) {
  const width = 180;
  const height = 70;

  const x = doc.page.width - PAGE.margin - width;
  const y = doc.y;

  doc
    .roundedRect(x, y, width, height, 4)
    .lineWidth(1)
    .strokeColor(COLORS.border)
    .stroke();

  doc
    .font(FONT.bold)
    .fontSize(9)
    .fillColor(COLORS.primary)
    .text("Authorised Signatory", x, y + 48, {
      width,
      align: "center",
    });

  if (shop.name) {
    doc
      .font(FONT.regular)
      .fontSize(8)
      .fillColor(COLORS.secondary)
      .text(shop.name, x, y + 60, {
        width,
        align: "center",
      });
  }

  doc.y = y + height + 10;
}

export default drawSignatureCard;
import COLORS from "../config/colors.js";
import { PAGE, FONT } from "../config/constants.js";

export function drawFooter(doc) {
  const y = doc.page.height - PAGE.margin + 5;

  doc
    .moveTo(PAGE.margin, y - 8)
    .lineTo(doc.page.width - PAGE.margin, y - 8)
    .strokeColor(COLORS.border)
    .stroke();

  doc
    .font(FONT.regular)
    .fontSize(8)
    .fillColor(COLORS.secondary)
    .text(
      "Thank you for your business!",
      PAGE.margin,
      y,
      {
        width: doc.page.width - PAGE.margin * 2,
        align: "center",
      }
    );
}

export default drawFooter;
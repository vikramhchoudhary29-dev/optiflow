import { PAGE, FONT } from "../config/constants.js";
import COLORS from "../config/colors.js";

export function drawPageNumber(doc) {
  doc
    .font(FONT.regular)
    .fontSize(8)
    .fillColor(COLORS.secondary)
    .text(
      `Page ${doc.bufferedPageRange().start + 1}`,
      PAGE.margin,
      doc.page.height - PAGE.margin + 5,
      {
        width: doc.page.width - PAGE.margin * 2,
        align: "right",
      }
    );
}

export default drawPageNumber;
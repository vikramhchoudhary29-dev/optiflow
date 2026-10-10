import COLORS from "../config/colors.js";
import { PAGE, FONT } from "../config/constants.js";

export function drawTermsCard(doc, terms = []) {
  const x = PAGE.margin;
  const y = doc.y;
  const width = doc.page.width - PAGE.margin * 2;

  const list = terms.length
    ? terms
    : [
        "Goods once sold will not be taken back.",
        "Warranty is as per manufacturer policy.",
        "Subject to local jurisdiction only.",
      ];

  const height = 28 + list.length * 14;

  doc
    .roundedRect(x, y, width, height, 4)
    .lineWidth(1)
    .strokeColor(COLORS.border)
    .stroke();

  doc
    .font(FONT.bold)
    .fontSize(9)
    .fillColor(COLORS.primary)
    .text("Terms & Conditions", x + 10, y + 8);

  let lineY = y + 24;

  list.forEach((term) => {
    doc
      .font(FONT.regular)
      .fontSize(8)
      .fillColor(COLORS.text)
      .text(`• ${term}`, x + 10, lineY);

    lineY += 14;
  });

  doc.y = y + height + 10;
}

export default drawTermsCard;
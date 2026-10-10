import COLORS from "../config/colors.js";
import { PAGE, FONT } from "../config/constants.js";
import { amountToWords } from "../helpers/amountToWords.js";

export function drawAmountWords(doc, amount = 0) {
  const x = PAGE.margin;
  const y = doc.y;
  const width = doc.page.width - PAGE.margin * 2;
  const height = 42;

  doc
    .roundedRect(x, y, width, height, 4)
    .lineWidth(1)
    .strokeColor(COLORS.border)
    .stroke();

  doc
    .font(FONT.bold)
    .fontSize(9)
    .fillColor(COLORS.primary)
    .text("Amount in Words", x + 10, y + 8);

  doc
    .font(FONT.regular)
    .fontSize(9)
    .fillColor(COLORS.text)
    .text(amountToWords(amount), x + 10, y + 22, {
      width: width - 20,
    });

  doc.y = y + height + 10;
}

export default drawAmountWords;
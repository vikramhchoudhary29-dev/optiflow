import COLORS from "../config/colors.js";
import { PAGE, FONT } from "../config/constants.js";
import { money } from "../helpers/currency.js";

export function drawTotalsCard(doc, totals = {}) {
  const boxWidth = 200;
  const rowHeight = 20;

  const startX = doc.page.width - PAGE.margin - boxWidth;
  const startY = doc.y;

  const rows = [
    {
      label: "Subtotal",
      value: totals.subtotal ?? totals.subTotal ?? 0,
    },
    {
      label: "Discount",
      value: totals.discount ?? 0,
    },
    {
      label: "GST",
      value: totals.gst ?? totals.tax ?? 0,
    },
    {
      label: "Grand Total",
      value: totals.total ?? totals.grandTotal ?? 0,
      highlight: true,
    },
    {
      label: "Received",
      value: totals.received ?? totals.paidAmount ?? 0,
    },
    {
      label: "Advance",
      value: totals.advance ?? 0,
    },
    {
      label: "Balance",
      value: totals.balance ?? totals.dueAmount ?? 0,
      highlight: true,
    },
  ];

  doc
    .font(FONT.bold)
    .fontSize(10)
    .fillColor(COLORS.primary)
    .text("TOTALS", startX, startY - 18);

  let y = startY;

  rows.forEach((row) => {
    if (row.highlight) {
      doc
        .rect(startX, y, boxWidth, rowHeight)
        .fill(COLORS.light);
    }

    doc
      .rect(startX, y, boxWidth, rowHeight)
      .strokeColor(COLORS.border)
      .lineWidth(0.7)
      .stroke();

    doc
      .font(row.highlight ? FONT.bold : FONT.regular)
      .fontSize(8)
      .fillColor(COLORS.text)
      .text(row.label, startX + 8, y + 6);

    doc.text(
      money(row.value),
      startX,
      y + 6,
      {
        width: boxWidth - 8,
        align: "right",
      }
    );

    y += rowHeight;
  });

  doc.y = Math.max(doc.y, y + 10);
}

export default drawTotalsCard;
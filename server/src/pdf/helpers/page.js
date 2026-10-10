import { PAGE } from "../config/constants.js";

export function getContentWidth(doc) {
  return doc.page.width - PAGE.margin * 2;
}

export function pageBottom(doc) {
  return doc.page.height - PAGE.margin;
}

export function remainingHeight(doc) {
  return pageBottom(doc) - doc.y;
}

export function ensureSpace(doc, requiredHeight = 40) {
  if (remainingHeight(doc) < requiredHeight) {
    doc.addPage();
    doc.y = PAGE.margin;
  }
}

export function moveDown(doc, space = 10) {
  doc.y += space;
}

export function drawBox(doc, x, y, width, height, options = {}) {
  const {
    fillColor = null,
    strokeColor = "#D1D5DB",
    lineWidth = 1,
  } = options;

  doc.save();

  if (fillColor) {
    doc.fillColor(fillColor);
    doc.rect(x, y, width, height).fill();
  }

  doc
    .lineWidth(lineWidth)
    .strokeColor(strokeColor)
    .rect(x, y, width, height)
    .stroke();

  doc.restore();
}

export function drawLine(doc, x1, y1, x2, y2, color = "#D1D5DB") {
  doc
    .save()
    .moveTo(x1, y1)
    .lineTo(x2, y2)
    .strokeColor(color)
    .lineWidth(1)
    .stroke()
    .restore();
}

export function centerText(doc, text, y, options = {}) {
  doc.text(text, PAGE.margin, y, {
    width: getContentWidth(doc),
    align: "center",
    ...options,
  });
}

export function rightText(doc, text, y, options = {}) {
  doc.text(text, PAGE.margin, y, {
    width: getContentWidth(doc),
    align: "right",
    ...options,
  });
}

export function leftText(doc, text, y, options = {}) {
  doc.text(text, PAGE.margin, y, {
    width: getContentWidth(doc),
    align: "left",
    ...options,
  });
}
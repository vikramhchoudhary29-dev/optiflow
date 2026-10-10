import COLORS from "../config/colors.js";
import { PAGE, FONT } from "../config/constants.js";

export function drawPrescriptionTable(doc, prescription = {}) {
  const startX = PAGE.margin;
  const startY = doc.y;

  const pageWidth = doc.page.width - PAGE.margin * 2;

  const columns = [
    { title: "Eye", width: 45 },
    { title: "SPH", width: 55 },
    { title: "CYL", width: 55 },
    { title: "AXIS", width: 45 },
    { title: "ADD", width: 45 },
    { title: "PD", width: 45 },
    { title: "VA", width: 45 },
  ];

  // Section Title
  doc
    .font(FONT.bold)
    .fontSize(10)
    .fillColor(COLORS.primary)
    .text("PRESCRIPTION", startX, startY);

  let y = startY + 18;
  let x = startX;

  // Header
  columns.forEach((column) => {
    doc
      .rect(x, y, column.width, 20)
      .fillAndStroke(COLORS.light, COLORS.border);

    doc
      .fillColor(COLORS.primary)
      .font(FONT.bold)
      .fontSize(8)
      .text(column.title, x, y + 6, {
        width: column.width,
        align: "center",
      });

    x += column.width;
  });

  const rows = [
    {
      eye: "Right",
      sph: prescription.rightSph ?? "-",
      cyl: prescription.rightCyl ?? "-",
      axis: prescription.rightAxis ?? "-",
      add: prescription.rightAdd ?? "-",
      pd: prescription.rightPd ?? "-",
      va: prescription.rightVa ?? "-",
    },
    {
      eye: "Left",
      sph: prescription.leftSph ?? "-",
      cyl: prescription.leftCyl ?? "-",
      axis: prescription.leftAxis ?? "-",
      add: prescription.leftAdd ?? "-",
      pd: prescription.leftPd ?? "-",
      va: prescription.leftVa ?? "-",
    },
  ];

  y += 20;

  rows.forEach((row) => {
    x = startX;

    [
      row.eye,
      row.sph,
      row.cyl,
      row.axis,
      row.add,
      row.pd,
      row.va,
    ].forEach((value, index) => {
      doc
        .rect(x, y, columns[index].width, 22)
        .stroke(COLORS.border);

      doc
        .font(index === 0 ? FONT.bold : FONT.regular)
        .fontSize(8)
        .fillColor(COLORS.text)
        .text(String(value), x, y + 7, {
          width: columns[index].width,
          align: "center",
        });

      x += columns[index].width;
    });

    y += 22;
  });

  // Bottom Details
  y += 12;

  const details = [
    ["Lens Type", prescription.lensType],
    ["Lens Index", prescription.lensIndex],
    ["Coating", prescription.coating],
    ["Frame", prescription.frame],
    ["Remarks", prescription.remarks],
  ];

  details.forEach(([label, value]) => {
    if (!value) return;

    doc
      .font(FONT.bold)
      .fontSize(8)
      .fillColor(COLORS.primary)
      .text(`${label}:`, startX, y, { continued: true });

    doc
      .font(FONT.regular)
      .fillColor(COLORS.text)
      .text(` ${value}`);

    y += 13;
  });

  doc.y = y + 10;
}

export default drawPrescriptionTable;
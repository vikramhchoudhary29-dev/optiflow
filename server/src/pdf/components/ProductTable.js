import PDFDocument from "pdfkit-table";
import COLORS from "../config/colors.js";
import { FONT } from "../config/constants.js";
import { money } from "../helpers/currency.js";

export async function drawProductTable(doc, items = []) {
  if (!items.length) return;

  doc.moveDown(0.5);

  doc
    .font(FONT.bold)
    .fontSize(10)
    .fillColor(COLORS.primary)
    .text("ITEM DETAILS");

  doc.moveDown(0.4);

  const table = {
    headers: [
      {
        label: "Sr",
        property: "sr",
        width: 28,
        align: "center",
      },
      {
        label: "Product",
        property: "product",
        width: 165,
      },
      {
        label: "Qty",
        property: "qty",
        width: 35,
        align: "center",
      },
      {
        label: "Rate",
        property: "rate",
        width: 55,
        align: "right",
      },
      {
        label: "Disc",
        property: "discount",
        width: 45,
        align: "right",
      },
      {
        label: "GST",
        property: "gst",
        width: 40,
        align: "center",
      },
      {
        label: "Amount",
        property: "amount",
        width: 65,
        align: "right",
      },
    ],

    datas: items.map((item, index) => ({
      sr: index + 1,
      product: [
        item.productName || item.name || "",
        item.code ? `(${item.code})` : "",
      ]
        .filter(Boolean)
        .join(" "),

      qty: item.quantity ?? 1,
      rate: money(item.rate ?? item.price ?? 0),
      discount: money(item.discount ?? 0),
      gst: `${item.gst ?? item.gstRate ?? 0}%`,
      amount: money(item.total ?? item.amount ?? 0),
    })),
  };

  await doc.table(table, {
    width: 470,

    prepareHeader: () => {
      doc
        .font(FONT.bold)
        .fontSize(8)
        .fillColor("white");
    },

    prepareRow: () => {
      doc
        .font(FONT.regular)
        .fontSize(8)
        .fillColor(COLORS.text);
    },

    divider: {
      header: {
        disabled: false,
        width: 1,
        color: COLORS.border,
      },
      horizontal: {
        disabled: false,
        width: 0.5,
        color: "#EEEEEE",
      },
    },

    padding: 6,

    columnSpacing: 3,

    minRowHeight: 22,

    headerBackgroundColor: COLORS.primary,
  });

  doc.moveDown();
}

export default drawProductTable;
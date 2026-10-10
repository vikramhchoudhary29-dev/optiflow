import readXlsxFile from "read-excel-file/node";

import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { generateCustomerCode } from "../utils/codeGenerator.js";
import { generateProductCode } from "../utils/codeGenerator.js";

const normalized = (value) => String(value ?? "").trim();
const key = (value) => normalized(value).toLowerCase().replace(/[^a-z0-9]/g, "");

async function rowsFrom(buffer) {
  const workbook = await readXlsxFile(buffer);
  const rows = Array.isArray(workbook?.[0]?.data) ? workbook[0].data : workbook;
  if (rows.length < 2) throw new AppError("The workbook must contain a header row and at least one data row", 400);
  const headers = rows[0].map(key);
  return rows.slice(1).filter((row) => row.some((cell) => cell !== null && cell !== "")).map((row, index) => ({
    rowNumber: index + 2,
    values: Object.fromEntries(headers.map((header, column) => [header, row[column]])),
  }));
}

function required(row, field, label = field) {
  const value = row.values[key(field)];
  if (value === null || value === undefined || normalized(value) === "") throw new AppError(`Row ${row.rowNumber}: ${label} is required`, 400);
  return normalized(value);
}
function optional(row, field) {
  const value = row.values[key(field)];
  return value === null || value === undefined || normalized(value) === "" ? null : normalized(value);
}
function number(row, field, { minimum = 0, integer = false } = {}) {
  const raw = row.values[key(field)];
  const value = raw === null || raw === undefined || raw === "" ? 0 : Number(raw);
  if (!Number.isFinite(value) || value < minimum || (integer && !Number.isInteger(value))) throw new AppError(`Row ${row.rowNumber}: ${field} is invalid`, 400);
  return value;
}
function assertUnique(values, label) {
  const seen = new Set();
  for (const value of values.filter(Boolean).map((item) => item.toLowerCase())) {
    if (seen.has(value)) throw new AppError(`The workbook contains a duplicate ${label}: ${value}`, 400);
    seen.add(value);
  }
}

export async function importCustomers(shopId, buffer) {
  const rows = await rowsFrom(buffer);
  if (rows.length > 2000) throw new AppError("A maximum of 2,000 customers can be imported at once", 400);
  const records = rows.map((row) => ({
    name: required(row, "Name"), mobile: required(row, "Mobile"), email: optional(row, "Email"),
    address: optional(row, "Address"), city: optional(row, "City"), state: optional(row, "State"),
    pincode: optional(row, "Pincode"), remarks: optional(row, "Notes"),
  }));
  assertUnique(records.map((item) => item.mobile), "mobile number");
  const duplicate = await prisma.customer.findFirst({ where: { shopId, mobile: { in: records.map((item) => item.mobile) } } });
  if (duplicate) throw new AppError(`Customer mobile already exists: ${duplicate.mobile}`, 409);
  return prisma.$transaction(async (tx) => {
    for (const record of records) {
      const customerCode = await generateCustomerCode(tx, shopId);
      await tx.customer.create({ data: { ...record, shopId, customerCode } });
    }
    return { imported: records.length };
  }, { isolationLevel: "Serializable" });
}

export async function importSuppliers(shopId, buffer) {
  const rows = await rowsFrom(buffer);
  if (rows.length > 2000) throw new AppError("A maximum of 2,000 suppliers can be imported at once", 400);
  const records = rows.map((row) => ({
    name: required(row, "Name"), mobile: optional(row, "Mobile"), email: optional(row, "Email"),
    address: optional(row, "Address"), notes: optional(row, "Notes"),
  }));
  assertUnique(records.map((item) => item.name), "supplier name");
  const duplicate = await prisma.supplier.findFirst({ where: { shopId, name: { in: records.map((item) => item.name) } } });
  if (duplicate) throw new AppError(`Supplier already exists: ${duplicate.name}`, 409);
  await prisma.supplier.createMany({ data: records.map((record) => ({ ...record, shopId })) });
  return { imported: records.length };
}

export async function importProducts(shopId, userId, buffer) {
  const rows = await rowsFrom(buffer);
  if (rows.length > 5000) throw new AppError("A maximum of 5,000 products can be imported at once", 400);
  const records = rows.map((row) => ({
    categoryName: required(row, "Category"), name: required(row, "Name"), brand: optional(row, "Brand"),
    sku: optional(row, "SKU"), barcode: optional(row, "Barcode"),
    purchasePrice: number(row, "Purchase Price"), sellingPrice: number(row, "Selling Price"),
    stock: number(row, "Opening Stock", { integer: true }), minimumStock: 0,
  }));
  assertUnique(records.map((item) => item.sku), "SKU");
  assertUnique(records.map((item) => item.barcode), "barcode");
  const duplicate = await prisma.product.findFirst({ where: { shopId, OR: [
    { sku: { in: records.map((item) => item.sku).filter(Boolean) } },
    { barcode: { in: records.map((item) => item.barcode).filter(Boolean) } },
  ] } });
  if (duplicate) throw new AppError(`Product SKU or barcode already exists: ${duplicate.sku}`, 409);
  return prisma.$transaction(async (tx) => {
    const categories = new Map((await tx.category.findMany({ where: { shopId } })).map((item) => [item.name.toLowerCase(), item]));
    for (const record of records) {
      const categoryKey = record.categoryName.toLowerCase();
      let category = categories.get(categoryKey);
      if (!category) {
        category = await tx.category.create({ data: { shopId, name: record.categoryName } });
        categories.set(categoryKey, category);
      } else if (!category.active) {
        category = await tx.category.update({ where: { id: category.id }, data: { active: true } });
        categories.set(categoryKey, category);
      }
      const { categoryName, ...data } = record;
      const sku = data.sku || await generateProductCode(tx, shopId);
      const product = await tx.product.create({ data: { ...data, sku, shopId, categoryId: category.id } });
      if (record.stock > 0) await tx.stockMovement.create({ data: { shopId, productId: product.id, type: "ADJUSTMENT_IN", quantity: record.stock, referenceType: "EXCEL_IMPORT", createdById: userId } });
    }
    return { imported: records.length };
  }, { isolationLevel: "Serializable" });
}

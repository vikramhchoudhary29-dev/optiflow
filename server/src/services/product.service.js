import AppError from "../utils/AppError.js";
import * as repo from "../repositories/product.repository.js";
import { generateProductCode } from "../utils/codeGenerator.js";

export const listProducts = (shopId, query) => repo.findProducts(shopId, {
  search: query.search || "",
  categoryId: query.categoryId,
  active: query.active === undefined ? undefined : query.active === "true",
});
export async function getProduct(shopId, id) {
  const item = await repo.findProduct(shopId, id);
  if (!item) throw new AppError("Product not found", 404);
  return item;
}
async function validateUnique(shopId, data, currentId) {
  const sku = data.sku && await repo.findProductBySku(shopId, data.sku);
  if (sku && sku.id !== currentId) throw new AppError("SKU already exists", 409);
  const barcode = data.barcode && await repo.findProductByBarcode(shopId, data.barcode);
  if (barcode && barcode.id !== currentId) throw new AppError("Barcode already exists", 409);
}
export async function addProduct(shopId, data) {
  if (!await repo.findCategory(shopId, data.categoryId)) throw new AppError("Category not found", 404);
  await validateUnique(shopId, data);
  return repo.transaction(async (tx) => {
    const sku = data.sku || await generateProductCode(tx, shopId);
    return tx.product.create({ data: { ...data, sku, shopId }, include: { category: true } });
  });
}
export async function editProduct(shopId, id, data) {
  const item = await getProduct(shopId, id);
  if (data.categoryId && !await repo.findCategory(shopId, data.categoryId)) throw new AppError("Category not found", 404);
  await validateUnique(shopId, data, item.id);
  return repo.updateProduct(item.id, data);
}
export async function toggleProduct(shopId, id) {
  const item = await getProduct(shopId, id);
  return repo.updateProduct(item.id, { active: !item.active });
}
export async function adjustProductStock(shopId, id, userId, data) {
  const item = await getProduct(shopId, id);
  return repo.transaction(async (tx) => {
    const changed = await tx.product.updateMany({
      where: { id: item.id, shopId, ...(data.quantity < 0 ? { stock: { gte: Math.abs(data.quantity) } } : {}) },
      data: { stock: { increment: data.quantity } },
    });
    if (changed.count !== 1) throw new AppError("Stock cannot be negative", 400);
    const product = await tx.product.findUnique({ where: { id: item.id }, include: { category: true } });
    await tx.stockMovement.create({ data: {
      shopId, productId: item.id, quantity: Math.abs(data.quantity),
      type: data.quantity > 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT",
      notes: data.notes, createdById: userId,
    }});
    return product;
  });
}

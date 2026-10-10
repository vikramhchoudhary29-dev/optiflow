import AppError from "../utils/AppError.js";
import { generatePurchaseCode } from "../utils/codeGenerator.js";
import * as repo from "../repositories/purchase.repository.js";

export async function createPurchaseService(shopId, userId, data) {
  return repo.transaction(async (tx) => {
    const supplier = await repo.findSupplier(tx, shopId, data.supplierId);
    if (!supplier) throw new AppError("Supplier not found", 404);
    const ids = [...new Set(data.items.map((item) => item.productId))];
    const products = await repo.findProducts(tx, shopId, ids);
    if (products.length !== ids.length) throw new AppError("One or more products were not found in this shop", 404);
    const byId = new Map(products.map((product) => [product.id, product]));
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0);
    const purchaseCode = await generatePurchaseCode(tx, shopId);
    const purchase = await tx.purchase.create({ data: {
      shopId, supplierId: supplier.id, supplierName: supplier.name, purchaseCode,
      invoiceNumber: purchaseCode, purchaseDate: data.purchaseDate || new Date(), totalAmount,
      purchaseitem: { create: data.items.map((item) => ({
        productId: item.productId, quantity: item.quantity, purchasePrice: item.purchasePrice,
        total: item.quantity * item.purchasePrice,
      })) },
    }});
    for (const item of data.items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity }, purchasePrice: item.purchasePrice } });
      await tx.stockMovement.create({ data: { shopId, productId: item.productId, type: "PURCHASE", quantity: item.quantity, referenceType: "PURCHASE", referenceId: purchase.id, createdById: userId } });
    }
    return tx.purchase.findUnique({ where: { id: purchase.id }, include: { supplier: true, purchaseitem: { include: { product: true } } } });
  });
}
export const getAllPurchasesService = (shopId, search = "") => repo.findAllPurchases(shopId, search);
export async function getPurchaseByIdService(shopId, id) { const item = await repo.findPurchaseById(shopId, id); if (!item) throw new AppError("Purchase not found", 404); return item; }
export async function updatePurchaseService(shopId, userId, id, data) {
  return repo.transactionPurchase(async (tx) => {
    const purchase = await tx.purchase.findFirst({ where: { id: Number(id), shopId }, include: { purchaseitem: true } });
    if (!purchase) throw new AppError("Purchase not found", 404);
    const supplier = await repo.findSupplier(tx, shopId, data.supplierId);
    if (!supplier) throw new AppError("Supplier not found", 404);
    const ids = [...new Set(data.items.map((item) => item.productId))];
    const products = await repo.findProducts(tx, shopId, ids);
    if (products.length !== ids.length) throw new AppError("One or more products were not found", 404);
    const deltas = new Map();
    purchase.purchaseitem.forEach((item) => { if (item.productId) deltas.set(item.productId, (deltas.get(item.productId) || 0) - item.quantity); });
    data.items.forEach((item) => deltas.set(item.productId, (deltas.get(item.productId) || 0) + item.quantity));
    const affectedIds = [...deltas.keys()];
    const affected = await tx.product.findMany({ where: { shopId, id: { in: affectedIds } } });
    affected.forEach((product) => { if (product.stock + (deltas.get(product.id) || 0) < 0) throw new AppError(`Cannot reduce ${product.name}; some purchased stock has already been sold`, 400); });
    await tx.purchaseitem.deleteMany({ where: { purchaseId: purchase.id } });
    await tx.stockMovement.deleteMany({ where: { shopId, referenceType: "PURCHASE", referenceId: purchase.id } });
    for (const product of affected) {
      const delta = deltas.get(product.id) || 0;
      if (delta) await tx.product.update({ where: { id: product.id }, data: { stock: { increment: delta } } });
    }
    for (const item of data.items) {
      await tx.product.update({ where: { id: item.productId }, data: { purchasePrice: item.purchasePrice } });
      await tx.stockMovement.create({ data: { shopId, productId: item.productId, type: "PURCHASE", quantity: item.quantity, referenceType: "PURCHASE", referenceId: purchase.id, createdById: userId, notes: "Purchase edited" } });
    }
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0);
    return tx.purchase.update({ where: { id: purchase.id }, data: { supplierId: supplier.id, supplierName: supplier.name, purchaseDate: data.purchaseDate || purchase.purchaseDate, totalAmount, purchaseitem: { create: data.items.map((item) => ({ productId: item.productId, quantity: item.quantity, purchasePrice: item.purchasePrice, total: item.quantity * item.purchasePrice })) } }, include: { supplier: true, purchaseitem: { include: { product: true } } } });
  });
}
export async function deletePurchaseService(shopId, id) {
  return repo.transactionPurchase(async (tx) => {
    const purchase = await tx.purchase.findFirst({ where: { id: Number(id), shopId }, include: { purchaseitem: { include: { product: true } } } });
    if (!purchase) throw new AppError("Purchase not found", 404);
    for (const item of purchase.purchaseitem) {
      if (item.product && item.product.stock < item.quantity) throw new AppError(`Cannot delete this purchase because ${item.product.name} stock has already been sold`, 400);
    }
    for (const item of purchase.purchaseitem) if (item.productId) await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
    await tx.stockMovement.deleteMany({ where: { shopId, referenceType: "PURCHASE", referenceId: purchase.id } });
    await tx.purchase.delete({ where: { id: purchase.id } });
  });
}

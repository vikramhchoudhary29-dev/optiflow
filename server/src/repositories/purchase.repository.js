import prisma from "../config/prisma.js";

export const transaction = (callback) => prisma.$transaction(callback,{isolationLevel:"Serializable"});
export const findSupplier = (tx, shopId, id) => tx.supplier.findFirst({ where: { id: Number(id), shopId, active: true } });
export const findProducts = (tx, shopId, ids) => tx.product.findMany({ where: { shopId, id: { in: ids }, active: true } });
export function findAllPurchases(shopId, search = "") {
  return prisma.purchase.findMany({
    where: { shopId, OR: [{ purchaseCode: { contains: search } }, { invoiceNumber: { contains: search } }, { supplier: { name: { contains: search } } }] },
    include: { supplier: true, purchaseitem: { include: { product: { include: { category: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}
export const findPurchaseById = (shopId, id) => prisma.purchase.findFirst({
  where: { id: Number(id), shopId },
  include: { shop: true, supplier: true, purchaseitem: { include: { product: { include: { category: true } } } } },
});
export const transactionPurchase = (callback) => prisma.$transaction(callback, { isolationLevel: "Serializable" });

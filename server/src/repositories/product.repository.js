import prisma from "../config/prisma.js";

export function findProducts(shopId, { search = "", categoryId, active } = {}) {
  return prisma.product.findMany({
    where: {
      shopId,
      ...(categoryId ? { categoryId: Number(categoryId) } : {}),
      ...(active === undefined ? {} : { active }),
      OR: [{ name: { contains: search } }, { sku: { contains: search } }, { brand: { contains: search } }, { barcode: { contains: search } }],
    },
    include: { category: true },
    orderBy: { name: "asc" },
  });
}
export const findProduct = (shopId, id) => prisma.product.findFirst({ where: { id: Number(id), shopId }, include: { category: true } });
export const findProductBySku = (shopId, sku) => prisma.product.findFirst({ where: { shopId, sku } });
export const findProductByBarcode = (shopId, barcode) => barcode ? prisma.product.findFirst({ where: { shopId, barcode } }) : null;
export const findCategory = (shopId, id) => prisma.category.findFirst({ where: { id: Number(id), shopId, active: true } });
export const createProduct = (shopId, data) => prisma.product.create({ data: { ...data, shopId }, include: { category: true } });
export const updateProduct = (id, data) => prisma.product.update({ where: { id: Number(id) }, data, include: { category: true } });
export const transaction = (callback) => prisma.$transaction(callback,{isolationLevel:"Serializable"});

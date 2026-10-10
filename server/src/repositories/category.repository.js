import prisma from "../config/prisma.js";

export function findCategories(shopId, search = "") {
  return prisma.category.findMany({
    where: { shopId, name: { contains: search } },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export function findCategory(shopId, id) {
  return prisma.category.findFirst({ where: { id: Number(id), shopId } });
}

export function findCategoryByName(shopId, name) {
  return prisma.category.findFirst({ where: { shopId, name } });
}

export function createCategory(shopId, data) {
  return prisma.category.create({ data: { ...data, shopId } });
}

export function updateCategory(id, data) {
  return prisma.category.update({ where: { id: Number(id) }, data });
}

export function deleteCategory(id) {
  return prisma.category.delete({ where: { id: Number(id) } });
}

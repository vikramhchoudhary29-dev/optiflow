import prisma from "../config/prisma.js";
export const findSuppliers = (shopId, search = "") => prisma.supplier.findMany({ where: { shopId, OR: [{ name: { contains: search } }, { mobile: { contains: search } }] }, orderBy: { name: "asc" } });
export const findSupplier = (shopId, id) => prisma.supplier.findFirst({ where: { shopId, id: Number(id) }, include: { _count: { select: { purchases: true } } } });
export const findByName = (shopId, name) => prisma.supplier.findFirst({ where: { shopId, name } });
export const createSupplier = (shopId, data) => prisma.supplier.create({ data: { shopId, ...data } });
export const updateSupplier = (id, data) => prisma.supplier.update({ where: { id: Number(id) }, data });
export const deleteSupplier = (id) => prisma.supplier.delete({ where: { id: Number(id) } });

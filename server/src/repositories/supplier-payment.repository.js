import prisma from "../config/prisma.js";

const include = {
  supplier: { select: { id: true, name: true, mobile: true, address: true } },
  createdBy: { select: { id: true, name: true } },
};
export const list = (shopId) => prisma.supplierPayment.findMany({ where: { shopId }, include, orderBy: { paymentDate: "desc" } });
export const find = (shopId, id) => prisma.supplierPayment.findFirst({ where: { shopId, id: Number(id) }, include: { ...include, shop: true } });
export const findSupplier = (shopId, id) => prisma.supplier.findFirst({ where: { shopId, id: Number(id), active: true } });
export const create = (shopId, userId, data) => prisma.supplierPayment.create({ data: { shopId, createdById: userId, ...data }, include });
export const update = (id, data) => prisma.supplierPayment.update({ where: { id: Number(id) }, data, include });
export const remove = (id) => prisma.supplierPayment.delete({ where: { id: Number(id) } });


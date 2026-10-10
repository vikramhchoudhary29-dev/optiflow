import prisma from "../config/prisma.js";

export const listTemplates = (shopId) => prisma.marketingTemplate.findMany({ where: { shopId, active: true }, orderBy: { name: "asc" } });
export const findTemplate = (shopId, id) => prisma.marketingTemplate.findFirst({ where: { shopId, id: Number(id), active: true } });
export const createTemplate = (shopId, data) => prisma.marketingTemplate.create({ data: { ...data, shopId } });
export const updateTemplate = (id, data) => prisma.marketingTemplate.update({ where: { id: Number(id) }, data });
export const deleteTemplate = (id) => prisma.marketingTemplate.delete({ where: { id: Number(id) } });
export const findCustomer = (shopId, id) => prisma.customer.findFirst({ where: { shopId, id: Number(id), active: true } });
export const findShop = (shopId) => prisma.shop.findUnique({ where: { id: shopId } });

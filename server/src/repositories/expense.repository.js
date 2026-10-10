import prisma from "../config/prisma.js";
export function findExpenses(shopId, { search = "", from, to } = {}) {
  return prisma.expense.findMany({ where: {
    shopId,
    OR: [{ category: { contains: search } }, { description: { contains: search } }],
    ...(from || to ? { expenseDate: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
  }, include: { createdBy: { select: { id: true, name: true } } }, orderBy: { expenseDate: "desc" } });
}
export const findExpense = (shopId, id) => prisma.expense.findFirst({ where: { shopId, id: Number(id) } });
export const createExpense = (shopId, userId, data) => prisma.expense.create({ data: { shopId, createdById: userId, category: "GENERAL", ...data } });
export const updateExpense = (id, data) => prisma.expense.update({ where: { id: Number(id) }, data });
export const deleteExpense = (id) => prisma.expense.delete({ where: { id: Number(id) } });

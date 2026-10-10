import AppError from "../utils/AppError.js"; import * as repo from "../repositories/expense.repository.js";
export const listExpenses = (shopId, query) => repo.findExpenses(shopId, query);
export async function getExpense(shopId,id){const item=await repo.findExpense(shopId,id);if(!item)throw new AppError("Expense not found",404);return item;}
export const addExpense = (shopId,userId,data) => repo.createExpense(shopId,userId,data);
export async function editExpense(shopId,id,data){const item=await getExpense(shopId,id);return repo.updateExpense(item.id,data);}
export async function removeExpense(shopId,id){const item=await getExpense(shopId,id);await repo.deleteExpense(item.id);}

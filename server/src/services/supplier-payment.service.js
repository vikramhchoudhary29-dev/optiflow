import AppError from "../utils/AppError.js";
import * as repo from "../repositories/supplier-payment.repository.js";

export const listPayments = (shopId) => repo.list(shopId);
export async function getPayment(shopId, id) { const row = await repo.find(shopId, id); if (!row) throw new AppError("Supplier payment not found", 404); return row; }
async function validateSupplier(shopId, supplierId) { if (!await repo.findSupplier(shopId, supplierId)) throw new AppError("Supplier not found", 404); }
export async function createPayment(shopId, userId, data) { await validateSupplier(shopId, data.supplierId); return repo.create(shopId, userId, data); }
export async function updatePayment(shopId, id, data) { await getPayment(shopId, id); await validateSupplier(shopId, data.supplierId); return repo.update(id, data); }
export async function deletePayment(shopId, id) { const row = await getPayment(shopId, id); await repo.remove(row.id); }


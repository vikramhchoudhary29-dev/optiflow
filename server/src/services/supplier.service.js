import AppError from "../utils/AppError.js";
import * as repo from "../repositories/supplier.repository.js";
export const listSuppliers = (shopId, search) => repo.findSuppliers(shopId, search);
export async function getSupplier(shopId, id) { const item = await repo.findSupplier(shopId, id); if (!item) throw new AppError("Supplier not found", 404); return item; }
export async function addSupplier(shopId, data) { if (await repo.findByName(shopId, data.name)) throw new AppError("Supplier name already exists", 409); return repo.createSupplier(shopId, data); }
export async function editSupplier(shopId, id, data) { const item = await getSupplier(shopId, id); const duplicate = data.name && await repo.findByName(shopId, data.name); if (duplicate && duplicate.id !== item.id) throw new AppError("Supplier name already exists", 409); return repo.updateSupplier(item.id, data); }
export async function removeSupplier(shopId, id) { const item = await getSupplier(shopId, id); if (item._count.purchases) throw new AppError("Cannot delete a supplier with purchases", 409); await repo.deleteSupplier(item.id); }

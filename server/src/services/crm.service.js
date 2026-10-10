import AppError from "../utils/AppError.js";
import * as repo from "../repositories/crm.repository.js";

export const getDashboard = (shopId) => repo.getDashboard(shopId);

export async function getCustomers(shopId, query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(10, Number(query.limit) || 50));
  const [items, total] = await repo.getCustomerList(shopId, { search: String(query.search || "").trim(), page, limit });
  return { items, page, limit, total, pages: Math.ceil(total / limit) };
}

export async function getCustomer360(shopId, id) {
  const customer = await repo.getCustomer360(shopId, Number(id));
  if (!customer) throw new AppError("Customer not found", 404);
  return customer;
}

export async function createActivity(shopId, createdById, data) {
  const customer = await repo.findCustomer(shopId, data.customerId);
  if (!customer) throw new AppError("Customer not found", 404);
  return repo.createActivity({ ...data, shopId, createdById: Number(createdById), dueDate: data.dueDate ? new Date(data.dueDate) : null, note: data.note || null });
}

export async function getActivities(shopId, query) {
  return repo.listActivities(shopId, { status: query.status || undefined, from: query.from ? new Date(query.from) : undefined, to: query.to ? new Date(query.to) : undefined });
}

export async function updateActivityStatus(shopId, id, status) {
  const activity = await repo.getActivity(shopId, Number(id));
  if (!activity) throw new AppError("CRM activity not found", 404);
  await repo.updateActivity(shopId, Number(id), { status, completedAt: status === "DONE" ? new Date() : null });
  return repo.getActivity(shopId, Number(id));
}

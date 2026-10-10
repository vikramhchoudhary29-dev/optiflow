import AppError from "../utils/AppError.js";
import * as repo from "../repositories/marketing.repository.js";

export const listTemplates = repo.listTemplates;
export const createTemplate = (shopId, data) => repo.createTemplate(shopId, data);
export async function updateTemplate(shopId, id, data) {
  const template = await repo.findTemplate(shopId, id);
  if (!template) throw new AppError("Marketing template not found", 404);
  return repo.updateTemplate(template.id, data);
}
export async function deleteTemplate(shopId, id) {
  const template = await repo.findTemplate(shopId, id);
  if (!template) throw new AppError("Marketing template not found", 404);
  await repo.deleteTemplate(template.id);
}
function personalize(message, customer, shop) {
  const values = {
    customerName: customer.name,
    customerMobile: customer.mobile,
    customerCity: customer.city || "",
    shopName: shop.shopName,
    shopMobile: shop.mobile,
  };
  return Object.entries(values).reduce((result, [placeholder, value]) => result.replaceAll(`{${placeholder}}`, value), message);
}
export async function buildLink(shopId, data) {
  const [customer, shop, template] = await Promise.all([
    repo.findCustomer(shopId, data.customerId), repo.findShop(shopId),
    data.templateId ? repo.findTemplate(shopId, data.templateId) : null,
  ]);
  if (!customer) throw new AppError("Customer not found", 404);
  if (!shop) throw new AppError("Shop not found", 404);
  if (data.templateId && !template) throw new AppError("Marketing template not found", 404);
  const message = personalize(data.message || template.message, customer, shop);
  let mobile = customer.mobile.replace(/\D/g, "");
  if (mobile.length === 10) mobile = `91${mobile}`;
  if (mobile.length < 10 || mobile.length > 15) throw new AppError(`Invalid WhatsApp number for ${customer.name}`, 400);
  return { customerId: customer.id, customerName: customer.name, message, url: `https://wa.me/${mobile}?text=${encodeURIComponent(message)}` };
}

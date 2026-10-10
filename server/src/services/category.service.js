import AppError from "../utils/AppError.js";
import * as categories from "../repositories/category.repository.js";

export const listCategories = (shopId, search) => categories.findCategories(shopId, search);

export async function getCategory(shopId, id) {
  const category = await categories.findCategory(shopId, id);
  if (!category) throw new AppError("Category not found", 404);
  return category;
}

export async function addCategory(shopId, data) {
  if (await categories.findCategoryByName(shopId, data.name)) {
    throw new AppError("Category name already exists", 409);
  }
  return categories.createCategory(shopId, data);
}

export async function editCategory(shopId, id, data) {
  const category = await getCategory(shopId, id);
  if (data.name && data.name !== category.name && await categories.findCategoryByName(shopId, data.name)) {
    throw new AppError("Category name already exists", 409);
  }
  return categories.updateCategory(category.id, data);
}

export async function removeCategory(shopId, id) {
  const category = await getCategory(shopId, id);
  const withCount = (await categories.findCategories(shopId)).find((item) => item.id === category.id);
  if (withCount?._count.products) {
    throw new AppError("Cannot delete a category that contains products", 409);
  }
  await categories.deleteCategory(category.id);
  return null;
}

import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import * as categoryService from "../services/category.service.js";

export const list = asyncHandler(async (req, res) => {
  const data = await categoryService.listCategories(req.user.shopId, req.query.search || "");
  successResponse(res, "Categories fetched successfully", data);
});

export const get = asyncHandler(async (req, res) => {
  const data = await categoryService.getCategory(req.user.shopId, req.params.id);
  successResponse(res, "Category fetched successfully", data);
});

export const create = asyncHandler(async (req, res) => {
  const data = await categoryService.addCategory(req.user.shopId, req.body);
  successResponse(res, "Category created successfully", data, 201);
});

export const update = asyncHandler(async (req, res) => {
  const data = await categoryService.editCategory(req.user.shopId, req.params.id, req.body);
  successResponse(res, "Category updated successfully", data);
});

export const remove = asyncHandler(async (req, res) => {
  await categoryService.removeCategory(req.user.shopId, req.params.id);
  successResponse(res, "Category deleted successfully");
});

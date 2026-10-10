import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import * as service from "../services/product.service.js";
export const list = asyncHandler(async (req, res) => successResponse(res, "Products fetched successfully", await service.listProducts(req.user.shopId, req.query)));
export const get = asyncHandler(async (req, res) => successResponse(res, "Product fetched successfully", await service.getProduct(req.user.shopId, req.params.id)));
export const create = asyncHandler(async (req, res) => successResponse(res, "Product created successfully", await service.addProduct(req.user.shopId, req.body), 201));
export const update = asyncHandler(async (req, res) => successResponse(res, "Product updated successfully", await service.editProduct(req.user.shopId, req.params.id, req.body)));
export const toggle = asyncHandler(async (req, res) => successResponse(res, "Product status updated successfully", await service.toggleProduct(req.user.shopId, req.params.id)));
export const adjustStock = asyncHandler(async (req, res) => successResponse(res, "Stock adjusted successfully", await service.adjustProductStock(req.user.shopId, req.params.id, req.user.userId, req.body)));

import asyncHandler from "../utils/asyncHandler.js"; import { successResponse } from "../utils/response.js"; import * as service from "../services/supplier.service.js";
export const list = asyncHandler(async (req,res) => successResponse(res,"Suppliers fetched successfully",await service.listSuppliers(req.user.shopId,req.query.search||"")));
export const get = asyncHandler(async (req,res) => successResponse(res,"Supplier fetched successfully",await service.getSupplier(req.user.shopId,req.params.id)));
export const create = asyncHandler(async (req,res) => successResponse(res,"Supplier created successfully",await service.addSupplier(req.user.shopId,req.body),201));
export const update = asyncHandler(async (req,res) => successResponse(res,"Supplier updated successfully",await service.editSupplier(req.user.shopId,req.params.id,req.body)));
export const remove = asyncHandler(async (req,res) => { await service.removeSupplier(req.user.shopId,req.params.id); successResponse(res,"Supplier deleted successfully"); });

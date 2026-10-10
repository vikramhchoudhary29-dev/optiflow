import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import * as service from "../services/loyalty.service.js";

export const getSetting = asyncHandler(async (req, res) => successResponse(res, "Loyalty setting fetched", await service.getSetting(req.user.shopId)));
export const updateSetting = asyncHandler(async (req, res) => successResponse(res, "Loyalty setting updated", await service.updateSetting(req.user.shopId, req.body)));
export const customerSummary = asyncHandler(async (req, res) => successResponse(res, "Customer loyalty fetched", await service.getCustomerSummary(req.user.shopId, req.params.customerId)));

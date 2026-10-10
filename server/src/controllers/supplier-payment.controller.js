import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import * as service from "../services/supplier-payment.service.js";
import receiptPdf from "../pdf/supplierPaymentReceipt.js";

export const list = asyncHandler(async (req, res) => successResponse(res, "Supplier payments fetched", await service.listPayments(req.user.shopId)));
export const get = asyncHandler(async (req, res) => successResponse(res, "Supplier payment fetched", await service.getPayment(req.user.shopId, req.params.id)));
export const create = asyncHandler(async (req, res) => successResponse(res, "Supplier payment recorded", await service.createPayment(req.user.shopId, req.user.userId, req.body), 201));
export const update = asyncHandler(async (req, res) => successResponse(res, "Supplier payment updated", await service.updatePayment(req.user.shopId, req.params.id, req.body)));
export const remove = asyncHandler(async (req, res) => { await service.deletePayment(req.user.shopId, req.params.id); successResponse(res, "Supplier payment deleted"); });
export const receipt = asyncHandler(async (req, res) => receiptPdf(res, await service.getPayment(req.user.shopId, req.params.id)));


import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/marketing.service.js";

const ok = (res, data, message = "Success", status = 200) => res.status(status).json({ success: true, message, data, errors: null });
export const list = asyncHandler(async (req, res) => ok(res, await service.listTemplates(req.user.shopId)));
export const create = asyncHandler(async (req, res) => ok(res, await service.createTemplate(req.user.shopId, req.body), "Template created", 201));
export const update = asyncHandler(async (req, res) => ok(res, await service.updateTemplate(req.user.shopId, req.params.id, req.body), "Template updated"));
export const remove = asyncHandler(async (req, res) => { await service.deleteTemplate(req.user.shopId, req.params.id); ok(res, null, "Template deleted"); });
export const link = asyncHandler(async (req, res) => ok(res, await service.buildLink(req.user.shopId, req.body)));

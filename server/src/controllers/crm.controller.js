import asyncHandler from "../utils/asyncHandler.js";
import * as service from "../services/crm.service.js";

export const dashboard = asyncHandler(async (req, res) => res.json({ success: true, data: await service.getDashboard(req.user.shopId) }));
export const customers = asyncHandler(async (req, res) => res.json({ success: true, data: await service.getCustomers(req.user.shopId, req.query) }));
export const customer360 = asyncHandler(async (req, res) => res.json({ success: true, data: await service.getCustomer360(req.user.shopId, req.params.id) }));
export const activities = asyncHandler(async (req, res) => res.json({ success: true, data: await service.getActivities(req.user.shopId, req.query) }));
export const createActivity = asyncHandler(async (req, res) => res.status(201).json({ success: true, data: await service.createActivity(req.user.shopId, req.user.userId, req.body) }));
export const updateActivityStatus = asyncHandler(async (req, res) => res.json({ success: true, data: await service.updateActivityStatus(req.user.shopId, req.params.id, req.body.status) }));

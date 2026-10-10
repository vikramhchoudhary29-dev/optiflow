import asyncHandler from"../../utils/asyncHandler.js";import{successResponse}from"../../utils/response.js";import*as s from"../../services/reports/reports.service.js";
export const getSalesSummaryController=asyncHandler(async(req,res)=>successResponse(res,"Sales report fetched successfully",await s.getSalesSummaryService(req.user.shopId,req.query)));
export const getPurchaseReportController=asyncHandler(async(req,res)=>successResponse(res,"Purchase report fetched successfully",await s.getPurchaseReportService(req.user.shopId,req.query)));
export const getExpenseReportController=asyncHandler(async(req,res)=>successResponse(res,"Expense report fetched successfully",await s.getExpenseReportService(req.user.shopId,req.query)));
export const getStockReportController=asyncHandler(async(req,res)=>successResponse(res,"Stock report fetched successfully",await s.getStockReportService(req.user.shopId)));
export const getLowStockReportController=asyncHandler(async(req,res)=>successResponse(res,"Low stock report fetched successfully",await s.getLowStockReportService(req.user.shopId)));
export const getCustomerReportController=asyncHandler(async(req,res)=>successResponse(res,"Customer report fetched successfully",await s.getCustomerReportService(req.user.shopId)));
export const getProfitReportController=asyncHandler(async(req,res)=>successResponse(res,"Profit report fetched successfully",await s.getProfitReportService(req.user.shopId,req.query)));
export const getDayBookController=asyncHandler(async(req,res)=>successResponse(res,"Day book fetched successfully",await s.getDayBookService(req.user.shopId,req.query)));

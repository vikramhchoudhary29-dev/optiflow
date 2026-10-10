import asyncHandler from "../utils/asyncHandler.js"; import { successResponse } from "../utils/response.js"; import * as s from "../services/expense.service.js";
export const list=asyncHandler(async(req,res)=>successResponse(res,"Expenses fetched successfully",await s.listExpenses(req.user.shopId,req.query)));
export const get=asyncHandler(async(req,res)=>successResponse(res,"Expense fetched successfully",await s.getExpense(req.user.shopId,req.params.id)));
export const create=asyncHandler(async(req,res)=>successResponse(res,"Expense created successfully",await s.addExpense(req.user.shopId,req.user.userId,req.body),201));
export const update=asyncHandler(async(req,res)=>successResponse(res,"Expense updated successfully",await s.editExpense(req.user.shopId,req.params.id,req.body)));
export const remove=asyncHandler(async(req,res)=>{await s.removeExpense(req.user.shopId,req.params.id);successResponse(res,"Expense deleted successfully");});

import generateInvoiceA4 from "../pdf/invoiceA4.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
  createInvoiceService,
  updateInvoiceService,
  getInvoicesService,
  getInvoiceByIdService,
   updatePaymentService,
   updateDeliveryStatusService,
   deleteInvoiceService,
} from "../services/invoice.service.js";

import { successResponse } from "../utils/response.js";

/* ============================================================
   CREATE
============================================================ */

export const createInvoiceController = asyncHandler(async (req, res) => {

  const invoice = await createInvoiceService(
    req.user.shopId,
    req.user.userId,
    req.body
  );

  successResponse(
    res,
    "Invoice created successfully",
    invoice,
    201
  );

});

/* ============================================================
   GET ALL
============================================================ */

export const getInvoicesController = asyncHandler(async (req, res) => {

  const search = req.query.search || "";

  const invoices = await getInvoicesService(
    req.user.shopId,
    search
  );

  successResponse(
    res,
    "Invoices fetched successfully",
    invoices
  );

});

/* ============================================================
   GET BY ID
============================================================ */

export const getInvoiceByIdController = asyncHandler(async (req, res) => {

  const invoice = await getInvoiceByIdService(
    req.user.shopId,
    req.params.id
  );

  successResponse(
    res,
    "Invoice fetched successfully",
    invoice
  );

});
/* ============================================================
   UPDATE PAYMENT
============================================================ */

export const updatePaymentController =
asyncHandler(async (req, res) => {

  const invoice =
    await updatePaymentService(
      req.user.shopId,
      req.params.id,
      req.body
    );

  successResponse(
    res,
    "Payment updated successfully",
    invoice
  );

});
/* ============================================================
   PDF A4
============================================================ */

export const printInvoiceA4Controller =
asyncHandler(async (req, res) => {

  const invoice =
    await getInvoiceByIdService(
      req.user.shopId,
      req.params.id
    );

  generateInvoiceA4(res, invoice);

});
export const updateInvoiceController=asyncHandler(async(req,res)=>successResponse(res,"Invoice updated successfully",await updateInvoiceService(req.user.shopId,req.user.userId,req.params.id,req.body)));
export const updateDeliveryStatusController=asyncHandler(async(req,res)=>successResponse(res,"Delivery status updated successfully",await updateDeliveryStatusService(req.user.shopId,req.params.id,req.body.status)));
export const deleteInvoiceController=asyncHandler(async(req,res)=>{await deleteInvoiceService(req.user.shopId,req.user.userId,req.params.id);successResponse(res,"Invoice deleted successfully");});

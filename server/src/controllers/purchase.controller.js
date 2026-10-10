import { successResponse } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";
import purchaseReceipt from "../pdf/purchaseReceipt.js";

import {
  createPurchaseService,
  getAllPurchasesService,
  getPurchaseByIdService,
  updatePurchaseService,
  deletePurchaseService,
} from "../services/purchase.service.js";

/* ============================================================
   CREATE
============================================================ */

export const createPurchaseController = asyncHandler(async (req, res) => {
  const purchase = await createPurchaseService(
    req.user.shopId,
    req.user.userId,
    req.body
  );

  successResponse(
    res,
    "Purchase created successfully",
    purchase,
    201
  );
});

/* ============================================================
   LIST
============================================================ */

export const getPurchasesController = asyncHandler(async (req, res) => {
  const purchases = await getAllPurchasesService(
    req.user.shopId,
    req.query.search || ""
  );

  successResponse(
    res,
    "Purchases fetched successfully",
    purchases
  );
});

/* ============================================================
   DETAILS
============================================================ */

export const getPurchaseByIdController = asyncHandler(async (req, res) => {
  const purchase = await getPurchaseByIdService(
    req.user.shopId,
    req.params.id
  );

  successResponse(
    res,
    "Purchase fetched successfully",
    purchase
  );
});
export const updatePurchaseController = asyncHandler(async (req, res) => successResponse(res, "Purchase updated successfully", await updatePurchaseService(req.user.shopId, req.user.userId, req.params.id, req.body)));
export const deletePurchaseController = asyncHandler(async (req, res) => { await deletePurchaseService(req.user.shopId, req.params.id); successResponse(res, "Purchase deleted successfully"); });
export const printPurchaseController = asyncHandler(async (req, res) => purchaseReceipt(res, await getPurchaseByIdService(req.user.shopId, req.params.id)));

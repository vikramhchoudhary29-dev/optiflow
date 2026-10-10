import asyncHandler from "../utils/asyncHandler.js";

import {
  createLensService,
  getAllLensesService,
  getLensByIdService,
  updateLensService,
  toggleLensStatusService,
} from "../services/lens.service.js";

import { successResponse } from "../utils/response.js";

/* ============================================================
   CREATE
============================================================ */

export const createLensController = asyncHandler(async (req, res) => {
  const lens = await createLensService(
    req.user.shopId,
    req.body
  );

  successResponse(
    res,
    "Lens created successfully",
    lens,
    201
  );
});

/* ============================================================
   LIST
============================================================ */

export const getAllLensesController = asyncHandler(async (req, res) => {
  const lenses = await getAllLensesService(
    req.user.shopId,
    req.query.search || ""
  );

  successResponse(
    res,
    "Lenses fetched successfully",
    lenses
  );
});

/* ============================================================
   GET BY ID
============================================================ */

export const getLensByIdController = asyncHandler(async (req, res) => {
  const lens = await getLensByIdService(
    req.user.shopId,
    req.params.id
  );

  successResponse(
    res,
    "Lens fetched successfully",
    lens
  );
});

/* ============================================================
   UPDATE
============================================================ */

export const updateLensController = asyncHandler(async (req, res) => {
  const lens = await updateLensService(
    req.user.shopId,
    req.params.id,
    req.body
  );

  successResponse(
    res,
    "Lens updated successfully",
    lens
  );
});

/* ============================================================
   ACTIVATE / DEACTIVATE
============================================================ */

export const toggleLensStatusController = asyncHandler(async (req, res) => {
  const lens = await toggleLensStatusService(
    req.user.shopId,
    req.params.id
  );

  successResponse(
    res,
    lens.active
      ? "Lens activated successfully"
      : "Lens deactivated successfully",
    lens
  );
});
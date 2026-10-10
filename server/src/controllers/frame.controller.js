import { successResponse } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
  createFrameService,
  getAllFramesService,
  getFrameByIdService,
  updateFrameService,
  toggleFrameStatusService,
} from "../services/frame.service.js";

/* ============================================================
   CREATE
============================================================ */

export const createFrameController = asyncHandler(async (req, res) => {
  const frame = await createFrameService(
    req.user.shopId,
    req.body
  );

 successResponse(
  res,
  "Frame created successfully",
  frame,
  201
);
});
/* ============================================================
   LIST
============================================================ */

export const getFramesController = asyncHandler(async (req, res) => {

  const search = req.query.search || "";

const frames = await getAllFramesService(
  req.user.shopId,
  req.query.search
);

 successResponse(
  res,
  "Frames fetched successfully",
  frames
);

});
/* ============================================================
   DETAILS
============================================================ */

export const getFrameByIdController = asyncHandler(async (req, res) => {
  const frame = await getFrameByIdService(
    req.user.shopId,
    req.params.id
  );

 successResponse(
  res,
  "Frame fetched successfully",
  frame
);
});
/* ============================================================
   UPDATE
============================================================ */

export const updateFrameController = asyncHandler(async (req, res) => {
  const frame = await updateFrameService(
    req.user.shopId,
    req.params.id,
    req.body
  );

successResponse(
  res,
  "Frame updated successfully",
  frame
);
});
/* ============================================================
   STATUS
============================================================ */

export const toggleFrameStatusController = asyncHandler(async (req, res) => {
  const frame = await toggleFrameStatusService(
    req.user.shopId,
    req.params.id
  );

  successResponse(
    res,
    "Frame status updated successfully",
    frame
  );
});
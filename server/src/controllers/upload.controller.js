import { uploadLogoService } from "../services/upload.service.js";

import { successResponse } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

/* ============================================================
   HEALTH
============================================================ */

export const uploadHealth = (req, res) => {

  return successResponse(
    res,
    "Upload module is working.",
    null
  );

};

/* ============================================================
   UPLOAD LOGO
============================================================ */

export const uploadLogoController = asyncHandler(
  async (req, res) => {

    const shopId = req.user.shopId;

    const settings = await uploadLogoService(
      shopId,
      req.file
    );

    return successResponse(
      res,
      "Logo uploaded successfully.",
      settings
    );

  }
);
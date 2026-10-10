import asyncHandler from "../../utils/asyncHandler.js";

import { successResponse } from "../../utils/response.js";

import {
  getSettingsService,
  updateSettingsService,
  getWhatsAppLinkService,
} from "../../services/settings/settings.service.js";

/* ============================================================
   GET SETTINGS
============================================================ */

export const getSettingsController =
asyncHandler(async (req, res) => {

  const settings = await getSettingsService(
    req.user.shopId
  );

  successResponse(
    res,
    "Settings fetched successfully",
    settings
  );

});

/* ============================================================
   UPDATE SETTINGS
============================================================ */

export const updateSettingsController =
asyncHandler(async (req, res) => {

  const settings =
    await updateSettingsService(
      req.user.shopId,
      req.body
    );

  successResponse(
    res,
    "Settings updated successfully",
    settings
  );

});
export const getWhatsAppLinkController=asyncHandler(async(req,res)=>{const data=await getWhatsAppLinkService(req.user.shopId,req.params.invoiceId);if(!data)return res.status(404).json({success:false,message:"Invoice not found",data:null,errors:[]});successResponse(res,"WhatsApp link generated",data);});

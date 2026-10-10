import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { getPrescriptionsService } from "../services/prescription.service.js";




import {
  loginPlatformAdmin,
  getProfile,
  getDashboard,
  createShop,
  getAllShops,
  getShopById,
  editShop,
  setShopStatus,
  removeShop,
  startTrial,
  activateSubscription,
  resetOwnerPassword,
} from "../services/platform.service.js";

/* ============================================================
   LOGIN
============================================================ */

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await loginPlatformAdmin(email, password);

  res.json({
    success: true,
    message: "Login successful",
    data: result,
    errors: null,
  });
});

/* ============================================================
   PROFILE
============================================================ */

export const profile = asyncHandler(async (req, res) => {
  const admin = await getProfile(req.user.id);

  res.json({
    success: true,
    message: "Profile fetched successfully",
    data: admin,
    errors: null,
  });
});

/* ============================================================
   DASHBOARD
============================================================ */

export const dashboard = asyncHandler(async (req, res) => {
  const data = await getDashboard();

  res.json({
    success: true,
    message: "Dashboard loaded",
    data,
    errors: null,
  });
});

/* ============================================================
   CREATE SHOP
============================================================ */

export const createShopController = asyncHandler(async (req, res) => {
  const result = await createShop(req.body);

  res.status(201).json({
    success: true,
    message: "Shop created successfully",
    data: result,
    errors: null,
  });
});

/* ============================================================
   LIST SHOPS
============================================================ */

export const getAllShopsController = asyncHandler(async (req, res) => {
  const shops = await getAllShops();

  res.json({
    success: true,
    message: "Shops fetched successfully",
    data: shops,
    errors: null,
  });
});

/* ============================================================
   SHOP DETAILS
============================================================ */

export const getShopByIdController = asyncHandler(async (req, res) => {
  const shop = await getShopById(req.params.id);

  if (!shop) {
    throw new AppError("Shop not found", 404);
  }

  res.json({
    success: true,
    message: "Shop fetched successfully",
    data: shop,
    errors: null,
  });
});
export const getPrescriptionsController = asyncHandler(async (req, res) => {

  const search = req.query.search || "";

  const prescriptions = await getPrescriptionsService(
    req.user.shopId,
    search
  );

  res.json({
    success: true,
    message: "Prescriptions fetched successfully",
    data: prescriptions,
    errors: null,
  });

});
export const updateShopController = asyncHandler(async (req,res)=>res.json({success:true,message:"Shop updated successfully",data:await editShop(req.params.id,req.body),errors:null}));
export const updateShopStatusController = asyncHandler(async (req,res)=>res.json({success:true,message:`Shop ${req.body.status?"activated":"deactivated"} successfully`,data:await setShopStatus(req.params.id,req.body.status),errors:null}));
export const deleteShopController = asyncHandler(async (req,res)=>{await removeShop(req.params.id);res.json({success:true,message:"Shop deleted successfully",data:null,errors:null});});
export const startTrialController = asyncHandler(async(req,res)=>res.status(201).json({success:true,message:"Trial started successfully",data:await startTrial(req.params.id,req.body.days),errors:null}));
export const activateSubscriptionController = asyncHandler(async(req,res)=>res.status(201).json({success:true,message:"Subscription activated successfully",data:await activateSubscription(req.params.id,req.body),errors:null}));
export const resetOwnerPasswordController = asyncHandler(async(req,res)=>{await resetOwnerPassword(req.params.id,req.body.password);res.json({success:true,message:"Owner password reset successfully",data:null,errors:null});});

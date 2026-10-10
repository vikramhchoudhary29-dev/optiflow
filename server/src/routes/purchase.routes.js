import express from "express";

import {
  createPurchaseController,
  getPurchasesController,
  getPurchaseByIdController,
  updatePurchaseController,
  deletePurchaseController,
  printPurchaseController,
} from "../controllers/purchase.controller.js";

import { validate } from "../middlewares/validate.middleware.js";
import { requireShopUser, requirePermission } from "../middlewares/auth.middleware.js";
import {
  createPurchaseSchema,
  updatePurchaseSchema,
} from "../validations/purchase.validation.js";

const router = express.Router();

/* ============================================================
   HEALTH
============================================================ */

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Purchase API Working",
  });
});

/* ============================================================
   LIST
============================================================ */

router.get(
  "/",
requireShopUser,
  requirePermission("purchases", "view"),
  getPurchasesController
);

/* ============================================================
   DETAILS
============================================================ */

router.get(
  "/:id",
  requireShopUser,
  requirePermission("purchases", "view"),
  getPurchaseByIdController
);

/* ============================================================
   CREATE
============================================================ */

router.post(
  "/",
  requireShopUser,
  requirePermission("purchases", "create"),
  validate(createPurchaseSchema),
  createPurchaseController
);
router.get("/:id/print", requireShopUser, requirePermission("purchases", "view"), printPurchaseController);
router.put("/:id", requireShopUser, requirePermission("purchases", "edit"), validate(updatePurchaseSchema), updatePurchaseController);
router.delete("/:id", requireShopUser, requirePermission("purchases", "delete"), deletePurchaseController);

export default router;

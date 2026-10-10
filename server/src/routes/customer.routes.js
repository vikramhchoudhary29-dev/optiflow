import { Router } from "express";

import shopAuth from "../middlewares/shopAuth.middleware.js";
import { requirePermission } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createCustomerController,
  getCustomersController,
  getCustomerByIdController,
  getCustomerProfileController,
  updateCustomerController,
    updateCustomerStatusController,
} from "../controllers/customer.controller.js";

import { createCustomerSchema } from "../validations/customer.validation.js";



const router = Router();

/* ===============================
   HEALTH
================================ */

router.get("/health", (req, res) => {
  res.json({
    success: true,
    module: "Customer",
    status: "OK",
  });
});

router.get(
  "/",
  shopAuth,
  requirePermission("customers", "view"),
  getCustomersController
);

router.get(
  "/:id/profile",
  shopAuth,
  requirePermission("customers", "view"),
  getCustomerProfileController
);

router.get(
  "/:id",
  shopAuth,
  requirePermission("customers", "view"),
  getCustomerByIdController
);

router.put(
  "/:id",
  shopAuth,
  requirePermission("customers", "edit"),
  validate(createCustomerSchema),
  updateCustomerController
);

router.patch(
  "/:id/status",
  shopAuth,
  requirePermission("customers", "delete"),
  updateCustomerStatusController
);

/* ===============================
   CREATE CUSTOMER
================================ */

router.post(
  "/",
  shopAuth,
  requirePermission("customers", "create"),
  validate(createCustomerSchema),
  createCustomerController
);

export default router;

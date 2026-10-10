import { Router } from "express";

import shopAuth from "../middlewares/shopAuth.middleware.js";
import { requirePermission } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createInvoiceController,
  updateInvoiceController,
  getInvoicesController,
  getInvoiceByIdController,
    updatePaymentController,
     printInvoiceA4Controller,
     updateDeliveryStatusController,
     deleteInvoiceController,
} from "../controllers/invoice.controller.js";

import { createInvoiceSchema, updateInvoiceSchema } from "../validations/invoice.validation.js";
import { deliveryStatusSchema } from "../validations/invoice.validation.js";
import { updatePaymentSchema } from "../validations/payment.validation.js";
const router = Router();

/* ============================================================
   HEALTH
============================================================ */

router.get("/health", (req, res) => {
  res.json({
    success: true,
    module: "Invoice",
    status: "OK",
  });
});

/* ============================================================
   GET ALL INVOICES
============================================================ */

router.get(
  "/",
  shopAuth,
  requirePermission("sales", "view"),
  getInvoicesController
);

/* ============================================================
   GET INVOICE BY ID
============================================================ */

router.get(
  "/:id",
  shopAuth,
  requirePermission("sales", "view"),
  getInvoiceByIdController
);

router.get(
  "/:id/pdf/a4",
  shopAuth,
  requirePermission("sales", "view"),
  printInvoiceA4Controller
);
/* ============================================================
   CREATE INVOICE
============================================================ */

router.post(
  "/",
  shopAuth,
  requirePermission("sales", "create"),
  validate(createInvoiceSchema),
  createInvoiceController
);

router.patch(
  "/:id/payment",
  shopAuth,
  requirePermission("payments", "edit"),
  validate(updatePaymentSchema),
  updatePaymentController
);
router.put("/:id",shopAuth,requirePermission("sales","edit"),validate(updateInvoiceSchema),updateInvoiceController);
router.patch("/:id/delivery-status",shopAuth,requirePermission("sales","edit"),validate(deliveryStatusSchema),updateDeliveryStatusController);
router.delete("/:id",shopAuth,requirePermission("sales","delete"),deleteInvoiceController);
export default router;

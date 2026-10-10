import { Router } from "express";

import shopAuth from "../middlewares/shopAuth.middleware.js";
import { requirePermission } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createPrescriptionController,
  getPrescriptionsController,
  getPrescriptionByIdController,
  updatePrescriptionController,
    updatePrescriptionStatusController,
      getCustomerPrescriptionHistoryController,
      printPrescriptionA4Controller,
      printBulkPrescriptionsA4Controller,
      deletePrescriptionController,
} from "../controllers/prescription.controller.js";
import { createPrescriptionSchema } from "../validations/prescription.validation.js";

const router = Router();

/* ==============================
   HEALTH
================================ */

router.get("/health", (req, res) => {
  res.json({
    success: true,
    module: "Prescription",
    status: "OK",
  });
});

router.get(
  "/",
  shopAuth,
  requirePermission("prescriptions", "view"),
  getPrescriptionsController
);

router.get(
  "/customer/:customerId",
  shopAuth,
  requirePermission("prescriptions", "view"),
  getCustomerPrescriptionHistoryController
);


router.patch(
  "/:id/status",
  shopAuth,
  requirePermission("prescriptions", "edit"),
  updatePrescriptionStatusController
);

router.get(
  "/:id/pdf/a4",
  shopAuth,
  requirePermission("prescriptions", "view"),
  printPrescriptionA4Controller
);

router.post(
  "/pdf/a4/bulk",
  shopAuth,
  requirePermission("prescriptions", "view"),
  printBulkPrescriptionsA4Controller
);

router.get(
  "/:id",
  shopAuth,
  requirePermission("prescriptions", "view"),
  getPrescriptionByIdController
);
router.put(
  "/:id",
  shopAuth,
  requirePermission("prescriptions", "edit"),
  validate(createPrescriptionSchema),
  updatePrescriptionController
);
router.delete("/:id",shopAuth,requirePermission("prescriptions","delete"),deletePrescriptionController);
/* ===============================
   CREATE PRESCRIPTION
================================ */

router.post(
  "/",
  shopAuth,
  requirePermission("prescriptions", "create"),
  validate(createPrescriptionSchema),
  createPrescriptionController
);

export default router;

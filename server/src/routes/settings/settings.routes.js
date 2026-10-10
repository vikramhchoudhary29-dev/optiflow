import { Router } from "express";

import shopAuth from "../../middlewares/shopAuth.middleware.js";
import { requirePermission } from "../../middlewares/auth.middleware.js";

import { validate } from "../../middlewares/validate.middleware.js";
import {
  getSettingsController,
  updateSettingsController,
  getWhatsAppLinkController,
} from "../../controllers/settings/settings.controller.js";

import {
  updateSettingsSchema,
} from "../../validations/settings.validation.js";

const router = Router();

/* ============================================================
   HEALTH
============================================================ */

router.get("/health", (req, res) => {

  res.json({
    success: true,
    module: "Settings",
    status: "OK",
  });

});

/* ============================================================
   GET SETTINGS
============================================================ */

router.get(
  "/",
  shopAuth,
  requirePermission("settings", "view"),
  getSettingsController
);
router.get("/whatsapp/:invoiceId",shopAuth,requirePermission("sales","view"),getWhatsAppLinkController);

/* ============================================================
   UPDATE SETTINGS
============================================================ */

router.put(
  "/",
  shopAuth,
  requirePermission("settings", "edit"),
  validate(updateSettingsSchema),
  updateSettingsController
);

export default router;

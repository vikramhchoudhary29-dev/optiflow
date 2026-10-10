import { Router } from "express";

import {
  uploadHealth,
  uploadLogoController,
} from "../../controllers/upload.controller.js";

import { requireShopUser, requirePermission } from "../../middlewares/auth.middleware.js";
import uploadLogo from "../../middlewares/upload.middleware.js";

const router = Router();

/* ============================================================
   HEALTH
============================================================ */

router.get(
  "/health",
  uploadHealth
);

/* ============================================================
   UPLOAD LOGO
============================================================ */

router.post(
  "/logo",
  requireShopUser,
  requirePermission("settings", "edit"),
  uploadLogo.single("logo"),
  uploadLogoController
);

export default router;

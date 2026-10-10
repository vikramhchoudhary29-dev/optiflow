import { Router } from "express";

import shopAuth from "../../middlewares/shopAuth.middleware.js";
import { requirePermission } from "../../middlewares/auth.middleware.js";

import {
  getDashboardSummaryController,
  getDashboardAnnouncementsController,
} from "../../controllers/dashboard/dashboard.controller.js";

const router = Router();

/* ============================================================
   DASHBOARD SUMMARY
============================================================ */

router.get(
  "/",
  shopAuth,
  requirePermission("dashboard", "view"),
  getDashboardSummaryController
);
router.get("/announcements", shopAuth, requirePermission("dashboard", "view"), getDashboardAnnouncementsController);

export default router;

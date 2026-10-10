import { Router } from "express";

import shopAuth from "../../middlewares/shopAuth.middleware.js";
import { requirePermission } from "../../middlewares/auth.middleware.js";

import {
  getSalesSummaryController,
  getStockReportController,
  getLowStockReportController,
  getProfitReportController,
  getPurchaseReportController,
  getExpenseReportController,
  getCustomerReportController,
  getDayBookController,
} from "../../controllers/reports/reports.controller.js";

const router = Router();

/* ============================================================
   HEALTH
============================================================ */

router.get("/health", (req, res) => {

  res.json({
    success: true,
    module: "Reports",
    status: "OK",
  });

});

/* ============================================================
   SALES REPORT
============================================================ */

router.get(
  "/sales",
  shopAuth,
  requirePermission("reports", "view"),
  getSalesSummaryController
);

/* ============================================================
   STOCK REPORT
============================================================ */

router.get(
  "/stock",
  shopAuth,
  requirePermission("reports", "view"),
  getStockReportController
);

/* ============================================================
   LOW STOCK REPORT
============================================================ */

router.get(
  "/low-stock",
  shopAuth,
  requirePermission("reports", "view"),
  getLowStockReportController
);

/* ============================================================
   PROFIT REPORT
============================================================ */

router.get(
  "/profit",
  shopAuth,
  requirePermission("reports", "view"),
  getProfitReportController
);
router.get("/purchases",shopAuth,requirePermission("reports","view"),getPurchaseReportController);
router.get("/expenses",shopAuth,requirePermission("reports","view"),getExpenseReportController);
router.get("/customers",shopAuth,requirePermission("reports","view"),getCustomerReportController);
router.get("/day-book",shopAuth,requirePermission("reports","view"),getDayBookController);

export default router;

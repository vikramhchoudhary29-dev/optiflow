import { Router } from "express";
import { requireShopUser, requirePermission } from "../../middlewares/auth.middleware.js";
import { downloadInvoicePdf } from "../../controllers/pdf.controller.js";

const router = Router();

router.get(
  "/invoice/:invoiceId",
  requireShopUser,
  requirePermission("sales", "view"),
  downloadInvoicePdf
);

export default router;

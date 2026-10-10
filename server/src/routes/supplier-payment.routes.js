import { Router } from "express";
import * as controller from "../controllers/supplier-payment.controller.js";
import { requireShopUser, requirePermission } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { supplierPaymentSchema } from "../validations/supplier-payment.validation.js";

const router = Router();
router.use(requireShopUser);
router.get("/", requirePermission("payments", "view"), controller.list);
router.get("/:id", requirePermission("payments", "view"), controller.get);
router.get("/:id/receipt", requirePermission("payments", "view"), controller.receipt);
router.post("/", requirePermission("payments", "create"), validate(supplierPaymentSchema), controller.create);
router.put("/:id", requirePermission("payments", "edit"), validate(supplierPaymentSchema), controller.update);
router.delete("/:id", requirePermission("payments", "delete"), controller.remove);
export default router;

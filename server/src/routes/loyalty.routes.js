import { Router } from "express";
import * as controller from "../controllers/loyalty.controller.js";
import { requirePermission, requireShopUser } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loyaltySettingSchema } from "../validations/loyalty.validation.js";

const router = Router();
router.use(requireShopUser);
router.get("/settings", requirePermission("settings", "view"), controller.getSetting);
router.put("/settings", requirePermission("settings", "edit"), validate(loyaltySettingSchema), controller.updateSetting);
router.get("/customers/:customerId", requirePermission("sales", "view"), controller.customerSummary);
export default router;

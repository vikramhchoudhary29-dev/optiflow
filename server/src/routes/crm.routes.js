import { Router } from "express";
import shopAuth from "../middlewares/shopAuth.middleware.js";
import { requirePermission } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import * as controller from "../controllers/crm.controller.js";
import { activityCreateSchema, activityStatusSchema } from "../validations/crm.validation.js";

const router = Router();
router.use(shopAuth, requirePermission("crm", "view"));
router.get("/dashboard", controller.dashboard);
router.get("/customers", controller.customers);
router.get("/customers/:id", controller.customer360);
router.get("/activities", controller.activities);
router.post("/activities", requirePermission("crm", "create"), validate(activityCreateSchema), controller.createActivity);
router.patch("/activities/:id/status", requirePermission("crm", "edit"), validate(activityStatusSchema), controller.updateActivityStatus);
export default router;

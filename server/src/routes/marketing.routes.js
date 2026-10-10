import { Router } from "express";
import * as controller from "../controllers/marketing.controller.js";
import { requirePermission, requireShopUser } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { marketingLinkSchema, templateSchema, updateTemplateSchema } from "../validations/marketing.validation.js";

const router = Router();
router.use(requireShopUser);
router.get("/templates", requirePermission("marketing", "view"), controller.list);
router.post("/templates", requirePermission("marketing", "create"), validate(templateSchema), controller.create);
router.put("/templates/:id", requirePermission("marketing", "edit"), validate(updateTemplateSchema), controller.update);
router.delete("/templates/:id", requirePermission("marketing", "delete"), controller.remove);
router.post("/link", requirePermission("marketing", "view"), validate(marketingLinkSchema), controller.link);
export default router;

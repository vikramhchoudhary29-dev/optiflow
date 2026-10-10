import { Router } from "express";
import * as controller from "../controllers/category.controller.js";
import { requireShopUser, requirePermission } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createCategorySchema, updateCategorySchema } from "../validations/category.validation.js";

const router = Router();
router.use(requireShopUser);
router.get("/", requirePermission("categories", "view"), controller.list);
router.get("/:id", requirePermission("categories", "view"), controller.get);
router.post("/", requirePermission("categories", "create"), validate(createCategorySchema), controller.create);
router.put("/:id", requirePermission("categories", "edit"), validate(updateCategorySchema), controller.update);
router.delete("/:id", requirePermission("categories", "delete"), controller.remove);
export default router;

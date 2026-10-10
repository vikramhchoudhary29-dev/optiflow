import { Router } from "express";

import { login } from "../controllers/shop.controller.js";
import { endSupport } from "../controllers/platform-admin.controller.js";
import { requireShopUser } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import shopAuth from "../middlewares/shopAuth.middleware.js";
import { shopLoginSchema } from "../validations/shop.validation.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    module: "Shop",
    status: "OK",
  });
});

router.post("/login", validate(shopLoginSchema), login);
router.post("/support/end", requireShopUser, endSupport);

router.get("/profile", shopAuth, (req, res) => {
  res.json({
    success: true,
    message: "Profile loaded",
    data: req.user,
    errors: null,
  });
});

export default router;

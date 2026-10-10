import { Router } from "express";

import shopAuth from "../middlewares/shopAuth.middleware.js";
import { requirePermission } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createFrameController,
  getFramesController,
  getFrameByIdController,
  updateFrameController,
   toggleFrameStatusController,
} from "../controllers/frame.controller.js";

import {
  createFrameSchema,
  updateFrameSchema,
} from "../validations/frame.validation.js";

const router = Router();

/* ============================================================
   Health
============================================================ */

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Frame API Working",
  });
});

/* ============================================================
   List
============================================================ */

router.get(
  "/",
  shopAuth,
  requirePermission("products", "view"),
  getFramesController
);

/* ============================================================
   Details
============================================================ */

router.get(
  "/:id",
  shopAuth,
  requirePermission("products", "view"),
  getFrameByIdController
);

/* ============================================================
   Create
============================================================ */

router.post(
  "/",
  shopAuth,
  requirePermission("products", "create"),
  validate(createFrameSchema),
  createFrameController
);

/* ============================================================
   Update
============================================================ */

router.put(
  "/:id",
  shopAuth,
  requirePermission("products", "edit"),
  validate(updateFrameSchema),
  updateFrameController
);

router.patch(
  "/:id/status",
  shopAuth,
  requirePermission("products", "edit"),
  toggleFrameStatusController
);

export default router;
